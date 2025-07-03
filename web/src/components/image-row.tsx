/* eslint-disable */

"use client"

import { useState } from "react"
import Image from "next/image"
import { TableCell, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Save, Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import { updateCustomId } from "@/lib/action"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ImageRowProps {
  image: {
    id?: number
    imagePath: string
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
}

export function ImageRow({ image }: ImageRowProps) {
  const [customId, setCustomId] = useState(image.customId || "")
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const handleInputChange = (value: string) => {
    setCustomId(value)
    setHasChanges(value !== (image.customId || ""))
  }

  const handleUpdate = async () => {
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
        image.customId = customId
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    return num.toFixed(2)
  }

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell>
        <div className="flex items-center space-x-3">
          <div className="relative w-12 h-12 rounded-md overflow-hidden border bg-muted">
            <Image src={image.imagePath || "/placeholder.svg"} alt="Image" fill className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{image.imagePath.split("/").pop()}</p>
          </div>
        </div>
      </TableCell>

      {/* Colonnes L1-L5 */}
      <TableCell className="text-center">
        <span className="font-mono text-sm bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded">
          {formatNumber(image.l1)}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span className="font-mono text-sm bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded">
          {formatNumber(image.l2)}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span className="font-mono text-sm bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded">
          {formatNumber(image.l3)}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span className="font-mono text-sm bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded">
          {formatNumber(image.l4)}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span className="font-mono text-sm bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded">
          {formatNumber(image.l5)}
        </span>
      </TableCell>

      {/* Colonnes W1-W3 */}
      <TableCell className="text-center">
        <span className="font-mono text-sm bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
          {formatNumber(image.w1)}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span className="font-mono text-sm bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
          {formatNumber(image.w2)}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span className="font-mono text-sm bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
          {formatNumber(image.w3)}
        </span>
      </TableCell>

      <TableCell className="text-center">
        <Badge variant={image.customId ? "default" : "outline"} className="text-xs">
          {image.customId ? "ID Assigné" : "Nouveau"}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Saisir ID personnalisé..."
            value={customId}
            onChange={(e) => handleInputChange(e.target.value)}
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

      <TableCell className="text-right">
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
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
              {/* Image principale */}
              <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
                <Image
                  src={image.imagePath || "/placeholder.svg"}
                  alt={`Image ${image.imagePath.split("/").pop()}`}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Informations générales
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Nom du fichier:</span>
                      <span className="text-sm font-mono">{image.imagePath.split("/").pop()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">ID:</span>
                      <span className="text-sm font-mono">{image.id || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">ID Personnalisé:</span>
                      <span className="text-sm font-mono">{image.customId || "Non défini"}</span>
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
                            {formatNumber(image.l1)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>L2:</span>
                          <span className="font-mono bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                            {formatNumber(image.l2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>L3:</span>
                          <span className="font-mono bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                            {formatNumber(image.l3)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>L4:</span>
                          <span className="font-mono bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                            {formatNumber(image.l4)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>L5:</span>
                          <span className="font-mono bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                            {formatNumber(image.l5)}
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
                            {formatNumber(image.w1)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>W2:</span>
                          <span className="font-mono bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded">
                            {formatNumber(image.w2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>W3:</span>
                          <span className="font-mono bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded">
                            {formatNumber(image.w3)}
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
      </TableCell>
    </TableRow>
  )
}
