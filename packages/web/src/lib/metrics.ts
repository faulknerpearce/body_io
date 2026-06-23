import {
  sumTotals,
  calGoal,
  proGoal,
  carbGoal,
  caffeineGoal,
  type FoodEntry,
} from '@nutrition-tracker/shared'
import type { MetricConfig } from '../components/MetricCard'

const fmtInt = (n: number) => n.toLocaleString()

export function buildMetricConfigs(entries: readonly FoodEntry[]): MetricConfig[] {
  const totals = sumTotals(entries)

  return [
    {
      label: 'Calories',
      value: totals.calories,
      formatValue: fmtInt,
      unit: null,
      goal: calGoal,
      formatGoal: fmtInt,
      color: '#ea580c',
      iconBg: '#fed7aa',
      iconClass: 'fa-fire',
      gradient: 'linear-gradient(to right, #134e4b, #14b8a6)',
      rightLabel: 'of daily goal',
      remainingSuffix: 'kcal',
      remaining: (v, g) => `${Math.max(g - v, 0).toLocaleString()} kcal`,
    },
    {
      label: 'Protein',
      value: totals.protein,
      formatValue: (n) => `${n}`,
      unit: 'g',
      goal: proGoal,
      formatGoal: (n) => `${n}`,
      color: '#059669',
      iconBg: '#d1fae5',
      iconClass: 'fa-dumbbell',
      gradient: 'linear-gradient(to right, #059669, #14b8a6)',
      rightLabel: 'of daily goal',
      remainingSuffix: 'g',
      remaining: (v, g) => `${Math.max(g - v, 0)} g`,
    },
    {
      label: 'Carbs',
      value: totals.carbs,
      formatValue: (n) => `${n}`,
      unit: 'g',
      goal: carbGoal,
      formatGoal: (n) => `${n}`,
      color: '#d97706',
      iconBg: '#fef3c7',
      iconClass: 'fa-wheat-awn',
      gradient: 'linear-gradient(to right, #d97706, #fbbf24)',
      rightLabel: 'of daily goal',
      remainingSuffix: 'g',
      remaining: (v, g) => `${Math.max(g - v, 0)} g`,
    },
    {
      label: 'Caffeine',
      value: totals.caffeine,
      formatValue: (n) => `${n}`,
      unit: 'mg',
      goal: caffeineGoal,
      formatGoal: (n) => `${n}`,
      color: '#7c3aed',
      iconBg: '#ede9fe',
      iconClass: 'fa-mug-hot',
      gradient: 'linear-gradient(to right, #7c3aed, #a78bfa)',
      rightLabel: 'of daily limit',
      remainingSuffix: 'mg',
      remaining: (v, g) => `${Math.max(g - v, 0)} mg`,
    },
  ]
}