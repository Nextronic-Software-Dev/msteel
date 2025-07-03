import * as XLSX from "xlsx"

interface ProcessedImage {
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
  createdAt?: string
  updatedAt?: string
}

export function exportToExcel(images: ProcessedImage[], filename?: string) {
  // Créer un nouveau workbook
  const workbook = XLSX.utils.book_new()

  // Préparer les données pour l'export
  const exportData = images.map((image, index) => ({
    "N°": index + 1,
    ID: image.id || "N/A",
    "Nom du fichier": image.imagePath.split("/").pop() || "",
    "Chemin complet": image.imagePath,
    "ID Personnalisé": image.customId || "",
    "L1 (mm)": Number(image.l1.toFixed(2)),
    "L2 (mm)": Number(image.l2.toFixed(2)),
    "L3 (mm)": Number(image.l3.toFixed(2)),
    "L4 (mm)": Number(image.l4.toFixed(2)),
    "L5 (mm)": Number(image.l5.toFixed(2)),
    "W1 (mm)": Number(image.w1.toFixed(2)),
    "W2 (mm)": Number(image.w2.toFixed(2)),
    "W3 (mm)": Number(image.w3.toFixed(2)),
    Statut: image.customId ? "ID Assigné" : "Nouveau",
    "Date de création": image.createdAt ? new Date(image.createdAt).toLocaleDateString("fr-FR") : "",
    "Dernière modification": image.updatedAt ? new Date(image.updatedAt).toLocaleDateString("fr-FR") : "",
  }))

  // Créer la feuille de calcul principale
  const worksheet = XLSX.utils.json_to_sheet(exportData)

  // Définir la largeur des colonnes
  const columnWidths = [
    { wch: 5 }, // N°
    { wch: 8 }, // ID
    { wch: 25 }, // Nom du fichier
    { wch: 35 }, // Chemin complet
    { wch: 15 }, // ID Personnalisé
    { wch: 10 }, // L1
    { wch: 10 }, // L2
    { wch: 10 }, // L3
    { wch: 10 }, // L4
    { wch: 10 }, // L5
    { wch: 10 }, // W1
    { wch: 10 }, // W2
    { wch: 10 }, // W3
    { wch: 12 }, // Statut
    { wch: 15 }, // Date de création
    { wch: 18 }, // Dernière modification
  ]
  worksheet["!cols"] = columnWidths

  // Ajouter des styles aux en-têtes
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "366092" } },
    alignment: { horizontal: "center", vertical: "center" },
  }

  // Appliquer le style aux en-têtes (première ligne)
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
    if (!worksheet[cellAddress]) continue
    worksheet[cellAddress].s = headerStyle
  }

  // Ajouter la feuille au workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Images Traitées")

  // Créer une feuille de résumé
  const summaryData = [
    ["Rapport d'Export - Traitement des Tôles", ""],
    ["", ""],
    ["Date d'export", new Date().toLocaleDateString("fr-FR")],
    ["Heure d'export", new Date().toLocaleTimeString("fr-FR")],
    ["Nombre total d'images", images.length],
    ["Images avec ID personnalisé", images.filter((img) => img.customId).length],
    ["Images sans ID personnalisé", images.filter((img) => !img.customId).length],
    ["", ""],
    ["Statistiques des dimensions", ""],
    ["", ""],
    ["Longueurs moyennes (L)", ""],
    [
      "L1 moyen (mm)",
      images.length > 0 ? (images.reduce((sum, img) => sum + img.l1, 0) / images.length).toFixed(2) : "0",
    ],
    [
      "L2 moyen (mm)",
      images.length > 0 ? (images.reduce((sum, img) => sum + img.l2, 0) / images.length).toFixed(2) : "0",
    ],
    [
      "L3 moyen (mm)",
      images.length > 0 ? (images.reduce((sum, img) => sum + img.l3, 0) / images.length).toFixed(2) : "0",
    ],
    [
      "L4 moyen (mm)",
      images.length > 0 ? (images.reduce((sum, img) => sum + img.l4, 0) / images.length).toFixed(2) : "0",
    ],
    [
      "L5 moyen (mm)",
      images.length > 0 ? (images.reduce((sum, img) => sum + img.l5, 0) / images.length).toFixed(2) : "0",
    ],
    ["", ""],
    ["Largeurs moyennes (W)", ""],
    [
      "W1 moyen (mm)",
      images.length > 0 ? (images.reduce((sum, img) => sum + img.w1, 0) / images.length).toFixed(2) : "0",
    ],
    [
      "W2 moyen (mm)",
      images.length > 0 ? (images.reduce((sum, img) => sum + img.w2, 0) / images.length).toFixed(2) : "0",
    ],
    [
      "W3 moyen (mm)",
      images.length > 0 ? (images.reduce((sum, img) => sum + img.w3, 0) / images.length).toFixed(2) : "0",
    ],
  ]

  const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData)

  // Largeur des colonnes pour le résumé
  summaryWorksheet["!cols"] = [{ wch: 30 }, { wch: 15 }]

  // Style pour le titre du résumé
  if (summaryWorksheet["A1"]) {
    summaryWorksheet["A1"].s = {
      font: { bold: true, size: 16, color: { rgb: "366092" } },
      alignment: { horizontal: "left" },
    }
  }

  // Fusionner les cellules pour le titre
  summaryWorksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }]

  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Résumé")

  // Générer le nom du fichier
  const defaultFilename = `traitement-toles-${new Date().toISOString().split("T")[0]}.xlsx`
  const finalFilename = filename || defaultFilename

  // Télécharger le fichier
  XLSX.writeFile(workbook, finalFilename)

  return {
    success: true,
    filename: finalFilename,
    recordCount: images.length,
  }
}

export function exportFilteredToExcel(
  images: ProcessedImage[],
  filters: {
    hasCustomId?: boolean
    dateRange?: { start: Date; end: Date }
    dimensionRange?: { min: number; max: number }
  },
  filename?: string,
) {
  let filteredImages = [...images]

  // Appliquer les filtres
  if (filters.hasCustomId !== undefined) {
    filteredImages = filteredImages.filter((img) => (filters.hasCustomId ? !!img.customId : !img.customId))
  }

  if (filters.dateRange) {
    filteredImages = filteredImages.filter((img) => {
      if (!img.createdAt) return false
      const imgDate = new Date(img.createdAt)
      return imgDate >= filters.dateRange!.start && imgDate <= filters.dateRange!.end
    })
  }

  if (filters.dimensionRange) {
    filteredImages = filteredImages.filter((img) => {
      const maxDimension = Math.max(img.l1, img.l2, img.l3, img.l4, img.l5, img.w1, img.w2, img.w3)
      return maxDimension >= filters.dimensionRange!.min && maxDimension <= filters.dimensionRange!.max
    })
  }

  return exportToExcel(filteredImages, filename)
}
