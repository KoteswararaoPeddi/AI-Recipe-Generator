// Scales an ingredient amount string (e.g. "1.5 pounds") by a serving factor and reformats
// the numeric prefix to two decimals — matching the recipe detail design. Strings without a
// leading number (e.g. "to taste") are returned unchanged.
export function scaleAmount(amount: string, factor: number): string {
  const match = amount.match(/^(\d*\.?\d+)\s*(.*)$/)
  if (!match) return amount

  const value = Number.parseFloat(match[1]) * factor
  const formatted = value.toFixed(2)
  return match[2] ? `${formatted} ${match[2]}` : formatted
}
