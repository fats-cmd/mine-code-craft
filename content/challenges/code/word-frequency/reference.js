export function wordFrequency(text) {
  const counts = {}
  for (const word of text.match(/[a-zA-Z]+/g) ?? []) {
    const w = word.toLowerCase()
    counts[w] = (counts[w] ?? 0) + 1
  }
  return counts
}
