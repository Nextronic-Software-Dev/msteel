import { db } from '@/lib/db'
import fs from 'fs/promises'
import path from 'path'

const LOCAL_IMAGE_DIR = path.join(process.cwd(), 'public', 'images')

async function deleteAll() {
  try {
    const files = await fs.readdir(LOCAL_IMAGE_DIR)
    await Promise.all(files.map(file => fs.unlink(path.join(LOCAL_IMAGE_DIR, file))))

    await db.processedImage.deleteMany({})

    console.log(' Suppression complète réussie')
  } catch (error: any) {
    console.error(' Erreur:', error)
  } finally {
    await db.$disconnect()
  }
}

deleteAll()
