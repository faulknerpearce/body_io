import { listDatesInRange, shiftISODate, todayISO } from './dateUtils.js'
import { resolveDayBaseBurn, type DayBaseSource } from './netBalance.js'

export interface DailyEnergySnapshot {
  date: string
  intakeCalories: number
  /** Profile BMR used as fallback when no device total. */
  bmr: number
  /** Resolved day base (device total or BMR). */
  baseBurn: number
  baseSource: DayBaseSource
  activityCalories: number
  totalOutput: number
  net: number
  netDelta: number | null
}

export interface DailyEnergyPeriodSummary {
  dayCount: number
  intakeTotal: number
  intakeAverage: number
  bmrTotal: number
  bmrAverage: number
  baseBurnTotal: number
  baseBurnAverage: number
  activityTotal: number
  activityAverage: number
  totalOutputTotal: number
  totalOutputAverage: number
  netTotal: number
  netAverage: number
}

export type TrendsRangePreset = 'last_7' | 'last_30' | 'custom'

export function resolveTrendsDateRange(
  preset: TrendsRangePreset,
  options?: { today?: string; customStart?: string; customEnd?: string },
): { start: string; end: string } {
  const today = options?.today ?? todayISO()

  switch (preset) {
    case 'last_7':
      return { start: shiftISODate(today, -6), end: today }
    case 'last_30':
      return { start: shiftISODate(today, -29), end: today }
    case 'custom': {
      const start = options?.customStart ?? shiftISODate(today, -6)
      const end = options?.customEnd ?? today
      return start <= end ? { start, end } : { start: end, end: start }
    }
    default:
      return { start: shiftISODate(today, -6), end: today }
  }
}

export function buildDailyEnergySnapshots(
  startDate: string,
  endDate: string,
  intakeByDate: Readonly<Record<string, number>>,
  activityByDate: Readonly<Record<string, number>>,
  bmr: number,
  deviceTotalByDate: Readonly<Record<string, number>> = {},
): DailyEnergySnapshot[] {
  const dates = listDatesInRange(startDate, endDate)
  const snapshots: DailyEnergySnapshot[] = []
  let previousNet: number | null = null

  for (const date of dates) {
    const intakeCalories = intakeByDate[date] ?? 0
    const activityCalories = activityByDate[date] ?? 0
    const deviceRaw = deviceTotalByDate[date]
    const deviceTotal =
      deviceRaw !== undefined && Number.isFinite(deviceRaw) ? deviceRaw : null
    const { baseBurn, baseSource } = resolveDayBaseBurn(bmr, deviceTotal)
    const totalOutput = baseBurn + activityCalories
    const net = intakeCalories - totalOutput
    const netDelta = previousNet === null ? null : net - previousNet

    snapshots.push({
      date,
      intakeCalories,
      bmr,
      baseBurn,
      baseSource,
      activityCalories,
      totalOutput,
      net,
      netDelta,
    })
    previousNet = net
  }

  return snapshots
}

export function summarizeDailyEnergyPeriod(rows: DailyEnergySnapshot[]): DailyEnergyPeriodSummary {
  const dayCount = rows.length
  const sum = (pick: (row: DailyEnergySnapshot) => number) =>
    rows.reduce((total, row) => total + pick(row), 0)

  const intakeTotal = sum((row) => row.intakeCalories)
  const bmrTotal = sum((row) => row.bmr)
  const baseBurnTotal = sum((row) => row.baseBurn)
  const activityTotal = sum((row) => row.activityCalories)
  const totalOutputTotal = sum((row) => row.totalOutput)
  const netTotal = sum((row) => row.net)

  const average = (total: number) => (dayCount > 0 ? Math.round(total / dayCount) : 0)

  return {
    dayCount,
    intakeTotal,
    intakeAverage: average(intakeTotal),
    bmrTotal,
    bmrAverage: average(bmrTotal),
    baseBurnTotal,
    baseBurnAverage: average(baseBurnTotal),
    activityTotal,
    activityAverage: average(activityTotal),
    totalOutputTotal,
    totalOutputAverage: average(totalOutputTotal),
    netTotal,
    netAverage: average(netTotal),
  }
}
