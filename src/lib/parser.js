// src/lib/parser.js
import Papa from 'papaparse'

export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'csv') return parseCSV(file)
  if (['xlsx', 'xls'].includes(ext)) return parseExcel(file)
  throw new Error(`Unsupported file type: .${ext}. Use CSV or Excel.`)
}

function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          reject(new Error('Failed to parse CSV: ' + results.errors[0].message))
        } else {
          resolve({ data: results.data, fields: results.meta.fields || [] })
        }
      },
      error: (err) => reject(new Error('CSV parse error: ' + err.message)),
    })
  })
}

async function parseExcel(file) {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json(ws, { defval: null })
  const fields = raw.length > 0 ? Object.keys(raw[0]) : []
  return { data: raw, fields }
}
