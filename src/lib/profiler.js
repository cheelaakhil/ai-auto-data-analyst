// src/lib/profiler.js
// Computes a lightweight statistical profile of the dataset
// This is what gets sent to Claude (not the raw data — saves tokens!)

export function profileDataset(data, fields, fileName) {
  const rowCount = data.length
  const colCount = fields.length

  const columns = fields.map((field) => {
    const values = data.map((row) => row[field])
    const nonNull = values.filter((v) => v !== null && v !== undefined && v !== '')
    const nullCount = rowCount - nonNull.length
    const nullPct = parseFloat(((nullCount / rowCount) * 100).toFixed(1))
    const unique = new Set(nonNull.map(String)).size
    const sampleValues = [...new Set(nonNull.map(String))].slice(0, 5)

    // Infer type
    const numericValues = nonNull.filter((v) => !isNaN(Number(v)) && v !== '')
    const isNumeric = numericValues.length > nonNull.length * 0.8
    const isDate = !isNumeric && nonNull.some((v) => isDateLike(v))
    const isId = unique === rowCount || field.toLowerCase().includes('id')

    let inferredType = 'dimension'
    if (isId && unique > rowCount * 0.9) inferredType = 'identifier'
    else if (isNumeric) inferredType = 'measure'
    else if (isDate) inferredType = 'datetime'
    else if (unique < 30 && unique / rowCount < 0.2) inferredType = 'dimension'
    else inferredType = 'text'

    const stats = {}
    if (isNumeric && numericValues.length > 0) {
      const nums = numericValues.map(Number).sort((a, b) => a - b)
      stats.min = nums[0]
      stats.max = nums[nums.length - 1]
      stats.mean = parseFloat((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2))
      stats.median = nums[Math.floor(nums.length / 2)]
      // Value counts for top categories
    } else if (inferredType === 'dimension') {
      const counts = {}
      nonNull.forEach((v) => { counts[String(v)] = (counts[String(v)] || 0) + 1 })
      stats.topValues = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([val, count]) => ({ val, count, pct: parseFloat(((count / rowCount) * 100).toFixed(1)) }))
    }

    return {
      name: field,
      inferredType,
      nullCount,
      nullPct,
      uniqueCount: unique,
      uniqueRate: parseFloat(((unique / rowCount) * 100).toFixed(1)),
      sampleValues,
      stats,
    }
  })

  // Detect duplicates
  const rowStrings = data.map((r) => JSON.stringify(r))
  const duplicateCount = rowStrings.length - new Set(rowStrings).size

  // Basic correlations (numeric pairs)
  const numericCols = columns.filter((c) => c.inferredType === 'measure')
  const correlations = []
  for (let i = 0; i < Math.min(numericCols.length, 5); i++) {
    for (let j = i + 1; j < Math.min(numericCols.length, 5); j++) {
      const a = data.map((r) => Number(r[numericCols[i].name])).filter((v) => !isNaN(v))
      const b = data.map((r) => Number(r[numericCols[j].name])).filter((v) => !isNaN(v))
      if (a.length > 10) {
        const corr = pearsonCorrelation(a, b)
        correlations.push({ col1: numericCols[i].name, col2: numericCols[j].name, correlation: parseFloat(corr.toFixed(3)) })
      }
    }
  }

  return {
    fileName,
    rowCount,
    colCount,
    duplicateCount,
    columns,
    correlations,
    sampleRows: data.slice(0, 5),
    dataQualityScore: computeQualityScore(columns, duplicateCount, rowCount),
  }
}

function isDateLike(v) {
  if (typeof v !== 'string' && typeof v !== 'number') return false
  const s = String(v)
  return (
    /\d{4}-\d{2}-\d{2}/.test(s) ||
    /\d{2}\/\d{2}\/\d{4}/.test(s) ||
    /\d{10,13}/.test(s) ||
    (!isNaN(Date.parse(s)) && s.length > 6)
  )
}

function pearsonCorrelation(x, y) {
  const n = Math.min(x.length, y.length)
  if (n < 3) return 0
  const xa = x.slice(0, n), ya = y.slice(0, n)
  const mx = xa.reduce((a, b) => a + b, 0) / n
  const my = ya.reduce((a, b) => a + b, 0) / n
  const num = xa.reduce((s, xi, i) => s + (xi - mx) * (ya[i] - my), 0)
  const den = Math.sqrt(
    xa.reduce((s, xi) => s + (xi - mx) ** 2, 0) *
    ya.reduce((s, yi) => s + (yi - my) ** 2, 0)
  )
  return den === 0 ? 0 : num / den
}

function computeQualityScore(columns, duplicateCount, rowCount) {
  let score = 100
  columns.forEach((c) => {
    if (c.nullPct > 50) score -= 10
    else if (c.nullPct > 20) score -= 5
    else if (c.nullPct > 5) score -= 2
  })
  if (duplicateCount > 0) score -= Math.min(20, (duplicateCount / rowCount) * 100)
  return Math.max(0, Math.round(score))
}
