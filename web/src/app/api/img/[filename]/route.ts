import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params
    
    // Chemin vers le fichier image dans public/images
    const imagePath = join(process.cwd(), 'public', 'images', filename)
    
    // Vérifier si le fichier existe
    if (!existsSync(imagePath)) {
      return new NextResponse('Image not found', { status: 404 })
    }
    
    // Lire le fichier
    const imageBuffer = await readFile(imagePath)
    
    // Déterminer le type MIME basé sur l'extension
    const getContentType = (filename: string): string => {
      const ext = filename.toLowerCase().split('.').pop()
      switch (ext) {
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg'
        case 'png':
          return 'image/png'
        case 'gif':
          return 'image/gif'
        case 'webp':
          return 'image/webp'
        case 'svg':
          return 'image/svg+xml'
        default:
          return 'image/jpeg'
      }
    }
    
    const contentType = getContentType(filename)
    
    // Retourner l'image avec les bons headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache pendant 1 an
        'Content-Length': imageBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
