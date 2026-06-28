// Week math for the meal planner. The grid is keyed by ISO date + slot, so these helpers
// produce a Monday-anchored 7-day window for a given week offset relative to the current week.

export type WeekDay = {
  date: Date
  /** Short weekday name, e.g. "Mon". */
  label: string
  /** Day-of-month number, e.g. 23. */
  dayNum: number
  /** `YYYY-MM-DD`, used as the stable key half for a planned slot. */
  iso: string
  isToday: boolean
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

function startOfWeek(input: Date): Date {
  const date = new Date(input)
  date.setHours(0, 0, 0, 0)
  // getDay(): Sun=0..Sat=6 → shift so Monday is the first column.
  const fromMonday = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - fromMonday)
  return date
}

function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`
}

/** The 7 days of the week `offset` weeks away from today (0 = current week). */
export function getWeek(offset: number): WeekDay[] {
  const start = startOfWeek(new Date())
  start.setDate(start.getDate() + offset * 7)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    return {
      date,
      label: DAY_NAMES[i],
      dayNum: date.getDate(),
      iso: isoDate(date),
      isToday: date.getTime() === today.getTime(),
    }
  })
}

/** Human-readable range for the week header, e.g. "Jun 23 – Jun 29, 2026". */
export function formatWeekRange(week: WeekDay[]): string {
  const first = week[0].date
  const last = week[6].date
  const month = (d: Date) => d.toLocaleDateString("en-US", { month: "short" })
  const left = `${month(first)} ${first.getDate()}`
  const right = `${month(last)} ${last.getDate()}, ${last.getFullYear()}`
  return `${left} – ${right}`
}
