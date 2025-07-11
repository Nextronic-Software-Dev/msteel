/* eslint-disable */

"use client"

import { useState } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Save, Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import { updateCustomId, deleteImage, updateImageDimensions } from "@/lib/action"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EditableDimension } from "./editable-dimension"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"

interface ImageRowProps {
  image: {
    id?: number
    imagePath: string
    createdAt?: string 
    customId?: string | null
    l1: number
    l2: number
    l3: number
    l4: number
    l5: number
    w1: number
    w2: number
    w3: number
  }
  onUpdate?: (updatedImage: any) => void
  onDelete?: (imageId: number) => void
  onDialogOpenChange?: (isOpen: boolean) => void
}

export function ImageRow({ image, onUpdate, onDelete, onDialogOpenChange }: ImageRowProps) {
  const [customId, setCustomId] = useState(image.customId || "")
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(image)

  const handleInputChange = (value: string) => {
    setCustomId(value)
    setHasChanges(value !== (image.customId || ""))
  }

  const handleUpdate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!hasChanges) {
      toast.info("Aucune modification à sauvegarder")
      return
    }

    setIsLoading(true)
    try {
      const result = await updateCustomId(image.imagePath, customId)
      if (result.success) {
        toast.success("ID personnalisé mis à jour avec succès")
        setHasChanges(false)
        const updatedImage = { ...currentImage, customId }
        setCurrentImage(updatedImage)
        image.customId = customId

        if (onUpdate) {
          onUpdate(updatedImage)
        }
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDimensionUpdate = async (field: string, newValue: number): Promise<boolean> => {
    if (!currentImage.id) return false

    try {
      const result = await updateImageDimensions(currentImage.id, { [field]: newValue })
      if (result.success) {
        const updatedImage = { ...currentImage, [field]: newValue }
        setCurrentImage(updatedImage)

        if (onUpdate) {
          onUpdate(updatedImage)
        }
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  const handleDelete = async (): Promise<boolean> => {
    if (!currentImage.id) return false

    try {
      const result = await deleteImage(currentImage.id)
      if (result.success && onDelete) {
        onDelete(currentImage.id)
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  const formatNumber = (num: number): string => {
    return num.toFixed(2)
  }

  const getImageUrl = (imagePath: string): string => {
    const filename = imagePath.split("/").pop()
    return `/api/img/${filename}`
  }

  const handleDialogOpenChange = (isOpen: boolean) => {
    setIsImageModalOpen(isOpen)
    if (onDialogOpenChange) {
      onDialogOpenChange(isOpen)
    }
  }

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation() 
  }

  const handleInputFocus = (e: React.FocusEvent) => {
    e.stopPropagation() 
  }
  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-md overflow-hidden border bg-muted">
              <img
                src={getImageUrl(currentImage.imagePath) || "/placeholder.svg?height=48&width=48"}
                alt="Image"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{currentImage.imagePath.split("/").pop()}</p>
              <p className="text-xs text-muted-foreground">ID: {currentImage.id || "N/A"}</p>
            </div>
          </div>
        </TableCell>

        <TableCell className="text-center">
          <EditableDimension
            value={currentImage.l1}
            onSave={(newValue) => handleDimensionUpdate("l1", newValue)}
            label="L1"
            color="blue"
          />
        </TableCell>
        <TableCell className="text-center">
          <EditableDimension
            value={currentImage.l2}
            onSave={(newValue) => handleDimensionUpdate("l2", newValue)}
            label="L2"
            color="blue"
          />
        </TableCell>
        <TableCell className="text-center">
          <EditableDimension
            value={currentImage.l3}
            onSave={(newValue) => handleDimensionUpdate("l3", newValue)}
            label="L3"
            color="blue"
          />
        </TableCell>
        <TableCell className="text-center">
          <EditableDimension
            value={currentImage.l4}
            onSave={(newValue) => handleDimensionUpdate("l4", newValue)}
            label="L4"
            color="blue"
          />
        </TableCell>
        <TableCell className="text-center">
          <EditableDimension
            value={currentImage.l5}
            onSave={(newValue) => handleDimensionUpdate("l5", newValue)}
            label="L5"
            color="blue"
          />
        </TableCell>

        <TableCell className="text-center">
          <EditableDimension
            value={currentImage.w1}
            onSave={(newValue) => handleDimensionUpdate("w1", newValue)}
            label="W1"
            color="green"
          />
        </TableCell>
        <TableCell className="text-center">
          <EditableDimension
            value={currentImage.w2}
            onSave={(newValue) => handleDimensionUpdate("w2", newValue)}
            label="W2"
            color="green"
          />
        </TableCell>
        <TableCell className="text-center">
          <EditableDimension
            value={currentImage.w3}
            onSave={(newValue) => handleDimensionUpdate("w3", newValue)}
            label="W3"
            color="green"
          />
        </TableCell>

        <TableCell className="text-center">
          <Badge variant={currentImage.customId ? "default" : "outline"} className="text-xs">
            {currentImage.customId ? "ID Assigné" : "Nouveau"}
          </Badge>
        </TableCell>

        <TableCell onClick={handleInputClick}>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Saisir ID personnalisé..."
              value={customId}
              onChange={(e) => handleInputChange(e.target.value)}
              onClick={handleInputClick}
              onFocus={handleInputFocus}
              className="w-full min-w-[150px] text-sm"
            />
            <Button
              onClick={handleUpdate}
              disabled={isLoading || !hasChanges}
              size="sm"
              variant={hasChanges ? "default" : "outline"}
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : hasChanges ? (
                <Save className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>
        </TableCell>

        <TableCell className="text-right sticky right-0 bg-background border-l">
          <div className="flex items-center justify-end space-x-1">
            <Dialog open={isImageModalOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="shrink-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Visualisation de l'image</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={getImageUrl(currentImage.imagePath) || "/placeholder.svg?height=48&width=48"}
                      alt="Image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Informations générales
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Nom du fichier:</span>
                          <span className="text-sm font-mono">{currentImage.imagePath.split("/").pop()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">ID:</span>
                          <span className="text-sm font-mono">{currentImage.id || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">ID Personnalisé:</span>
                          <span className="text-sm font-mono">{currentImage.customId || "Non défini"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Date Creation:</span>
                          <span className="text-sm font-mono">
                            {currentImage.createdAt
                              ? new Date(currentImage.createdAt).toLocaleString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Dimensions</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">Longueurs (L)</h5>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>L1:</span>
                              <span className="font-mono bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                                {formatNumber(currentImage.l1)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>L2:</span>
                              <span className="font-mono bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                                {formatNumber(currentImage.l2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>L3:</span>
                              <span className="font-mono bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                                {formatNumber(currentImage.l3)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>L4:</span>
                              <span className="font-mono bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                                {formatNumber(currentImage.l4)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>L5:</span>
                              <span className="font-mono bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                                {formatNumber(currentImage.l5)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">Largeurs (W)</h5>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>W1:</span>
                              <span className="font-mono bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded">
                                {formatNumber(currentImage.w1)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>W2:</span>
                              <span className="font-mono bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded">
                                {formatNumber(currentImage.w2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>W3:</span>
                              <span className="font-mono bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded">
                                {formatNumber(currentImage.w3)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <DeleteConfirmationDialog
              onConfirm={handleDelete}
              imageName={currentImage.imagePath.split("/").pop() || ""}
            />
          </div>
        </TableCell>
      </TableRow>
    </>
  )
}