export function nextValue(sequence) {
  const rows = [[...sequence]]
  while (new Set(rows[rows.length - 1]).size > 1 && rows[rows.length - 1].length > 1) {
    const last = rows[rows.length - 1]
    rows.push(last.slice(1).map((b, i) => b - last[i]))
  }
  return rows.reduce((total, row) => total + row[row.length - 1], 0)
}
