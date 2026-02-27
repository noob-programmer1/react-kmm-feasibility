import CalendarDateCell from './CalendarDateCell'
import type { CalendarDate } from './CalendarDateCell'

interface CalendarGridProps {
  monthLabel: string
  dates: CalendarDate[]
  onDateClick: (date: string) => void
}

export type { CalendarDate }

const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/**
 * Parses "dd-MM-yyyy" and returns the weekday index (0 = Sunday, 6 = Saturday).
 */
function getWeekdayIndex(dateStr: string): number {
  const [dd, mm, yyyy] = dateStr.split('-').map(Number)
  const d = new Date(yyyy, mm - 1, dd)
  return d.getDay()
}

export default function CalendarGrid({ monthLabel, dates, onDateClick }: CalendarGridProps) {
  // Determine how many leading empty cells to render
  const leadingBlanks = dates.length > 0 ? getWeekdayIndex(dates[0].date) : 0

  return (
    <div className="mb-6">
      {/* Month label */}
      <h4 className="text-sm font-semibold text-text-primary mb-3 px-1">{monthLabel}</h4>

      {/* Weekday header row */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_HEADERS.map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-center h-8 text-xs font-medium text-text-muted"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7">
        {/* Leading blank cells */}
        {Array.from({ length: leadingBlanks }).map((_, index) => (
          <div key={`blank-${index}`} />
        ))}

        {/* Actual date cells */}
        {dates.map((dateItem) => (
          <CalendarDateCell
            key={dateItem.date}
            date={dateItem}
            onClick={() => onDateClick(dateItem.date)}
          />
        ))}
      </div>
    </div>
  )
}
