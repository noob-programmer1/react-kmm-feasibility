import { useState, useEffect, useCallback } from 'react'
import type { UiState, PassSetupData, ShiftConfig, StopInfo } from '../types/ui'

const MOCK_PICKUP_STOPS: StopInfo[] = [
  { id: 'pickup-1', name: 'Borivali Station', time: '7:15 AM', area: 'Borivali West' },
  { id: 'pickup-2', name: 'Kandivali East', time: '7:30 AM', area: 'Kandivali' },
  { id: 'pickup-3', name: 'Malad West', time: '7:45 AM', area: 'Malad' },
]

const MOCK_DROPOFF_STOPS: StopInfo[] = [
  { id: 'dropoff-1', name: 'BKC Platina', time: '9:00 AM', area: 'Bandra Kurla Complex' },
  { id: 'dropoff-2', name: 'Airoli Sector 5', time: '9:15 AM', area: 'Navi Mumbai' },
  { id: 'dropoff-3', name: 'Ghansoli', time: '9:30 AM', area: 'Navi Mumbai' },
]

function makeEmptyShift(): ShiftConfig {
  return {
    pickupStop: null,
    dropOffStop: null,
    scheduleSummary: null,
    selectedDates: [],
    selectedWeekDays: [],
    isConfigured: false,
    hasStops: false,
    availablePickupStops: MOCK_PICKUP_STOPS,
    availableDropOffStops: MOCK_DROPOFF_STOPS,
  }
}

function checkProceedEnabled(shifts: Record<string, ShiftConfig>, isRoundTrip: boolean): boolean {
  const morning = shifts['MORNING']
  if (!morning || !morning.pickupStop || !morning.dropOffStop) return false
  if (isRoundTrip) {
    const evening = shifts['EVENING']
    if (!evening || !evening.pickupStop || !evening.dropOffStop) return false
  }
  return true
}

export interface UsePassSetupReturn {
  state: UiState<PassSetupData>
  activeShiftTab: string
  setActiveShiftTab: (tab: string) => void
  selectPickupStop: (shiftKey: string, stop: StopInfo) => void
  selectDropOffStop: (shiftKey: string, stop: StopInfo) => void
  openCalendar: () => void
  onScheduleConfirmed: (dates: string[], weekDays: number[]) => void
  proceed: () => void
  goBack: () => void
  isPickupSheetOpen: boolean
  setPickupSheetOpen: (open: boolean) => void
  isDropOffSheetOpen: boolean
  setDropOffSheetOpen: (open: boolean) => void
}

export function usePassSetup(): UsePassSetupReturn {
  const [state, setState] = useState<UiState<PassSetupData>>({
    status: 'loading',
  })
  const [activeShiftTab, setActiveShiftTab] = useState('MORNING')
  const [isPickupSheetOpen, setPickupSheetOpen] = useState(false)
  const [isDropOffSheetOpen, setDropOffSheetOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const planName = localStorage.getItem('selectedPlanName') || 'Monthly Round-Trip'
      const shifts: Record<string, ShiftConfig> = {
        MORNING: makeEmptyShift(),
        EVENING: makeEmptyShift(),
      }
      setState({
        status: 'success',
        data: {
          planName,
          totalRidesPerShift: 22,
          isRoundTrip: true,
          shifts,
          isProceedEnabled: false,
        },
      })
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const selectPickupStop = useCallback((shiftKey: string, stop: StopInfo) => {
    setState((prev) => {
      if (prev.status !== 'success' || !prev.data) return prev
      const shifts = { ...prev.data.shifts }
      const shift = { ...shifts[shiftKey] }
      shift.pickupStop = stop
      shift.hasStops = !!(stop && shift.dropOffStop)
      shift.isConfigured = shift.hasStops && shift.selectedDates.length > 0
      shifts[shiftKey] = shift
      return {
        ...prev,
        data: {
          ...prev.data,
          shifts,
          isProceedEnabled: checkProceedEnabled(shifts, prev.data.isRoundTrip),
        },
      }
    })
    setPickupSheetOpen(false)
  }, [])

  const selectDropOffStop = useCallback((shiftKey: string, stop: StopInfo) => {
    setState((prev) => {
      if (prev.status !== 'success' || !prev.data) return prev
      const shifts = { ...prev.data.shifts }
      const shift = { ...shifts[shiftKey] }
      shift.dropOffStop = stop
      shift.hasStops = !!(shift.pickupStop && stop)
      shift.isConfigured = shift.hasStops && shift.selectedDates.length > 0
      shifts[shiftKey] = shift
      return {
        ...prev,
        data: {
          ...prev.data,
          shifts,
          isProceedEnabled: checkProceedEnabled(shifts, prev.data.isRoundTrip),
        },
      }
    })
    setDropOffSheetOpen(false)
  }, [])

  const openCalendar = useCallback(() => {
    // Navigation handled by screen
  }, [])

  const onScheduleConfirmed = useCallback((dates: string[], weekDays: number[]) => {
    setState((prev) => {
      if (prev.status !== 'success' || !prev.data) return prev
      const shifts = { ...prev.data.shifts }
      const shift = { ...shifts[activeShiftTab] }
      shift.selectedDates = dates
      shift.selectedWeekDays = weekDays
      shift.scheduleSummary = `${dates.length} days selected`
      shift.isConfigured = shift.hasStops && dates.length > 0
      shifts[activeShiftTab] = shift
      return {
        ...prev,
        data: {
          ...prev.data,
          shifts,
          isProceedEnabled: checkProceedEnabled(shifts, prev.data.isRoundTrip),
        },
      }
    })
  }, [activeShiftTab])

  const proceed = useCallback(() => {
    // Navigation handled by screen
  }, [])

  const goBack = useCallback(() => {
    // Navigation handled by screen
  }, [])

  return {
    state,
    activeShiftTab,
    setActiveShiftTab,
    selectPickupStop,
    selectDropOffStop,
    openCalendar,
    onScheduleConfirmed,
    proceed,
    goBack,
    isPickupSheetOpen,
    setPickupSheetOpen,
    isDropOffSheetOpen,
    setDropOffSheetOpen,
  }
}
