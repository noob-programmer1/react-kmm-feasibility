import { useState, useEffect, useCallback, useRef } from 'react'
import type { UiState, CalendarData } from '../types/ui'
import { createCalendarVM } from './kmmModule'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface UseCalendarReturn {
  state: UiState<CalendarData>
  toggleWeekDay: (index: number) => void
  selectDate: (date: string) => void
  confirmDates: () => void
  toggleHolidayRemarks: () => void
  goBack: () => void
}

export function useCalendar(): UseCalendarReturn {
  const [state, setState] = useState<UiState<CalendarData>>({ status: 'loading' })
  const vmRef = useRef<any>(null)

  useEffect(() => {
    const vm = createCalendarVM()
    vmRef.current = vm

    const cancelState = vm.observeState((s: any) => setState(s))
    const cancelEffect = vm.observeEffect((e: any) => {
      switch (e.type) {
        case 'NavigateBackWithDates': {
          // Store confirmed dates for PassSetup to pick up
          const dates = e.selectedDates as string[]
          const weekDays = e.selectedWeekDays as number[]
          localStorage.setItem('confirmedDates', JSON.stringify(dates))
          localStorage.setItem('confirmedWeekDays', JSON.stringify(weekDays))
          break
        }
        case 'ShowError':
          console.error('[KMM Calendar]', e.message)
          break
      }
    })

    // Retrieve calendar init params stashed by PassSetup (via LaunchCalendar effect)
    const calendarParamsJson = localStorage.getItem('calendarParams')
    if (calendarParamsJson) {
      try {
        const params = JSON.parse(calendarParamsJson)
        vm.initialize(
          params.calendarDataJson || '{}',
          params.totalRidesPerShift || 22,
          params.selectedWeekDays || [0, 1, 2, 3, 4],
          params.selectedDates || [],
          params.maxValidStartDate || '',
          params.minimumDaysPerWeek || 5,
        )
      } catch {
        // Fallback: initialize with defaults
        vm.initialize('{}', 22, [0, 1, 2, 3, 4], [], '', 5)
      }
    } else {
      // Fallback
      vm.initialize('{}', 22, [0, 1, 2, 3, 4], [], '', 5)
    }

    return () => {
      cancelState()
      cancelEffect()
      vm.destroy()
    }
  }, [])

  const toggleWeekDay = useCallback((index: number) => {
    vmRef.current?.toggleWeekDay(index)
  }, [])

  const selectDate = useCallback((date: string) => {
    vmRef.current?.selectDate(date)
  }, [])

  const confirmDates = useCallback(() => {
    vmRef.current?.confirmDates()
  }, [])

  const toggleHolidayRemarks = useCallback(() => {
    vmRef.current?.toggleHolidayRemarks()
  }, [])

  const goBack = useCallback(() => {
    // Navigation handled by screen
  }, [])

  return { state, toggleWeekDay, selectDate, confirmDates, toggleHolidayRemarks, goBack }
}
