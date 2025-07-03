/* eslint-disable */

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileSpreadsheet, Settings } from "lucide-react"
import { toast } from "sonner"
import { exportFilteredToExcel, exportToExcel } from "@/lib/export-excel"

interface ExportDialogProps {
  images: any[]
}

export function ExportDialog({ images }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filename, setFilename] = useState("")
  const [exportOptions, setExportOptions] = useState({
    includeAll: true,
    onlyWithCustomId: false,
    onlyWithoutCustomId: false,
    includeStatistics: true,
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      let result

      if (exportOptions.includeAll) {
        result = exportToExcel(images, filename || undefined)
      } else {
        const filters: any = {}

        if (exportOptions.onlyWithCustomId) {
          filters.hasCustomId = true
        } else if (exportOptions.onlyWithoutCustomId) {
          filters.hasCustomId = false
        }

        result = exportFilteredToExcel(images, filters, filename || undefined)
      }

      toast.success(`Export réussi !`, {
        description: `${result.recordCount} image(s) exportée(s) dans ${result.filename}`,
      })

      setIsOpen(false)
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
      toast.error("Erreur lors de l'export", {
        description: "Impossible de générer le fichier Excel",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleQuickExport = () => {
    setIsExporting(true)

    try {
      const result = exportToExcel(images)
      toast.success(`Export réussi !`, {
        description: `${result.recordCount} image(s) exportée(s) dans ${result.filename}`,
      })
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
      toast.error("Erreur lors de l'export")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" onClick={handleQuickExport} disabled={isExporting || images.length === 0}>
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? "Export..." : "Exporter"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={images.length === 0}>
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5" />
              <span>Export Excel Avancé</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filename">Nom du fichier (optionnel)</Label>
              <Input
                id="filename"
                placeholder="traitement-toles-2024-01-15.xlsx"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Laissez vide pour un nom automatique avec la date</p>
            </div>

            <div className="space-y-3">
              <Label>Options d'export</Label>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeAll"
                    checked={exportOptions.includeAll}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includeAll: !!checked,
                        onlyWithCustomId: false,
                        onlyWithoutCustomId: false,
                      }))
                    }
                  />
                  <Label htmlFor="includeAll" className="text-sm">
                    Exporter toutes les images ({images.length})
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onlyWithCustomId"
                    checked={exportOptions.onlyWithCustomId}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includeAll: false,
                        onlyWithCustomId: !!checked,
                        onlyWithoutCustomId: false,
                      }))
                    }
                  />
                  <Label htmlFor="onlyWithCustomId" className="text-sm">
                    Seulement les images avec ID personnalisé ({images.filter((img) => img.customId).length})
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onlyWithoutCustomId"
                    checked={exportOptions.onlyWithoutCustomId}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includeAll: false,
                        onlyWithCustomId: false,
                        onlyWithoutCustomId: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="onlyWithoutCustomId" className="text-sm">
                    Seulement les images sans ID personnalisé ({images.filter((img) => !img.customId).length})
                  </Label>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Le fichier Excel contiendra :</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Feuille "Images Traitées" avec toutes les données</li>
                <li>• Feuille "Résumé" avec statistiques et moyennes</li>
                <li>• Formatage professionnel avec couleurs</li>
                <li>• Dimensions formatées avec 2 décimales</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleExport} disabled={isExporting}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {isExporting ? "Export en cours..." : "Exporter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
