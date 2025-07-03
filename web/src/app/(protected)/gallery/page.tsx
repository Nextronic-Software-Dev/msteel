import { getServerSession } from "@/lib/auth"
import { db } from "@/lib/db"
import Image from "next/image"
import { redirect } from "next/navigation"

export default async function GalleryPage() {
      const session = await getServerSession()
      if (!session) redirect("/authentication")
    
  const images = await db.processedImage.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Galerie des images traitées</h1>
      {images.length === 0 ? (
        <div className="text-muted-foreground">Aucune image traitée pour le moment.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <div key={img.id} className="border rounded-lg p-4 flex flex-col items-center">
              <div className="relative w-48 h-32 mb-3">
                <Image
                  src={img.imagePath}
                  alt={img.customId || "Image"}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="font-semibold mb-1">{img.customId || <span className="text-xs text-muted-foreground">ID non défini</span>}</div>
              <div className="text-sm text-muted-foreground mb-1">
                L: {img.l1}, {img.l2}, {img.l3}, {img.l4}, {img.l5}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                W: {img.w1}, {img.w2}, {img.w3}
              </div>
              <div className="text-xs text-gray-400">
                Ajoutée le {new Date(img.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}