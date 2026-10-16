export function rotate(matrix) {
  if (!matrix.length) return []
  const rows = matrix.length
  const cols = matrix[0].length
  const out = []
  for (let c = 0; c < cols; c++) {
    const row = []
    for (let r = 0; r < rows; r++) row.push(matrix[rows - 1 - r][c])
    out.push(row)
  }
  return out
}
