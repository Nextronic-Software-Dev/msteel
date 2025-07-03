import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

const LOCAL_IMAGE_DIR = path.join(process.cwd(), 'public', 'images')

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    let id = form.get('id') as string | null
    if (!id) {
      id = `${Date.now()}`
    }
    const file = form.get('image') as File
    const l1 = Number(form.get('l1'))
    const l2 = Number(form.get('l2'))
    const l3 = Number(form.get('l3'))
    const l4 = Number(form.get('l4'))
    const l5 = Number(form.get('l5'))
    const w1 = Number(form.get('w1'))
    const w2 = Number(form.get('w2'))
    const w3 = Number(form.get('w3'))

    if (!file || isNaN(l1) || isNaN(l2) || isNaN(l3) || isNaN(l4) || isNaN(l5) || 
        isNaN(w1) || isNaN(w2) || isNaN(w3)) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes ou invalides' },
        { status: 400 }
      )
    }

    await fs.mkdir(LOCAL_IMAGE_DIR, { recursive: true })
    
    const ext = path.extname(file.name) || '.jpg'
    const filename = `${id}${ext}`
    const localPath = path.join(LOCAL_IMAGE_DIR, filename)
    const imagePath = `/images/${filename}`

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    await fs.writeFile(localPath, uint8Array)

    const savedImage = await db.processedImage.create({
      data: {
        imagePath: imagePath,
        l1, l2, l3, l4, l5,
        w1, w2, w3
      }
    })

    // Invalider le cache de la page pour forcer une mise à jour
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      data: savedImage,
      message: 'Image et données sauvegardées avec succès'
    })

  } catch (error: any) {
    console.error('Erreur API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de recevoir ou stocker l\'image',
        details: error.message,
      },
      { status: 500 }
    )
  }
}