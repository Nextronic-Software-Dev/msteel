import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getImages } from "@/lib/action"
import { ImageTable } from "@/components/ImageTable"

export default async function Home() {
  const session = await getServerSession()
  if (!session) redirect("/authentication")
  
  const imageData = await getImages()
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Traitement des Tôles</h1>
          <p className="text-gray-600">Gérer les images et leurs dimensions</p>
        </div>
      </div>
      
      <ImageTable initialData={imageData} />
    </div>
  )
}