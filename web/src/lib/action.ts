"use server"

import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { db } from "./db"
export async function updateCustomId(imagePath: string, customId: string) {
  try {
    if (!imagePath) {
      return { success: false, error: "ImagePath manquant" }
    }

    const updatedImage = await db.processedImage.updateMany({
      where: { imagePath },
      data: { customId: customId || null }
    })

    if (updatedImage.count === 0) {
      return { success: false, error: "Image non trouvée" }
    }

    revalidatePath("/")
    return { success: true, message: "ID personnalisé mis à jour" }
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error)
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}
export async function saveImageData(formData: FormData) {
  try {
    const customId = formData.get("customId") as string
    const imagePath = formData.get("imagePath") as string
    const l1 = Number.parseFloat(formData.get("l1") as string)
    const l2 = Number.parseFloat(formData.get("l2") as string)
    const l3 = Number.parseFloat(formData.get("l3") as string)
    const l4 = Number.parseFloat(formData.get("l4") as string)
    const l5 = Number.parseFloat(formData.get("l5") as string)
    const w1 = Number.parseFloat(formData.get("w1") as string)
    const w2 = Number.parseFloat(formData.get("w2") as string)
    const w3 = Number.parseFloat(formData.get("w3") as string)

    await db.processedImage.create({
      data: {
        customId: customId || null,
        imagePath,
        l1,
        l2,
        l3,
        l4,
        l5,
        w1,
        w2,
        w3,
      },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error)
    return { success: false, error: "Erreur lors de la sauvegarde" }
  }
}
export async function getImages() {
  try {
    const images = await db.processedImage.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { 
      success: true, 
      images,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des images:", error)
    return { 
      success: false, 
      images: [],
      error: 'Erreur lors de la récupération des images'
    }
  }
}
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 100

export type ImageFilters = {
  query?: string
  status?: "all" | "identified" | "unidentified" | "sent" | "ready"
}

export async function getImagesPage(page = 1, pageSize = DEFAULT_PAGE_SIZE, filters: ImageFilters = {}) {
  try {
    const safePage = Math.max(1, Math.floor(page) || 1)
    const safePageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize) || DEFAULT_PAGE_SIZE))
    const query = filters.query?.trim()
    const where: Prisma.ProcessedImageWhereInput = {}
    if (query) {
      const numericId = Number.parseInt(query, 10)
      where.OR = [
        { customId: { contains: query, mode: "insensitive" } },
        { imagePath: { contains: query, mode: "insensitive" } },
        ...(Number.isFinite(numericId) ? [{ id: numericId }] : []),
      ]
    }
    if (filters.status === "identified") where.customId = { not: null }
    if (filters.status === "unidentified") where.customId = null
    if (filters.status === "sent") where.sent = true
    if (filters.status === "ready") Object.assign(where, { sent: false, customId: { not: null } })
    const [images, total] = await db.$transaction([
      db.processedImage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
      }),
      db.processedImage.count({ where }),
    ])

    return {
      success: true,
      images,
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.max(1, Math.ceil(total / safePageSize)),
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Erreur lors de la récupération paginée des images:", error)
    return {
      success: false,
      images: [],
      total: 0,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      totalPages: 1,
      error: "Erreur lors de la récupération des images",
    }
  }
}

export async function deleteImage(id: number) {
  try {
    const image = await db.processedImage.findUnique({
      where: { id },
    })

    if (!image) {
      return { success: false, error: "Image non trouvée" }
    }

   
    await db.processedImage.delete({
      where: { id },
    })

    return { success: true, message: "Image supprimée avec succès" }
  } catch (error) {
    console.error("Erreur lors de la suppression:", error)
    return { success: false, error: "Erreur lors de la suppression de l'image" }
  }
}

export async function updateImageDimensions(
  id: number,
  dimensions: {
    l1?: number
    l2?: number
    l3?: number
    l4?: number
    l5?: number
    w1?: number
    w2?: number
    w3?: number
  },
) {
  try {
    const updatedImage = await db.processedImage.update({
      where: { id },
      data: dimensions,
    })

    return { success: true, data: updatedImage }
  } catch (error) {
    console.error("Erreur lors de la mise à jour des dimensions:", error)
    return { success: false, error: "Erreur lors de la mise à jour des dimensions" }
  }
}
