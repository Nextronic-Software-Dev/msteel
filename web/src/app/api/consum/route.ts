import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// URL fixe du serveur
const SERVER_BASE_URL = 'http://ac4ogcgs08gkkow8o04ggo4g.57.128.74.181.sslip.io:3025'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const unsentImages = await db.processedImage.findMany({
      where: { 
        sent: false 
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        customId: true,
        imagePath: true,
        
        l1: true,
        l2: true,
        l3: true,
        l4: true,
        l5: true,
        w1: true,
        w2: true,
        w3: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (unsentImages.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'Aucune nouvelle image à envoyer'
      })
    }

    const imageIds = unsentImages.map(img => img.id)
    await db.processedImage.updateMany({
      where: {
        id: { in: imageIds }
      },
      data: {
        sent: true,
        sentAt: new Date()
      }
    })

const imagesWithFullUrl = unsentImages.map(image => {
  const filename = image.imagePath.replace(/^\/?images\//, '')
  return {
    ...image,
    imageUrl: `${SERVER_BASE_URL}/api/img/${filename}`
  }
})

    return NextResponse.json({
      success: true,
      data: imagesWithFullUrl,
      count: unsentImages.length,
      message: `${unsentImages.length} image(s) envoyée(s) avec succès`
    })

  } catch (error: any) {
    console.error('Erreur API GET:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Impossible de récupérer les images',
        details: error.message 
      },
      { status: 500 }
    )
  }
}