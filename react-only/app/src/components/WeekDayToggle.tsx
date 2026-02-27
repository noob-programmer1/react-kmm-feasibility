interface WeekDay {
  label: string
  index: number
  isSelected: boolean
  isEnabled: boolean
}

interface WeekDayToggleProps {
  weekDays: WeekDay[]
  onToggle: (index: number) => void
  error?: string
}

export type { WeekDay }

export default function WeekDayToggle({ weekDays, onToggle, error }: WeekDayToggleProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 px-1">
        {weekDays.map((day) => {
          const baseClasses =
            'w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center'

          let stateClasses: string

          if (!day.isEnabled) {
            stateClasses = 'bg-gray-100 text-text-muted cursor-not-allowed border border-gray-200'
          } else if (day.isSelected) {
            stateClasses = 'bg-primary text-white border-2 border-primary shadow-sm'
          } else {
            stateClasses =
              'bg-surface text-text-primary border-2 border-gray-300 hover:border-primary hover:text-primary'
          }

          return (
            <button
              key={day.index}
              onClick={() => day.isEnabled && onToggle(day.index)}
              disabled={!day.isEnabled}
              className={`${baseClasses} ${stateClasses}`}
              aria-label={`${day.label}${day.isSelected ? ' (selected)' : ''}`}
              aria-pressed={day.isSelected}
            >
              {day.label}
            </button>
          )
        })}
      </div>

      {error && (
        <p className="mt-2 px-1 text-xs text-danger">{error}</p>
      )}
    </div>
  )
}
