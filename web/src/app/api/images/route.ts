import { NextResponse } from 'next/server'
import { readdir } from 'fs/promises'
import { join, extname } from 'path'

export async function GET() {
  try {
    const imagesDir = join(process.cwd(), 'public', 'images')
    const dirEntries = await readdir(imagesDir, { withFileTypes: true })

    const imageFiles = dirEntries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => {
        const ext = extname(name).toLowerCase()
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'].includes(ext)
      })
      .sort()

    return NextResponse.json({
      success: true,
      images: imageFiles,
      count: imageFiles.length,
    })
  } catch (error: any) {
    console.error('Erreur liste images:', error)
    return NextResponse.json(
      {
        success: false,
        images: [],
        count: 0,
        error: 'Impossible de lister les images',
        details: error?.message || null,
      },
      { status: 500 }
    )
  }
}
