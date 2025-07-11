"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RefreshCw } from 'lucide-react'
import { ImageRow } from "@/components/image-row"
import { Toaster } from "sonner"
import { ExportDialog } from "./export-dialog"
import { getImages } from "@/lib/action"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination"

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
  const [currentPage, setCurrentPage] = useState(1)
  const [dialoguesOpen, setDialoguesOpen] = useState(0) 
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const itemsPerPage = 10
  const maxVisiblePages = 5

  const handleDialogOpenChange = useCallback((isOpen: boolean) => {
    setDialoguesOpen(prev => isOpen ? prev + 1 : Math.max(0, prev - 1))
  }, [])

  const fetchImages = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const newData = await getImages()
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

  const startInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => {
      if (dialoguesOpen === 0) {
        fetchImages()
      }
    }, 30000)
  }, [fetchImages, dialoguesOpen])

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (dialoguesOpen > 0) {
      stopInterval()
    } else {
      startInterval()
    }

    return () => stopInterval()
  }, [dialoguesOpen, startInterval, stopInterval])


  useEffect(() => {
    return () => stopInterval()
  }, [stopInterval])

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
  
  const totalPages = Math.ceil(images.length / itemsPerPage)
  const paginatedImages = images.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getPaginationRange = () => {
    const halfVisible = Math.floor(maxVisiblePages / 2)
    let start = Math.max(1, currentPage - halfVisible)
    let end = Math.min(totalPages, start + maxVisiblePages - 1)

    if (end === totalPages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button
            disabled={isRefreshing}
            onClick={fetchImages}
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
          {dialoguesOpen > 0 && (
            <div
              className="w-2 h-2 rounded-full bg-orange-500"
              title="Actualisation automatique suspendue (dialogue ouvert)"
            />
          )}
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
                ? `Liste de ${images.length} image(s) - Page ${currentPage} sur ${totalPages}`
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
                <TableHead className="text-right min-w-[120px] sticky right-0 bg-background border-l">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedImages.length > 0 ? (
                paginatedImages.map((image: any, index: number) => (
                  <ImageRow
                    key={`${image.id}-${lastFetchTime}-${index}`}
                    image={image}
                    onUpdate={handleImageUpdate}
                    onDelete={handleImageDelete}
                    onDialogOpenChange={handleDialogOpenChange}
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

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                onClick={() => handlePageChange(1)}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              >
                Première
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {getPaginationRange().map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                onClick={() => handlePageChange(totalPages)}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              >
                Dernière
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Toaster />
    </>
  )
}