import { NextResponse } from 'next/server'
import { getImages } from '@/lib/action'

export async function GET() {
  try {
    const imageData = await getImages()
    return NextResponse.json(imageData)
  } catch (error) {
    console.error('Erreur API GET images:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des images' },
      { status: 500 }
    )
  }
}