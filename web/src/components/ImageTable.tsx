"use client"

import { useState, useEffect, useCallback } from "react"
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RefreshCw } from 'lucide-react'
import { ImageRow } from "@/components/image-row"
import { Toaster } from "sonner"
import { ExportDialog } from "./export-dialog"
import { getImages } from "@/lib/action" // Import the server action

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
  const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now())
  const [isConnected, setIsConnected] = useState(false)

  // Memoized function to fetch images
  const fetchImages = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const newData = await getImages() // Call the server action
      setImageData(newData)
      setLastFetchTime(Date.now())
      setIsConnected(true)
    } catch (error) {
      setImageData((prev) => ({
        ...prev,
        success: false,
        error: "Échec de la récupération des données",
      }))
      setIsConnected(false)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Polling effect to fetch images every 3 seconds
  useEffect(() => {
    // Initial fetch on mount
    fetchImages()

    // Set up polling
    const intervalId = setInterval(fetchImages, 3000) // Every 3 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [fetchImages])

  const handleImageUpdate = useCallback((updatedImage: any) => {
    setImageData((prev) => ({
      ...prev,
      images: prev.images.map((img) => (img.id === updatedImage.id ? updatedImage : img)),
    }))
  }, [])

  const handleImageDelete = useCallback((imageId: number) => {
    setImageData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }))
  }, [])

  const images = imageData.success && Array.isArray(imageData.images) ? imageData.images : []

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button
            disabled={isRefreshing}
            onClick={fetchImages} // Manual refresh option
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <ExportDialog images={images} />
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>Dernière mise à jour: {new Date(lastFetchTime).toLocaleTimeString()}</span>
          <span>({images.length} images)</span>
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            title={isConnected ? 'Connexion temps réel active' : 'Connexion temps réel inactive'}
          />
        </div>
      </div>

      {!imageData.success && imageData.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-700">Erreur: {imageData.error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchImages}
          >
            Réessayer
          </Button>
        </div>
      )}

      <div className="rounded-md border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption className="py-4">
              {images.length > 0
                ? `Liste de ${images.length} image(s) - ${isConnected ? 'Mise à jour automatique' : 'Mise à jour toutes les 3s'}`
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
                images.map((image: any, index: number) => (
                  <ImageRow
                    key={`${image.id}-${lastFetchTime}-${index}`}
                    image={image}
                    onUpdate={handleImageUpdate}
                    onDelete={handleImageDelete}
                  />
                ))
              ) : (
                <TableRow>
                  <td colSpan={12} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <RefreshCw className={`h-6 w-6 ${isRefreshing ? "animate-spin" : ""}`} />
                      </div>
                      <p>Aucune image à afficher</p>
                      {!isRefreshing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchImages}
                        >
                          Charger les données
                        </Button>
                      )}
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