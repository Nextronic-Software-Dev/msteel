import sharp from "sharp"

export type MeasurementPdfData = {
  id: number
  customId: string | null
  imagePath: string
  sent: boolean
  createdAt: Date
  l1: number
  l2: number
  l3: number
  l4: number
  l5: number
  w1: number
  w2: number
  w3: number
}

type Bytes = Uint8Array<ArrayBufferLike>
type PdfObject = string | Bytes

function ascii(value: string): Bytes {
  return new Uint8Array(Buffer.from(value, "ascii"))
}

function concatBytes(parts: Bytes[]): Bytes {
  const result = new Uint8Array(parts.reduce((total, part) => total + part.byteLength, 0))
  let offset = 0
  for (const part of parts) {
    result.set(part, offset)
    offset += part.byteLength
  }
  return result
}

function safeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/([\\()])/g, "\\$1")
}

function text(content: string[], value: unknown, x: number, y: number, size = 10, bold = false, color = "0.15 0.18 0.22") {
  content.push(`BT /${bold ? "FB" : "FR"} ${size} Tf ${color} rg ${x} ${y} Td (${safeText(value)}) Tj ET`)
}

function streamObject(dictionary: string, data: Bytes) {
  return concatBytes([
    ascii(`<< ${dictionary} /Length ${data.length} >>\nstream\n`),
    data,
    ascii("\nendstream"),
  ])
}

function buildPdf(objects: PdfObject[]) {
  const chunks: Bytes[] = [new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52, 10, 37, 226, 227, 207, 211, 10])]
  const offsets = [0]
  let position = chunks[0].length

  objects.forEach((object, index) => {
    offsets.push(position)
    const prefix = ascii(`${index + 1} 0 obj\n`)
    const body = typeof object === "string" ? ascii(object) : object
    const suffix = ascii("\nendobj\n")
    chunks.push(prefix, body, suffix)
    position += prefix.length + body.length + suffix.length
  })

  const xrefOffset = position
  const xref = [`xref\n0 ${objects.length + 1}\n`, "0000000000 65535 f \n"]
  for (let index = 1; index <= objects.length; index++) xref.push(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`)
  xref.push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`)
  chunks.push(ascii(xref.join("")))
  return concatBytes(chunks)
}

export async function createMeasurementPdf(data: MeasurementPdfData, sourceImage?: Buffer | null) {
  let image: { buffer: Bytes; width: number; height: number } | null = null
  if (sourceImage?.length) {
    try {
      const result = await sharp(sourceImage)
        .rotate()
        .flatten({ background: "#ffffff" })
        .resize({ width: 1200, height: 700, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 84, mozjpeg: true })
        .toBuffer({ resolveWithObject: true })
      image = { buffer: new Uint8Array(result.data), width: result.info.width, height: result.info.height }
    } catch {
      image = null
    }
  }

  const objects: PdfObject[] = []
  const catalogId = 1
  const pagesId = 2
  const pageId = 3
  const regularFontId = 4
  const boldFontId = 5
  const imageId = image ? 6 : null
  const contentId = image ? 7 : 6

  objects.push(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`)
  objects.push(`<< /Type /Pages /Kids [${pageId} 0 R] /Count 1 >>`)
  const xObject = imageId ? `/XObject << /IM ${imageId} 0 R >>` : ""
  objects.push(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /FR ${regularFontId} 0 R /FB ${boldFontId} 0 R >> ${xObject} >> /Contents ${contentId} 0 R >>`)
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
  if (image) objects.push(streamObject(`/Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`, image.buffer))

  const commands: string[] = [
    "0.04 0.08 0.14 rg 0 742 595 100 re f",
    "0.05 0.58 0.53 rg 48 766 5 42 re f",
  ]
  text(commands, "NEXTRONIC", 70, 800, 11, true, "0.35 0.95 0.86")
  text(commands, "FICHE DE CONTROLE DIMENSIONNEL", 70, 776, 20, true, "1 1 1")
  text(commands, `Document genere le ${new Date().toLocaleString("fr-FR")}`, 70, 756, 8, false, "0.72 0.78 0.84")

  commands.push("0.96 0.97 0.98 rg 48 660 499 58 re f", "0.86 0.88 0.91 RG 48 660 499 58 re S")
  text(commands, "REFERENCE", 64, 697, 8, true, "0.40 0.45 0.50")
  text(commands, data.customId || `Piece #${data.id}`, 64, 677, 13, true)
  text(commands, "STATUT", 275, 697, 8, true, "0.40 0.45 0.50")
  text(commands, data.sent ? "Envoyee" : data.customId ? "Prete" : "A identifier", 275, 677, 11, true, data.sent ? "0.02 0.50 0.35" : "0.75 0.42 0.02")
  text(commands, "DATE DE TRAITEMENT", 410, 697, 8, true, "0.40 0.45 0.50")
  text(commands, data.createdAt.toLocaleString("fr-FR"), 410, 677, 9, false)

  commands.push("0.98 0.98 0.99 rg 48 342 499 290 re f", "0.86 0.88 0.91 RG 48 342 499 290 re S")
  if (image) {
    const maxW = 467
    const maxH = 258
    const scale = Math.min(maxW / image.width, maxH / image.height)
    const width = image.width * scale
    const height = image.height * scale
    const x = 48 + (499 - width) / 2
    const y = 342 + (290 - height) / 2
    commands.push(`q ${width.toFixed(2)} 0 0 ${height.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /IM Do Q`)
  } else {
    text(commands, "Image indisponible", 245, 482, 12, true, "0.50 0.54 0.58")
  }

  text(commands, "DIMENSIONS MESUREES", 48, 310, 12, true)
  commands.push("0.05 0.58 0.53 rg 48 297 38 3 re f")
  const dimensions = [["L1", data.l1], ["L2", data.l2], ["L3", data.l3], ["L4", data.l4], ["L5", data.l5], ["W1", data.w1], ["W2", data.w2], ["W3", data.w3]] as const
  dimensions.forEach(([label, value], index) => {
    const column = index % 4
    const row = Math.floor(index / 4)
    const x = 48 + column * 125
    const y = 235 - row * 60
    commands.push(`${row % 2 ? "0.98 0.98 0.99" : "0.95 0.98 0.97"} rg ${x} ${y} 116 48 re f`, `0.86 0.88 0.91 RG ${x} ${y} 116 48 re S`)
    text(commands, label, x + 12, y + 30, 8, true, "0.40 0.45 0.50")
    text(commands, `${value.toFixed(2)} mm`, x + 12, y + 13, 12, true)
  })

  text(commands, "FICHIER SOURCE", 48, 121, 8, true, "0.40 0.45 0.50")
  text(commands, data.imagePath.split("/").pop() || data.imagePath, 48, 104, 9)
  commands.push("0.86 0.88 0.91 RG 48 70 499 0 l S")
  text(commands, `Document de tracabilite - Piece ${data.id}`, 48, 49, 8, false, "0.45 0.49 0.54")
  text(commands, "Page 1 / 1", 498, 49, 8, false, "0.45 0.49 0.54")

  const contentBuffer = ascii(commands.join("\n"))
  objects.push(streamObject("", contentBuffer))
  return buildPdf(objects)
}
