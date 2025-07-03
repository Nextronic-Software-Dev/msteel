'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RefreshCw, Download } from 'lucide-react'
import { ImageRow } from "@/components/image-row"
import { Toaster } from "sonner"
import { RefreshButton } from "@/components/RefreshButton"
import { ExportDialog } from './export-dialog'

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
      const response = await fetch('/api/events', {
        method: 'GET',
        cache: 'no-store'
      })
      const data = await response.json()
      setImageData(data)
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleFocus = () => refreshData()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const images = imageData.success ? imageData.images : []

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button
            onClick={refreshData}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
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

      <Table>
        <TableCaption>
          {images.length > 0
            ? `Liste de ${images.length} image(s) - Dernière mise à jour: ${new Date(imageData.lastUpdated || Date.now()).toLocaleString()}`
            : "Aucune image disponible"}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Image & Nom</TableHead>
            <TableHead>L1</TableHead>
            <TableHead>L2</TableHead>
            <TableHead>L3</TableHead>
            <TableHead>L4</TableHead>
            <TableHead>L5</TableHead>
            <TableHead>W1</TableHead>
            <TableHead>W2</TableHead>
            <TableHead>W3</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>ID Personnalisé</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.length > 0 ? (
            images.map((image: any) => (
              <ImageRow key={image.id} image={image}  />
            ))
          ) : (
            <TableRow>
              <td colSpan={12} className="text-center py-8">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <p className="text-gray-500">Aucune image à afficher</p>
                </div>
              </td>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Toaster />
    </>
  )
}