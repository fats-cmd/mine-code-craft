export function encode(s) {
  if (!s) return ""
  let out = ""
  let runChar = s[0]
  let runLen = 1
  for (const ch of s.slice(1)) {
    if (ch === runChar) runLen++
    else {
      out += runChar + runLen
      runChar = ch
      runLen = 1
    }
  }
  return out + runChar + runLen
}
