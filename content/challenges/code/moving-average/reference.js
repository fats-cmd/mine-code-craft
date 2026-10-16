export function movingAverage(nums, k) {
  if (k <= 0 || k > nums.length) return []
  const out = []
  for (let i = 0; i + k <= nums.length; i++) {
    let sum = 0
    for (let j = i; j < i + k; j++) sum += nums[j]
    out.push(sum / k)
  }
  return out
}
