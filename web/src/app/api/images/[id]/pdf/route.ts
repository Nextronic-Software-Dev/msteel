import { readFile } from "fs/promises"
import path from "path"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { createMeasurementPdf } from "@/lib/measurement-pdf"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const id = Number.parseInt(params.id, 10)
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 })
  const image = await db.processedImage.findUnique({ where: { id } })
  if (!image) return NextResponse.json({ error: "Pièce introuvable" }, { status: 404 })

  let sourceImage: Buffer | null = null
  try {
    const filename = path.basename(image.imagePath)
    sourceImage = await readFile(path.join(process.cwd(), "public", "images", filename))
  } catch {
    sourceImage = null
  }

  const pdf = await createMeasurementPdf(image, sourceImage)
  const reference = (image.customId || `piece-${image.id}`).replace(/[^a-zA-Z0-9_-]/g, "-")
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="fiche-${reference}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  })
}
