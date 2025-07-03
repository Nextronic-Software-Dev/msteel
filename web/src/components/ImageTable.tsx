"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { ImageRow } from "@/components/image-row"
import { Toaster } from "sonner"
import { ExportDialog } from "./export-dialog"

interface ImageData {
  success: boolean
  images: any[]
  lastUpdated?: string
  error?: string
}

interface ImageTableProps {
  initialData: ImageData
}

export function ImageTable({ initialData }: ImageTableProps) {
  const [imageData, setImageData] = useState<ImageData>(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/events", {
        method: "GET",
        cache: "no-store",
      })
      const data = await response.json()
      setImageData(data)
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleImageUpdate = (updatedImage: any) => {
    setImageData((prev) => ({
      ...prev,
      images: prev.images.map((img) => (img.id === updatedImage.id ? updatedImage : img)),
    }))
  }

  const handleImageDelete = (imageId: number) => {
    setImageData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }))
  }

  useEffect(() => {
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleFocus = () => refreshData()
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  const images = imageData.success ? imageData.images : []

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button onClick={refreshData} disabled={isRefreshing} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <ExportDialog images={images} />
        </div>
      </div>

      {!imageData.success && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-700">Erreur lors du chargement des images: {imageData.error}</p>
        </div>
      )}

      <div className="rounded-md border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption className="py-4">
              {images.length > 0
                ? `Liste de ${images.length} image(s) - Dernière mise à jour: ${new Date(
                    imageData.lastUpdated || Date.now(),
                  ).toLocaleString()}`
                : "Aucune image disponible"}
            </TableCaption>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="min-w-[200px]">Image & Nom</TableHead>
                <TableHead className="text-center min-w-[80px]">W1</TableHead>
                <TableHead className="text-center min-w-[80px]">W2</TableHead>
                <TableHead className="text-center min-w-[80px]">W3</TableHead>
                <TableHead className="text-center min-w-[80px]">W4</TableHead>
                <TableHead className="text-center min-w-[80px]">W5</TableHead>
                <TableHead className="text-center min-w-[80px]">L1</TableHead>
                <TableHead className="text-center min-w-[80px]">L2</TableHead>
                <TableHead className="text-center min-w-[80px]">L3</TableHead>
                <TableHead className="text-center min-w-[120px]">Statut</TableHead>
                <TableHead className="min-w-[200px]">ID Personnalisé</TableHead>
                <TableHead className="text-right min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {images.length > 0 ? (
                images.map((image: any) => (
                  <ImageRow key={image.id} image={image} onUpdate={handleImageUpdate} onDelete={handleImageDelete} />
                ))
              ) : (
                <TableRow>
                  <td colSpan={12} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <RefreshCw className="h-6 w-6" />
                      </div>
                      <p>Aucune image à afficher</p>
                    </div>
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Toaster />
    </>
  )
}
