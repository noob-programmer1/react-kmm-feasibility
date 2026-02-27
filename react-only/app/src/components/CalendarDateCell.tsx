interface CalendarDate {
  date: string
  dayOfMonth: string
  isHoliday: boolean
  isWeekend: boolean
  isSelected: boolean
  isStartDate: boolean
  isEndDate: boolean
  isAvailable: boolean
  holidayRemark?: string
}

interface CalendarDateCellProps {
  date: CalendarDate
  onClick: () => void
}

export type { CalendarDate }

export default function CalendarDateCell({ date, onClick }: CalendarDateCellProps) {
  const {
    dayOfMonth,
    isHoliday,
    isWeekend,
    isSelected,
    isStartDate,
    isEndDate,
    isAvailable,
    holidayRemark,
  } = date

  // Determine cell styles
  const getContainerClasses = (): string => {
    const base = 'relative w-full aspect-square flex flex-col items-center justify-center text-sm transition-colors'

    if (!isAvailable) {
      return `${base} text-gray-300 cursor-not-allowed`
    }

    if (isStartDate) {
      return `${base} bg-primary-dark text-white rounded-l-full cursor-pointer`
    }

    if (isEndDate) {
      return `${base} bg-primary-dark text-white rounded-r-full cursor-pointer`
    }

    if (isSelected) {
      return `${base} bg-primary-100 text-primary-dark cursor-pointer`
    }

    if (isHoliday) {
      return `${base} bg-surface text-danger cursor-pointer`
    }

    if (isWeekend) {
      return `${base} bg-gray-50 text-text-muted cursor-pointer`
    }

    return `${base} bg-surface text-text-primary hover:bg-gray-50 cursor-pointer`
  }

  const handleClick = () => {
    if (isAvailable) {
      onClick()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!isAvailable}
      className={getContainerClasses()}
      title={holidayRemark}
      aria-label={`${dayOfMonth}${isHoliday && holidayRemark ? `, ${holidayRemark}` : ''}`}
    >
      <span className="font-medium leading-none">{dayOfMonth}</span>

      {/* Holiday indicator dot */}
      {isHoliday && isAvailable && (
        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-danger" />
      )}
    </button>
  )
}
