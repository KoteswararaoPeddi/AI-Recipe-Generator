export type ExpiryStatus = "expired" | "soon" | "ok" | "none"

// Compares an ISO expiry date to today. "soon" = within `withinDays`.
export function getExpiryStatus(expiryDate?: string, withinDays = 7): ExpiryStatus {
  if (!expiryDate) return "none"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const days = Math.round((expiry.getTime() - today.getTime()) / 86_400_000)
  if (days < 0) return "expired"
  if (days <= withinDays) return "soon"
  return "ok"
}

export function formatExpiry(expiryDate: string): string {
  return new Date(expiryDate).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}
