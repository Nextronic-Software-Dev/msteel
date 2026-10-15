const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const ts = require("typescript")
const XLSX = require("xlsx")

// Exercise the actual TypeScript modules without adding a test-runner dependency.
require.extensions[".ts"] = (module, filename) => {
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText
  module._compile(source, filename)
}
const { matchMachineRecords, parseMachineTime } = require("../src/lib/id-import.ts")
const { readMachineFile, guessColumns, detectColumns, recordsFromSheet } = require("../src/lib/machine-file.ts")
const base = Date.parse("2026-10-15T08:00:00Z")
const time = seconds => new Date(base + seconds * 1000).toISOString()
const record = (seconds, row = 2, customId = `LOT-${row}`) => ({ row, customId, timestamp: time(seconds) })
const event = (seconds, id = 1, extra = {}) => ({ id, createdAt: time(seconds), updatedAt: time(100), customId: null, sent: false, ...extra })

test("sorts reverse inputs and only matches events after the machine time", () => {
  const result = matchMachineRecords([record(29.5, 5), record(18.9, 4), record(9.3, 3), record(-0.5)], [event(30, 4), event(20, 3), event(10, 2), event(0)], 3)
  assert.deepEqual(result.map(item => [item.row, item.eventId, item.status]), [[2, 1, "ready"], [3, 2, "ready"], [4, 3, "ready"], [5, 4, "ready"]])
  assert.equal(result[0].differenceSeconds, 0.5)
  assert.equal(result[2].differenceSeconds, 1.1)
  assert.equal(matchMachineRecords([record(1)], [event(0)], 5)[0].status, "unmatched")
})

test("global alignment avoids a greedy match stealing the next event", () => {
  const result = matchMachineRecords([record(0), record(6, 3)], [event(6), event(10, 2)], 6)
  assert.deepEqual(result.map(item => item.eventId), [1, 2])
})

test("skips missing events without shifting later IDs", () => {
  const result = matchMachineRecords([record(-1), record(30, 3), record(59, 4)], [event(0), event(60, 2)], 2)
  assert.deepEqual(result.map(item => item.status), ["ready", "unmatched", "ready"])
  assert.equal(result[2].eventId, 2)
})

test("tolerance boundary is inclusive and accepts midnight crossover", () => {
  const result = matchMachineRecords([{ ...record(0), timestamp: "2026-10-15T23:59:59Z" }], [{ ...event(0), createdAt: "2026-10-16T00:00:01Z" }], 2)
  assert.equal(result[0].status, "ready")
  assert.equal(matchMachineRecords([record(-2.001)], [event(0)], 2)[0].status, "unmatched")
})

test("flags equal-distance alternatives and competition for the same event", () => {
  assert.equal(matchMachineRecords([record(0)], [event(5), event(5, 2)], 5)[0].status, "ambiguous")
  assert.deepEqual(matchMachineRecords([record(0), record(0, 3)], [event(5)], 5).map(item => item.status), ["ambiguous", "ambiguous"])
})

test("equal timestamps use stable source row and event ID order", () => {
  assert.deepEqual(matchMachineRecords([record(0, 3), record(0)], [event(0, 2), event(0)], 0).map(item => item.eventId), [1, 2])
})

test("preserves existing IDs and reserves sent/occupied events in sequence", () => {
  const result = matchMachineRecords([record(0), record(10, 3), record(20, 4), record(30, 5)], [
    event(0, 1, { customId: "LOT-2" }), event(10, 2, { customId: "MANUAL" }), event(20, 3, { sent: true }), event(30, 4),
  ], 10)
  assert.deepEqual(result.map(item => item.status), ["existing", "conflict", "sent", "ready"])
  assert.equal(result[3].eventId, 4)
})

test("rejects repeated N°Lot and IDs already used outside the time window", () => {
  assert.deepEqual(matchMachineRecords([record(0, 2, "001"), record(10, 3, "001")], [event(0), event(10, 2)], 1).map(item => item.status), ["duplicate", "duplicate"])
  assert.equal(matchMachineRecords([record(0, 2, "001")], [event(0)], 1, [{ id: 999, customId: "001" }])[0].status, "duplicate")
})

test("handles empty candidates, zero tolerance and resource limits", () => {
  assert.equal(matchMachineRecords([record(0)], [], 1)[0].status, "unmatched")
  assert.equal(matchMachineRecords([record(0)], [event(0)], 0)[0].status, "ready")
  assert.throws(() => matchMachineRecords([record(0)], [], -1))
  assert.throws(() => matchMachineRecords(Array.from({ length: 2001 }, (_, i) => record(i, i + 2)), [], 1))
})

test("alignment and ambiguity agree with exhaustive ordered assignments", () => {
  let seed = 37
  const random = max => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % max }
  for (let sample = 0; sample < 200; sample++) {
    const machine = Array.from({ length: 1 + random(4) }, () => random(15)).sort((a, b) => a - b)
    const platform = Array.from({ length: 1 + random(4) }, () => random(15)).sort((a, b) => a - b)
    const tolerance = random(6)
    let bestCount = -1, bestCost = Infinity, best = []
    const enumerate = (i, start, assignment, count, cost) => {
      if (i === machine.length) {
        if (count > bestCount || (count === bestCount && cost < bestCost)) { bestCount = count; bestCost = cost; best = [] }
        if (count === bestCount && cost === bestCost) best.push(assignment)
        return
      }
      enumerate(i + 1, start, [...assignment, null], count, cost)
      for (let j = start; j < platform.length; j++) {
        const delta = platform[j] - machine[i]
        if (delta >= 0 && delta <= tolerance) enumerate(i + 1, j + 1, [...assignment, j + 1], count + 1, cost + delta)
      }
    }
    enumerate(0, 0, [], 0, 0)
    const result = matchMachineRecords(machine.map((seconds, i) => record(seconds, i + 2)), platform.map((seconds, i) => event(seconds, i + 1)), tolerance)
    result.forEach((match, i) => {
      const alternatives = new Set(best.map(assignment => assignment[i]))
      assert.equal(match.status, alternatives.size > 1 ? "ambiguous" : alternatives.has(null) ? "unmatched" : "ready")
      if (match.status === "ready") assert.equal(match.eventId, [...alternatives][0])
    })
  }
})

test("parses French, US, ISO and timezone-aware timestamps with milliseconds", () => {
  assert.equal(parseMachineTime("15/10/2026 08:00:00", "dmy", "utc"), time(0))
  assert.equal(parseMachineTime("10/15/2026 08:00:00", "mdy", "utc"), time(0))
  assert.equal(parseMachineTime("2026-10-15 08:00:00.125", "dmy", "utc"), time(0.125))
  assert.equal(parseMachineTime("2026-10-15T09:00:00+01:00", "dmy", "local"), time(0))
  assert.equal(parseMachineTime("2026-10-15T08:00:00Z", "dmy", "local"), time(0))
})

test("rejects impossible dates and times without a date", () => {
  for (const input of ["31/02/2026 08:00:00", "15/10/2026 24:00:00", "08:00:00", "2026-10-15", "2026-10-15T08:00:00+14:30"]) {
    assert.throws(() => parseMachineTime(input, "dmy", "utc"), input)
  }
})

test("recognizes N°Lot and preserves leading zeros in semicolon CSV", () => {
  const sheets = readMachineFile(Buffer.from("N°Lot;Date;Heure\n000123;15/10/2026;08:00:00\n000124;15/10/2026;08:00:10", "utf8"))
  const mapping = { ...guessColumns(sheets[0].headers), dateOrder: "dmy", zone: "utc" }
  assert.deepEqual(guessColumns(sheets[0].headers), { id: 0, date: 1, time: 2 })
  const result = recordsFromSheet(sheets[0], mapping)
  assert.deepEqual(result.errors, [])
  assert.equal(result.records[0].customId, "000123")
  assert.equal(result.records[1].timestamp, time(10))
})

test("reads CSV quoting, blank rows and TSV", () => {
  const [sheet] = readMachineFile(Buffer.from('N°Lot,Date\n"A,123",2026-10-15 08:00:00\n\nB,2026-10-15 08:00:10'))
  assert.equal(sheet.rows[0].cells[0], "A,123")
  assert.equal(sheet.rows.length, 2)
  assert.equal(sheet.rows[1].row, 4)
  const [tsv] = readMachineFile(Buffer.from("N°Lot\tDate\n001\t2026-10-15 08:00:00"))
  assert.equal(tsv.rows[0].cells[0], "001")
})

test("reads formatted Excel IDs, native date/time cells and multiple sheets", () => {
  const workbook = XLSX.utils.book_new()
  const sheet = XLSX.utils.aoa_to_sheet([["N°Lot", "Date", "Heure"], [123, 46310, 1 / 3]])
  sheet.A2.z = "000000"
  sheet.B2.z = "dd/mm/yyyy"
  sheet.C2.z = "hh:mm:ss"
  XLSX.utils.book_append_sheet(workbook, sheet, "Machine")
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Other"]]), "Second")
  const sheets = readMachineFile(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }))
  assert.equal(sheets.length, 2)
  assert.equal(sheets[0].rows[0].cells[0], "000123")
  const result = recordsFromSheet(sheets[0], { id: 0, date: 1, time: 2, dateOrder: "dmy", zone: "utc" })
  assert.deepEqual(result.errors, [])
  assert.equal(result.records[0].timestamp, time(0))
})

test("invalid rows are reported with source line numbers; no silent skipping", () => {
  const [sheet] = readMachineFile(Buffer.from("N°Lot;Date\n;15/10/2026 08:00:00\n001;bad-date"))
  const result = recordsFromSheet(sheet, { id: 0, date: 1, time: -1, dateOrder: "dmy", zone: "utc" })
  assert.equal(result.records.length, 0)
  assert.match(result.errors[0], /Ligne 2/)
  assert.match(result.errors[1], /Ligne 3/)
})

test("rejects over-limit files before matching and invalid column mappings", () => {
  assert.throws(() => readMachineFile(Buffer.from("N°Lot;Date\n" + Array.from({ length: 2001 }, (_, i) => `${i};2026-10-15 08:00:00`).join("\n"))))
  const [sheet] = readMachineFile(Buffer.from("N°Lot;Date\n001;2026-10-15 08:00:00"))
  assert.equal(recordsFromSheet(sheet, { id: 0, date: 0, time: -1, dateOrder: "dmy", zone: "utc" }).errors.length, 1)
})

test("reads Windows-1252 and UTF-16 machine exports", () => {
  const csv = "N°Lot;Date\n001;2026-10-15 08:00:00"
  for (const bytes of [Buffer.from(csv, "latin1"), Buffer.from("\ufeff" + csv, "utf16le")]) {
    const [sheet] = readMachineFile(bytes)
    assert.equal(guessColumns(sheet.headers).id, 0)
    assert.equal(sheet.rows[0].cells[0], "001")
  }
})

// The action harness isolates database/auth/cache effects, exercising the real
// preview revalidation and all-or-nothing save logic without touching user data.
const Module = require("node:module")
const path = require("node:path")
let authenticated = true, databaseRows = [], transactionCalls = 0, failUpdateId = null
const fakeDb = {
  $transaction: async callback => {
    transactionCalls++
    const draft = structuredClone(databaseRows)
    const client = { processedImage: {
      findMany: async args => {
        if (args.where.customId) return draft.filter(row => args.where.customId.in.includes(row.customId)).map(({ id, customId }) => ({ id, customId }))
        return draft.filter(row => row.createdAt >= args.where.createdAt.gte && row.createdAt <= args.where.createdAt.lte).sort((a, b) => a.createdAt - b.createdAt || a.id - b.id).slice(0, args.take)
      },
      updateMany: async args => {
        const row = draft.find(row => row.id === args.where.id)
        if (!row || row.customId || row.sent || row.id === failUpdateId) return { count: 0 }
        row.customId = args.data.customId
        return { count: 1 }
      },
    } }
    const result = await callback(client)
    databaseRows = draft
    return result
  },
}
const actionPath = path.resolve(__dirname, "../src/lib/id-import-actions.ts")
const actionModule = new Module(actionPath, module)
actionModule.filename = actionPath
actionModule.paths = Module._nodeModulePaths(path.dirname(actionPath))
const originalRequire = actionModule.require.bind(actionModule)
actionModule.require = name => name === "./auth" ? { getServerSession: async () => authenticated ? { user: { id: 1 } } : null }
  : name === "./db" ? { db: fakeDb }
  : name === "next/cache" ? { revalidatePath: () => {} }
  : originalRequire(name)
require.extensions[".ts"](actionModule, actionPath)
const { previewIdImport, applyIdImport } = actionModule.exports
const dbEvent = (seconds, id = 1, extra = {}) => ({ ...event(seconds, id, extra), createdAt: new Date(time(seconds)), updatedAt: new Date(time(100)) })
const withoutExpectedLog = async callback => {
  const original = console.error
  console.error = () => {}
  try { return await callback() } finally { console.error = original }
}

test("both server actions require authentication before database access", async () => {
  authenticated = false
  transactionCalls = 0
  const input = { records: [record(0)], toleranceSeconds: 10 }
  assert.equal((await previewIdImport(input)).success, false)
  assert.equal((await applyIdImport(input, "a".repeat(64))).success, false)
  assert.equal(transactionCalls, 0)
  authenticated = true
})

test("server rejects malformed input and repeated source row numbers", async () => {
  transactionCalls = 0
  for (const input of [
    { records: [], toleranceSeconds: 10 },
    { records: [record(0), record(10)], toleranceSeconds: 10 },
    { records: [{ ...record(0), timestamp: "bad" }], toleranceSeconds: 10 },
    { records: [record(0)], toleranceSeconds: 901 },
  ]) assert.equal((await previewIdImport(input)).success, false)
  assert.equal(transactionCalls, 0)
})

test("save writes only ready IDs, preserves existing IDs, and reimport is idempotent", async () => {
  databaseRows = [dbEvent(0), dbEvent(10, 2, { customId: "MANUAL" }), dbEvent(20, 3, { sent: true })]
  const input = { records: [record(-1), record(9, 3), record(19, 4)], toleranceSeconds: 5 }
  const result = await previewIdImport(input)
  assert.equal(result.success, true)
  assert.deepEqual(result.preview.matches.map(match => match.status), ["ready", "conflict", "sent"])
  const saved = await applyIdImport(input, result.preview.fingerprint)
  assert.deepEqual(saved, { success: true, count: 1 })
  assert.deepEqual(databaseRows.map(row => row.customId), ["LOT-2", "MANUAL", null])
  const repeated = await previewIdImport(input)
  assert.equal(repeated.preview.matches[0].status, "existing")
  assert.deepEqual(await applyIdImport(input, repeated.preview.fingerprint), { success: true, count: 0 })
})

test("save rejects stale previews after edits or newly received events", async () => {
  const input = { records: [record(0)], toleranceSeconds: 5 }
  for (const mutate of [() => { databaseRows[0].customId = "MANUAL" }, () => { databaseRows.push(dbEvent(2, 2)) }]) {
    databaseRows = [dbEvent(0)]
    const result = await previewIdImport(input)
    mutate()
    const before = structuredClone(databaseRows)
    const saved = await withoutExpectedLog(() => applyIdImport(input, result.preview.fingerprint))
    assert.equal(saved.success, false)
    assert.match(saved.error, /changé/)
    assert.deepEqual(databaseRows, before)
  }
})

test("save rolls back the entire batch if any event becomes unavailable", async () => {
  databaseRows = [dbEvent(0), dbEvent(10, 2)]
  const input = { records: [record(0), record(10, 3)], toleranceSeconds: 1 }
  const result = await previewIdImport(input)
  failUpdateId = 2
  const saved = await withoutExpectedLog(() => applyIdImport(input, result.preview.fingerprint))
  failUpdateId = null
  assert.equal(saved.success, false)
  assert.deepEqual(databaseRows.map(row => row.customId), [null, null])
})

test("detectColumns finds columns from contents when headers are unknown", () => {
  const sheet = { name: "S", headers: ["Ref", "Quand", "Poste"], rows: [
    { row: 2, cells: ["A001", "25/03/2026 08:15:00", "P1"] },
    { row: 3, cells: ["A002", "26/03/2026 09:00:00", "P2"] },
  ] }
  assert.deepEqual(detectColumns(sheet), { id: 0, date: 1, time: -1, dateOrder: "dmy" })
  const split = { name: "S", headers: ["Code", "Jour", "Heure2"], rows: [{ row: 2, cells: ["X", "03/25/2026", "08:15:00"] }] }
  assert.deepEqual(detectColumns(split), { id: 0, date: 1, time: 2, dateOrder: "mdy" })
})
