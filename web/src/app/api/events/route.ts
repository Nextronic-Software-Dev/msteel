import { NextResponse } from 'next/server'
import { getImagesPage } from '@/lib/action'

export async function GET() {
  try {
    const imageData = await getImagesPage(1, 10)
    return NextResponse.json(imageData)
  } catch (error) {
    console.error('Erreur API GET images:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des images' },
      { status: 500 }
    )
  }
}
