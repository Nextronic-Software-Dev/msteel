"use server"

import { createHash } from "crypto"
import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getServerSession } from "./auth"
import { db } from "./db"
import { MAX_IMPORT_ROWS, MAX_MATCH_CELLS, matchMachineRecords, type ImportRequest, type ImportPreview } from "./id-import"

const requestSchema = z.object({
  toleranceSeconds: z.number().int().min(0).max(900),
  records: z.array(z.object({
    row: z.number().int().positive(),
    customId: z.string().trim().min(1).max(200),
    timestamp: z.string().datetime({ offset: true }).refine(value => {
      const year = new Date(value).getUTCFullYear()
      return year >= 1900 && year <= 2200
    }),
  })).min(1).max(MAX_IMPORT_ROWS),
}).refine(input => new Set(input.records.map(record => record.row)).size === input.records.length)

async function buildPreview(client: Prisma.TransactionClient, input: ImportRequest): Promise<ImportPreview> {
  const times = input.records.map(record => Date.parse(record.timestamp))
  const tolerance = input.toleranceSeconds * 1000
  const limit = Math.floor(MAX_MATCH_CELLS / (input.records.length + 1)) - 1
  // Include identified/sent events: removing them would shift the sequence.
  const events = await client.processedImage.findMany({
    where: { createdAt: { gte: new Date(Math.min(...times)), lte: new Date(Math.max(...times) + tolerance) } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: limit + 1,
    select: { id: true, createdAt: true, updatedAt: true, customId: true, sent: true },
  })
  if (events.length > limit) throw new Error("Trop de données à comparer. Importez une période plus courte.")
  const usedIds = await client.processedImage.findMany({
    where: { customId: { in: input.records.map(record => record.customId) } },
    orderBy: { id: "asc" },
    select: { id: true, customId: true },
  })
  const matches = matchMachineRecords(input.records, events.map(event => ({
    ...event, createdAt: event.createdAt.toISOString(), updatedAt: event.updatedAt.toISOString(),
  })), input.toleranceSeconds, usedIds)
  // Detect changes anywhere in the compared sequence, including newly received events.
  const fingerprint = createHash("sha256").update(JSON.stringify({ input, events, usedIds, matches })).digest("hex")
  return { matches, fingerprint }
}

export async function previewIdImport(request: ImportRequest) {
  if (!await getServerSession()) return { success: false as const, error: "Veuillez vous connecter." }
  const parsed = requestSchema.safeParse(request)
  if (!parsed.success) return { success: false as const, error: "Données d’import invalides (2 000 lignes maximum)." }
  try {
    const preview = await db.$transaction(client => buildPreview(client, parsed.data), {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, timeout: 30000,
    })
    return { success: true as const, preview }
  } catch (error) {
    console.error("Import preview failed", error)
    return { success: false as const, error: error instanceof Error && !(error instanceof Prisma.PrismaClientKnownRequestError) ? error.message : "Impossible de préparer l’import." }
  }
}

export async function applyIdImport(request: ImportRequest, fingerprint: string) {
  if (!await getServerSession()) return { success: false as const, error: "Veuillez vous connecter." }
  const parsed = requestSchema.safeParse(request)
  if (!parsed.success || !/^[a-f0-9]{64}$/.test(fingerprint)) return { success: false as const, error: "Données d’import invalides." }
  try {
    const count = await db.$transaction(async client => {
      const current = await buildPreview(client, parsed.data)
      if (current.fingerprint !== fingerprint) throw new Error("Les données ont changé. Recalculez l’aperçu avant d’importer.")
      const ready = current.matches.filter(match => match.status === "ready")
      for (const match of ready) {
        const result = await client.processedImage.updateMany({
          where: { id: match.eventId!, sent: false, OR: [{ customId: null }, { customId: "" }] },
          data: { customId: match.customId },
        })
        if (result.count !== 1) throw new Error("Un ID a été modifié. Recalculez l’aperçu avant d’importer.")
      }
      return ready.length
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 })
    revalidatePath("/")
    return { success: true as const, count }
  } catch (error) {
    console.error("ID import failed", error)
    const message = error instanceof Prisma.PrismaClientKnownRequestError
      ? error.code === "P2034" ? "Les données ont changé. Recalculez l’aperçu avant d’importer." : "Impossible d’enregistrer l’import. Aucun ID n’a été modifié."
      : error instanceof Error ? error.message : "Impossible d’enregistrer l’import."
    return { success: false as const, error: message }
  }
}
