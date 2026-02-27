import { useState, useEffect, useCallback } from 'react'
import type { UiState, CalendarData, CalendarDateItem, WeekDayItem } from '../types/ui'

const WEEK_DAY_LABELS = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su']

const HOLIDAY_OFFSETS = [8, 17] // days from today that are holidays
const HOLIDAY_REMARKS = ['Holi', 'Good Friday']

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function formatMonthLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getDayOfWeekIndex(d: Date): number {
  // 0=Mon, 1=Tue, ..., 5=Sat, 6=Sun
  const jsDay = d.getDay() // 0=Sun, 1=Mon, ...
  return jsDay === 0 ? 6 : jsDay - 1
}

function generateCalendarDates(
  weekDays: WeekDayItem[],
  totalRidesNeeded: number
): { dates: CalendarDateItem[]; holidayRemarks: string[] } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dates: CalendarDateItem[] = []
  const holidayRemarks: string[] = []
  const selectedWeekDayIndices = new Set(weekDays.filter((w) => w.isSelected).map((w) => w.index))

  let selectedCount = 0

  for (let i = 0; i < 45; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const dayIdx = getDayOfWeekIndex(d)
    const isWeekend = dayIdx === 5 || dayIdx === 6

    const holidayIndex = HOLIDAY_OFFSETS.indexOf(i)
    const isHoliday = holidayIndex !== -1
    if (isHoliday) {
      holidayRemarks.push(`${formatDisplayDate(d)} - ${HOLIDAY_REMARKS[holidayIndex]}`)
    }

    const isWeekdayMatch = selectedWeekDayIndices.has(dayIdx)
    const isAvailable = !isWeekend && !isHoliday
    const shouldSelect = isAvailable && isWeekdayMatch && selectedCount < totalRidesNeeded

    if (shouldSelect) {
      selectedCount++
    }

    dates.push({
      date: formatDate(d),
      dayOfMonth: String(d.getDate()),
      isHoliday,
      isWeekend,
      isSelected: shouldSelect,
      isStartDate: false,
      isEndDate: false,
      isAvailable,
      holidayRemark: isHoliday ? HOLIDAY_REMARKS[holidayIndex] : undefined,
    })
  }

  // Mark start and end dates
  const selectedDates = dates.filter((d) => d.isSelected)
  if (selectedDates.length > 0) {
    selectedDates[0].isStartDate = true
    selectedDates[selectedDates.length - 1].isEndDate = true
  }

  return { dates, holidayRemarks }
}

function buildInitialWeekDays(): WeekDayItem[] {
  return WEEK_DAY_LABELS.map((label, index) => ({
    label,
    index,
    isSelected: index < 5, // Mon-Fri selected
    isEnabled: index < 5, // Sat-Sun disabled
  }))
}

export interface UseCalendarReturn {
  state: UiState<CalendarData>
  toggleWeekDay: (index: number) => void
  selectDate: (date: string) => void
  confirmDates: () => void
  toggleHolidayRemarks: () => void
  goBack: () => void
}

export function useCalendar(): UseCalendarReturn {
  const totalRidesNeeded = 22

  const [state, setState] = useState<UiState<CalendarData>>({
    status: 'loading',
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      const weekDays = buildInitialWeekDays()
      const { dates, holidayRemarks } = generateCalendarDates(weekDays, totalRidesNeeded)
      const selectedDates = dates.filter((d) => d.isSelected)
      const today = new Date()

      setState({
        status: 'success',
        data: {
          calendarDates: dates,
          selectedWeekDays: weekDays,
          totalRidesNeeded,
          selectedRideCount: selectedDates.length,
          startDateText: selectedDates.length > 0 ? selectedDates[0].date : null,
          endDateText:
            selectedDates.length > 0 ? selectedDates[selectedDates.length - 1].date : null,
          planDurationText: `${totalRidesNeeded} rides`,
          weekSelectionError: null,
          holidayRemarks,
          isHolidayRemarksExpanded: false,
          isConfirmEnabled: selectedDates.length === totalRidesNeeded,
          monthLabel: formatMonthLabel(today),
        },
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const recalculateDates = useCallback(
    (weekDays: WeekDayItem[], startFrom?: string) => {
      setState((prev) => {
        if (prev.status !== 'success' || !prev.data) return prev

        const { dates, holidayRemarks } = generateCalendarDates(weekDays, totalRidesNeeded)

        // If a start date is provided, clear selections before it
        if (startFrom) {
          let selecting = false
          let count = 0
          const selectedIndices = new Set(weekDays.filter((w) => w.isSelected).map((w) => w.index))

          for (const d of dates) {
            d.isSelected = false
            d.isStartDate = false
            d.isEndDate = false

            if (d.date === startFrom) selecting = true

            if (selecting && d.isAvailable && count < totalRidesNeeded) {
              const dt = new Date(d.date)
              const dayIdx = getDayOfWeekIndex(dt)
              if (selectedIndices.has(dayIdx)) {
                d.isSelected = true
                count++
              }
            }
          }

          const sel = dates.filter((d) => d.isSelected)
          if (sel.length > 0) {
            sel[0].isStartDate = true
            sel[sel.length - 1].isEndDate = true
          }
        }

        const selectedDates = dates.filter((d) => d.isSelected)

        return {
          ...prev,
          data: {
            ...prev.data,
            calendarDates: dates,
            selectedWeekDays: weekDays,
            selectedRideCount: selectedDates.length,
            startDateText: selectedDates.length > 0 ? selectedDates[0].date : null,
            endDateText:
              selectedDates.length > 0 ? selectedDates[selectedDates.length - 1].date : null,
            weekSelectionError:
              weekDays.filter((w) => w.isSelected).length === 0
                ? 'Select at least one weekday'
                : null,
            holidayRemarks,
            isConfirmEnabled: selectedDates.length === totalRidesNeeded,
          },
        }
      })
    },
    [totalRidesNeeded]
  )

  const toggleWeekDay = useCallback(
    (index: number) => {
      setState((prev) => {
        if (prev.status !== 'success' || !prev.data) return prev
        const weekDay = prev.data.selectedWeekDays[index]
        if (!weekDay || !weekDay.isEnabled) return prev

        const updatedWeekDays = prev.data.selectedWeekDays.map((w, i) =>
          i === index ? { ...w, isSelected: !w.isSelected } : w
        )
        // We need to trigger recalculation outside setState
        setTimeout(() => recalculateDates(updatedWeekDays), 0)
        return prev
      })
    },
    [recalculateDates]
  )

  const selectDate = useCallback(
    (date: string) => {
      setState((prev) => {
        if (prev.status !== 'success' || !prev.data) return prev
        setTimeout(() => recalculateDates(prev.data!.selectedWeekDays, date), 0)
        return prev
      })
    },
    [recalculateDates]
  )

  const confirmDates = useCallback(() => {
    // Return selected dates to pass setup - navigation handled by screen
  }, [])

  const toggleHolidayRemarks = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'success' || !prev.data) return prev
      return {
        ...prev,
        data: {
          ...prev.data,
          isHolidayRemarksExpanded: !prev.data.isHolidayRemarksExpanded,
        },
      }
    })
  }, [])

  const goBack = useCallback(() => {
    // Navigation handled by screen
  }, [])

  return { state, toggleWeekDay, selectDate, confirmDates, toggleHolidayRemarks, goBack }
}
