export function groupAnagrams(words) {
  const groups = new Map()
  for (const word of words) {
    const key = [...word].sort().join("")
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(word)
  }
  return [...groups.values()].map((g) => [...g].sort())
}
