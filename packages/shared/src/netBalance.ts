import { goals } from './goals.js'

export type NetBalanceStatus = 'under' | 'in_range' | 'over'

/** Day base burn source: profile BMR or wearable day total. */
export type DayBaseSource = 'bmr' | 'device'

export interface NetBalance {
  consumed: number
  /** Profile BMR (always available for provisional display). */
  bmr: number
  /** Wearable full-day total when set; replaces BMR as base. */
  deviceTotal: number | null
  /** baseBurn used in burned = baseBurn + activityCalories. */
  baseBurn: number
  baseSource: DayBaseSource
  activityCalories: number
  burned: number
  net: number
  goalLow: number
  goalHigh: number
  status: NetBalanceStatus
  remainingToLow: number
  overHighBy: number
  contextMessage: string
}

export function resolveDayBaseBurn(
  bmr: number,
  deviceTotal: number | null | undefined,
): { baseBurn: number; baseSource: DayBaseSource } {
  if (deviceTotal !== null && deviceTotal !== undefined && Number.isFinite(deviceTotal)) {
    return { baseBurn: Math.round(deviceTotal), baseSource: 'device' }
  }
  return { baseBurn: bmr, baseSource: 'bmr' }
}

export function computeNetBalance(
  consumed: number,
  activityCalories: number,
  goalLow: number = goals.calories.low,
  goalHigh: number = goals.calories.high,
  bmr: number = 0,
  deviceTotal: number | null = null,
): NetBalance {
  const { baseBurn, baseSource } = resolveDayBaseBurn(bmr, deviceTotal)
  const burned = baseBurn + activityCalories
  const net = consumed - burned
  let status: NetBalanceStatus = 'in_range'
  if (net < goalLow) status = 'under'
  else if (net > goalHigh) status = 'over'

  const remainingToLow = Math.max(goalLow - net, 0)
  const overHighBy = Math.max(net - goalHigh, 0)

  let contextMessage: string
  if (status === 'under') {
    contextMessage = `${remainingToLow.toLocaleString()} kcal remaining to hit ${goalLow.toLocaleString()} kcal low target`
  } else if (status === 'over') {
    contextMessage = `${overHighBy.toLocaleString()} kcal over ${goalHigh.toLocaleString()} kcal high target`
  } else {
    contextMessage = `Within ${goalLow.toLocaleString()}–${goalHigh.toLocaleString()} kcal target range`
  }

  return {
    consumed,
    bmr,
    deviceTotal:
      deviceTotal !== null && deviceTotal !== undefined && Number.isFinite(deviceTotal)
        ? Math.round(deviceTotal)
        : null,
    baseBurn,
    baseSource,
    activityCalories,
    burned,
    net,
    goalLow,
    goalHigh,
    status,
    remainingToLow,
    overHighBy,
    contextMessage,
  }
}

/** Validate a device day total (full-day watch calories). */
export function validateDeviceTotalKcal(
  value: number,
): { ok: true; value: number } | { ok: false; error: string } {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return { ok: false, error: 'Device total must be a whole number of kcal' }
  }
  if (value < 0 || value > 10000) {
    return { ok: false, error: 'Device total must be between 0 and 10,000 kcal' }
  }
  return { ok: true, value }
}
