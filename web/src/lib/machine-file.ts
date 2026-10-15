import * as XLSX from "xlsx"
import { MAX_IMPORT_ROWS, parseMachineTime, type MachineRecord } from "./id-import"

export type MachineSheet = { name: string; headers: string[]; rows: { row: number; cells: string[] }[] }
export type ColumnMapping = { id: number; date: number; time: number; dateOrder: "dmy" | "mdy"; zone: "local" | "utc" }

export function readMachineFile(data: ArrayBuffer): MachineSheet[] {
  // raw prevents CSV IDs such as 000123 from being converted to numbers.
  const bytes = new Uint8Array(data)
  const binary = (bytes[0] === 0x50 && bytes[1] === 0x4b) || (bytes[0] === 0xd0 && bytes[1] === 0xcf)
  let source: ArrayBuffer | string = data
  if (!binary) {
    if (bytes[0] === 0xff && bytes[1] === 0xfe) source = new TextDecoder("utf-16le").decode(bytes)
    else if (bytes[0] === 0xfe && bytes[1] === 0xff) source = new TextDecoder("utf-16be").decode(bytes)
    else {
      try { source = new TextDecoder("utf-8", { fatal: true }).decode(bytes) }
      catch { source = new TextDecoder("windows-1252").decode(bytes) }
    }
  }
  const workbook = XLSX.read(source, { type: binary ? "array" : "string", raw: true, cellDates: false, cellNF: true, sheetRows: MAX_IMPORT_ROWS + 2 })
  return workbook.SheetNames.map(name => {
    const sheet = workbook.Sheets[name]
    const range = XLSX.utils.decode_range(sheet["!fullref"] || sheet["!ref"] || "A1")
    if (range.e.r - range.s.r > MAX_IMPORT_ROWS) throw new Error(`La feuille « ${name} » dépasse ${MAX_IMPORT_ROWS} lignes. Réduisez la période du fichier.`)
    if (range.e.c - range.s.c > 100) throw new Error("Le fichier contient trop de colonnes (101 maximum).")
    if (!sheet["!ref"]) return { name, headers: [], rows: [] }
    const readRow = (row: number) => Array.from({ length: range.e.c - range.s.c + 1 }, (_, index) => {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c: range.s.c + index })]
      if (!cell) return ""
      // Normalize Excel date/time cells independently of their display locale.
      if (cell.t === "n" && cell.z && XLSX.SSF.is_date(cell.z)) {
        return excelDate(cell.v, !!workbook.Workbook?.WBProps?.date1904)
      }
      return cell.w ?? String(cell.v ?? "")
    })
    return {
      name,
      headers: readRow(range.s.r).map((header, index) => header.trim() || `Colonne ${index + 1}`),
      rows: Array.from({ length: range.e.r - range.s.r }, (_, index) => {
        const row = range.s.r + index + 1
        return { row: row + 1, cells: readRow(row) }
      }).filter(record => record.cells.some(cell => cell.trim())),
    }
  })
}

function excelDate(serial: number, date1904: boolean): string {
  const date = XLSX.SSF.parse_date_code(serial, { date1904 })
  if (!date) return String(serial)
  const pad = (value: number) => String(value).padStart(2, "0")
  const time = `${pad(date.H)}:${pad(date.M)}:${pad(date.S)}`
  if (serial < 1) return time
  return `${date.y}-${pad(date.m)}-${pad(date.d)} ${time}`
}

export function guessColumns(headers: string[]) {
  const normalized = headers.map(header => header.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, ""))
  const id = normalized.findIndex(header => /^(nlot|nolot|numerolot|numerodelot|lot|lotnumber|lotid|id|customid|idpersonnalise)$/.test(header))
  const date = normalized.findIndex(header => /^(date|datetime|timestamp|horodatage|dateheure|createdat|datecreation|dateproduction)$/.test(header))
  const time = normalized.findIndex(header => /^(heure|time|heureproduction)$/.test(header))
  return { id, date, time }
}

const dateTimePattern = /^(\d{4}-\d{2}-\d{2}|\d{1,2}[/.\-]\d{1,2}[/.\-]\d{4})[ T]\d{1,2}:\d{2}/
const datePattern = /^(\d{4}-\d{2}-\d{2}|\d{1,2}[/.\-]\d{1,2}[/.\-]\d{4})$/
const timePattern = /^\d{1,2}:\d{2}(:\d{2})?([.,]\d{1,3})?$/

// Picks columns from headers first, then from cell contents, so files import without manual mapping.
export function detectColumns(sheet: MachineSheet): Omit<ColumnMapping, "zone"> {
  let { id, date, time } = guessColumns(sheet.headers)
  const sample = sheet.rows.slice(0, 50)
  const matches = (column: number, pattern: RegExp) => {
    const values = sample.map(row => row.cells[column]?.trim()).filter(Boolean)
    return values.length > 0 && values.every(value => pattern.test(value))
  }
  const columns = sheet.headers.map((_, index) => index)
  if (date < 0) date = columns.find(index => matches(index, dateTimePattern)) ?? -1
  if (date < 0) {
    date = columns.find(index => matches(index, datePattern)) ?? -1
    if (date >= 0 && time < 0) time = columns.find(index => index !== date && matches(index, timePattern)) ?? -1
  }
  if (date >= 0 && time >= 0 && matches(date, dateTimePattern)) time = -1
  if (id < 0) {
    id = columns.find(index => index !== date && index !== time && sample.some(row => row.cells[index]?.trim())) ?? -1
  }
  // Regional dates: a first part above 12 means day first, a second part above 12 means month first.
  let dateOrder: "dmy" | "mdy" = "dmy"
  if (date >= 0) for (const row of sheet.rows) {
    const parts = row.cells[date]?.trim().match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-]\d{4}/)
    if (parts && Number(parts[1]) > 12) { dateOrder = "dmy"; break }
    if (parts && Number(parts[2]) > 12) { dateOrder = "mdy"; break }
  }
  return { id, date, time, dateOrder }
}

export function recordsFromSheet(sheet: MachineSheet, mapping: ColumnMapping): { records: MachineRecord[]; errors: string[] } {
  const records: MachineRecord[] = [], errors: string[] = []
  if (mapping.id < 0 || mapping.date < 0 || mapping.id === mapping.date || mapping.time === mapping.id || mapping.time === mapping.date) {
    return { records, errors: ["Choisissez des colonnes distinctes pour l’ID, la date et l’heure."] }
  }
  for (const source of sheet.rows) {
    const customId = source.cells[mapping.id]?.trim()
    if (!customId || customId.length > 200) {
      errors.push(`Ligne ${source.row} : N°Lot manquant ou trop long (200 caractères maximum).`)
      continue
    }
    try {
      let date = source.cells[mapping.date]?.trim() || ""
      if (mapping.time >= 0) {
        const time = source.cells[mapping.time]?.trim() || ""
        date = `${date.split(/[ T]/)[0]} ${time.replace(/^\d{4}-\d{2}-\d{2}[ T]/, "")}`
      }
      records.push({ row: source.row, customId, timestamp: parseMachineTime(date, mapping.dateOrder, mapping.zone) })
    } catch (error) {
      errors.push(`Ligne ${source.row} : ${error instanceof Error ? error.message : "Date invalide."}`)
    }
  }
  if (!sheet.rows.length) errors.push("La feuille ne contient aucune ligne de données.")
  return { records, errors }
}
