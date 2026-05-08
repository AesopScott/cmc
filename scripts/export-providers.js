import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PLACEHOLDER = '/img/2024__02__headshot-placeholder@2x.jpg'

const providers = JSON.parse(
  readFileSync(resolve(__dirname, '../src/data/providers.json'), 'utf8')
)

function csvCell(value) {
  const str = value == null ? '' : String(value).trim()
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

const headers = [
  'ID',
  'First Name',
  'Last Name',
  'Full Name',
  'Credentials',
  'Specialties',
  'Languages',
  'Locations',
  'Has Photo',
  'Slug',
]

const rows = providers.map((p) => {
  const meta = p.meta ?? {}
  const terms = p.terms ?? {}

  const locations = meta['ignyte_locations[]']
    ? Object.values(meta['ignyte_locations[]']).join('; ')
    : ''

  const specialties = (terms.ignyte_specialty ?? []).join('; ')
  const languages = (terms.ignyte_lang ?? []).join('; ')
  const hasPhoto = p.thumbnail && p.thumbnail !== PLACEHOLDER ? 'Y' : 'N'

  return [
    p.id,
    meta['ignyte-provider-fname'] ?? '',
    meta['ignyte-provider-lname'] ?? '',
    p.title,
    meta['ignyte-provider-position'] ?? '',
    specialties,
    languages,
    locations,
    hasPhoto,
    p.slug,
  ].map(csvCell)
})

const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')

const outPath = resolve(__dirname, '../providers-export.csv')
writeFileSync(outPath, csv, 'utf8')
console.log(`Exported ${rows.length} providers → ${outPath}`)
