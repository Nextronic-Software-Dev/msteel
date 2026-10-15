import test from 'node:test'
import assert from 'node:assert/strict'
import { matchMachineIdsToImages } from './import-machine-id-matcher.js'

test('matches imported ids by time with a small second drift and sorted order', () => {
  const images = [
    { id: 1, createdAt: new Date('2026-10-05T08:00:00.000Z') },
    { id: 2, createdAt: new Date('2026-10-05T08:00:10.000Z') },
    { id: 3, createdAt: new Date('2026-10-05T08:00:20.000Z') },
    { id: 4, createdAt: new Date('2026-10-05T08:00:30.000Z') },
  ]

  const importedRows = [
    { time: new Date('2026-10-05T08:00:00.500Z'), id: 'A100' },
    { time: new Date('2026-10-05T08:00:11.300Z'), id: 'A101' },
    { time: new Date('2026-10-05T08:00:19.900Z'), id: 'A102' },
    { time: new Date('2026-10-05T08:00:31.200Z'), id: 'A103' },
  ]

  const matched = matchMachineIdsToImages(images, importedRows, 30000)

  assert.deepEqual(matched.map(({ id, importedId }) => ({ id, importedId })), [
    { id: 1, importedId: 'A100' },
    { id: 2, importedId: 'A101' },
    { id: 3, importedId: 'A102' },
    { id: 4, importedId: 'A103' },
  ])
})

test('ignores rows that are too far from the event time', () => {
  const images = [
    { id: 10, createdAt: new Date('2026-10-05T09:00:00.000Z') },
    { id: 11, createdAt: new Date('2026-10-05T09:00:10.000Z') },
  ]

  const importedRows = [
    { time: new Date('2026-10-05T09:00:00.000Z'), id: 'X1' },
    { time: new Date('2026-10-05T09:10:00.000Z'), id: 'X2' },
  ]

  const matched = matchMachineIdsToImages(images, importedRows, 5000)
  assert.deepEqual(matched.map(({ importedId }) => importedId), ['X1'])
})
