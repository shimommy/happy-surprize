// 小数点第３位までを四捨五入
export function round(value: number): number {
  return Math.round(value * 1000) / 1000
}
