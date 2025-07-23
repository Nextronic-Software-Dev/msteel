import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { id, customId } = await request.json()

    if (!id || typeof customId !== "string") {
      return NextResponse.json(
        { success: false, error: "id et customId sont requis" },
        { status: 400 }
      )
    }

    const updated = await db.processedImage.update({
      where: { id: Number(id) },
      data: { customId }
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: "customId mis à jour avec succès"
    })
  } catch (error: any) {
    console.error("Erreur API UPDATE:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Impossible de mettre à jour le customId",
        details: error.message
      },
      { status: 500 }
    )
  }
}