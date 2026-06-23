import type { NutritionGoals } from '@nutrition-tracker/shared'
import { GOAL_FIELDS, parseGoalField, type GoalKey } from '../lib/goalsForm'
import { inputBase, labelBase } from '../lib/styles'

interface GoalsFormFieldsProps {
  form: NutritionGoals
  onChange: (next: NutritionGoals) => void
  idPrefix?: string
}

export default function GoalsFormFields({ form, onChange, idPrefix = 'goal' }: GoalsFormFieldsProps) {
  const updateGoal = (key: GoalKey, field: 'value' | 'low' | 'high', value: string) => {
    const parsed = parseGoalField(value)
    onChange({
      ...form,
      [key]: {
        ...form[key],
        [field]: Number.isFinite(parsed) ? parsed : form[key][field],
      },
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {GOAL_FIELDS.map(({ key, label, unit, showRange }) => {
        const goal = form[key]
        return (
          <div
            key={key}
            style={{
              padding: 16,
              borderRadius: 16,
              border: '1px solid #f4f4f5',
              background: '#fafafa',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', marginBottom: 12 }}>
              {label}
            </div>
            <div className="modal-form-grid">
              <div>
                <label htmlFor={`${idPrefix}-${key}-value`} style={labelBase}>
                  Target ({unit})
                </label>
                <input
                  id={`${idPrefix}-${key}-value`}
                  type="number"
                  min="1"
                  value={goal.value}
                  onChange={(e) => updateGoal(key, 'value', e.target.value)}
                  style={inputBase}
                />
              </div>
              {showRange ? (
                <>
                  <div>
                    <label htmlFor={`${idPrefix}-${key}-low`} style={labelBase}>
                      Low ({unit})
                    </label>
                    <input
                      id={`${idPrefix}-${key}-low`}
                      type="number"
                      min={key === 'caffeine' ? 0 : 1}
                      value={goal.low}
                      onChange={(e) => updateGoal(key, 'low', e.target.value)}
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${idPrefix}-${key}-high`} style={labelBase}>
                      High ({unit})
                    </label>
                    <input
                      id={`${idPrefix}-${key}-high`}
                      type="number"
                      min="1"
                      value={goal.high}
                      onChange={(e) => updateGoal(key, 'high', e.target.value)}
                      style={inputBase}
                    />
                  </div>
                </>
              ) : (
                <div aria-hidden="true" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}