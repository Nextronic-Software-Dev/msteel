export const MAX_IMPORT_ROWS = 2000
export const MAX_MATCH_CELLS = 4_000_000

export type MachineRecord = { row: number; customId: string; timestamp: string }
export type ImportRequest = { records: MachineRecord[]; toleranceSeconds: number }
export type ImportEvent = {
  id: number
  createdAt: string
  updatedAt: string
  customId: string | null
  sent: boolean
}
export type ImportStatus = "ready" | "unmatched" | "ambiguous" | "existing" | "conflict" | "duplicate" | "sent"
export type ImportMatch = MachineRecord & {
  status: ImportStatus
  eventId?: number
  eventTime?: string
  differenceSeconds?: number
  existingId?: string | null
}
export type ImportPreview = { matches: ImportMatch[]; fingerprint: string }

/** Global sequence alignment: maximize pairs, then minimize total time difference.
 * Both sequences are chronological; a record/event can only be used once.
 * Forward/backward scores identify every optimal alternative, so ties are never
 * silently resolved by database order or a greedy nearest-neighbour choice.
 */
export function matchMachineRecords(
  records: MachineRecord[], events: ImportEvent[], toleranceSeconds: number,
  usedIds: { id: number; customId: string | null }[] = [],
): ImportMatch[] {
  if (!Number.isInteger(toleranceSeconds) || toleranceSeconds < 0 || toleranceSeconds > 900) {
    throw new Error("La tolérance doit être comprise entre 0 et 900 secondes (15 minutes).")
  }
  const machine = [...records].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp) || a.row - b.row)
  const platform = [...events].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id - b.id)
  const n = machine.length, m = platform.length, width = m + 1
  if (n > MAX_IMPORT_ROWS || (n + 1) * width > MAX_MATCH_CELLS) {
    throw new Error("Trop de données à comparer. Importez un fichier couvrant une période plus courte.")
  }
  const times = machine.map(record => Date.parse(record.timestamp))
  const eventTimes = platform.map(event => Date.parse(event.createdAt))
  if ([...times, ...eventTimes].some(time => !Number.isFinite(time))) throw new Error("Date invalide.")
  const tolerance = toleranceSeconds * 1000
  // One extra match always outweighs all possible time differences (integer ms).
  const reward = Math.min(n, m) * tolerance + 1
  const forward = new Float64Array((n + 1) * width)
  const backward = new Float64Array((n + 1) * width)
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const delta = Math.abs(times[i - 1] - eventTimes[j - 1])
      forward[i * width + j] = Math.max(
        forward[(i - 1) * width + j], forward[i * width + j - 1],
        delta <= tolerance ? forward[(i - 1) * width + j - 1] + reward - delta : -Infinity,
      )
    }
  }
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      const delta = Math.abs(times[i] - eventTimes[j])
      backward[i * width + j] = Math.max(
        backward[(i + 1) * width + j], backward[i * width + j + 1],
        delta <= tolerance ? backward[(i + 1) * width + j + 1] + reward - delta : -Infinity,
      )
    }
  }
  const optimum = forward[n * width + m]
  const counts = new Map<string, number>()
  for (const record of machine) counts.set(record.customId, (counts.get(record.customId) || 0) + 1)
  const owners = new Map<string, Set<number>>()
  for (const event of [...events, ...usedIds]) {
    if (event.customId) {
      if (!owners.has(event.customId)) owners.set(event.customId, new Set())
      owners.get(event.customId)!.add(event.id)
    }
  }
  return machine.map((record, i) => {
    const candidates: number[] = []
    let canSkip = false
    for (let j = 0; j <= m; j++) {
      if (forward[i * width + j] + backward[(i + 1) * width + j] === optimum) canSkip = true
      if (j < m) {
        const delta = Math.abs(times[i] - eventTimes[j])
        if (delta <= tolerance && forward[i * width + j] + reward - delta + backward[(i + 1) * width + j + 1] === optimum) {
          candidates.push(j)
        }
      }
    }
    if ((counts.get(record.customId) || 0) > 1) return { ...record, status: "duplicate" }
    if (!candidates.length) return { ...record, status: "unmatched" }
    if (candidates.length > 1 || canSkip) return { ...record, status: "ambiguous" }
    const event = platform[candidates[0]]
    const duplicate = Array.from(owners.get(record.customId) || []).some(id => id !== event.id)
    const status: ImportStatus = duplicate ? "duplicate"
      : event.customId === record.customId ? "existing"
      : event.customId ? "conflict"
      : event.sent ? "sent" : "ready"
    return {
      ...record, status, eventId: event.id, eventTime: event.createdAt,
      differenceSeconds: (Date.parse(event.createdAt) - times[i]) / 1000,
      existingId: event.customId,
    }
  })
}

/** Parse explicit numeric date formats; never rely on locale-dependent Date.parse. */
export function parseMachineTime(value: string, dateOrder: "dmy" | "mdy", zone: "local" | "utc"): string {
  const input = value.trim()
  const iso = input.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})(?::(\d{2})(?:[.,](\d{1,3}))?)?\s*(Z|[+-]\d{2}:?\d{2})?$/i)
  const regional = input.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})[ T](\d{1,2}):(\d{2})(?::(\d{2})(?:[.,](\d{1,3}))?)?$/)
  if (!iso && !regional) throw new Error("Date attendue : JJ/MM/AAAA HH:mm:ss ou AAAA-MM-JJ HH:mm:ss (date et heure obligatoires).")
  const parts = (iso || regional)!
  const year = Number(iso ? parts[1] : parts[3])
  const month = Number(iso ? parts[2] : dateOrder === "dmy" ? parts[2] : parts[1])
  const day = Number(iso ? parts[3] : dateOrder === "dmy" ? parts[1] : parts[2])
  const hour = Number(parts[4]), minute = Number(parts[5]), second = Number(parts[6] || 0)
  const ms = Number((parts[7] || "").padEnd(3, "0"))
  const utc = new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms))
  if (year < 1900 || year > 2200 || utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day || hour > 23 || minute > 59 || second > 59) {
    throw new Error("Date ou heure invalide.")
  }
  const offset = iso?.[8]
  if (offset && offset.toUpperCase() !== "Z") {
    const digits = offset.slice(1).replace(":", "")
    const hours = Number(digits.slice(0, 2)), minutes = Number(digits.slice(2))
    if (hours > 14 || minutes > 59 || (hours === 14 && minutes !== 0)) throw new Error("Décalage horaire invalide.")
    return new Date(utc.getTime() - (offset[0] === "+" ? 1 : -1) * (hours * 60 + minutes) * 60000).toISOString()
  }
  if (offset || zone === "utc") return utc.toISOString()
  const local = new Date(year, month - 1, day, hour, minute, second, ms)
  if (local.getFullYear() !== year || local.getMonth() !== month - 1 || local.getDate() !== day || local.getHours() !== hour || local.getMinutes() !== minute) {
    throw new Error("Heure locale inexistante lors du changement d’heure.")
  }
  // A repeated wall time during DST cannot identify an instant without an offset.
  for (const shift of [-120, -60, -30, 30, 60, 120]) {
    const alternate = new Date(local.getTime() + shift * 60000)
    if (alternate.getFullYear() === year && alternate.getMonth() === month - 1 && alternate.getDate() === day && alternate.getHours() === hour && alternate.getMinutes() === minute) {
      throw new Error("Heure locale ambiguë : utilisez une date ISO avec décalage horaire.")
    }
  }
  return local.toISOString()
}
