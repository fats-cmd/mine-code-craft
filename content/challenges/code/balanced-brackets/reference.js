export function isBalanced(s) {
  const closing = { ")": "(", "]": "[", "}": "{" }
  const stack = []
  for (const ch of s) {
    if ("([{".includes(ch)) stack.push(ch)
    else if (ch in closing) {
      if (!stack.length || stack.pop() !== closing[ch]) return false
    }
  }
  return stack.length === 0
}
