import { useState, useEffect, useCallback, useRef } from 'react'
import type { UiState, PassSetupData, StopInfo } from '../types/ui'
import { createPassSetupVM } from './kmmModule'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface UsePassSetupReturn {
  state: UiState<PassSetupData>
  activeShiftTab: string
  setActiveShiftTab: (tab: string) => void
  requestPickupStops: (shiftKey: string) => void
  requestDropOffStops: (shiftKey: string) => void
  selectPickupStop: (shiftKey: string, stop: StopInfo) => void
  selectDropOffStop: (shiftKey: string, stop: StopInfo) => void
  openCalendar: (shiftKey: string) => void
  onScheduleConfirmed: (dates: string[], weekDays: number[]) => void
  proceed: () => void
  goBack: () => void
  isPickupSheetOpen: boolean
  setPickupSheetOpen: (open: boolean) => void
  isDropOffSheetOpen: boolean
  setDropOffSheetOpen: (open: boolean) => void
}

export function usePassSetup(): UsePassSetupReturn {
  const [state, setState] = useState<UiState<PassSetupData>>({ status: 'loading' })
  const [activeShiftTab, setActiveShiftTabLocal] = useState('MORNING')
  const [isPickupSheetOpen, setPickupSheetOpen] = useState(false)
  const [isDropOffSheetOpen, setDropOffSheetOpen] = useState(false)

  // Track available stops from effects (not in KMM state, sent via OpenStopPicker effect)
  const availableStopsRef = useRef<Record<string, { pickup: StopInfo[]; dropOff: StopInfo[] }>>({})

  const vmRef = useRef<any>(null)
  // Calendar params stashed from LaunchCalendar effect
  const calendarParamsRef = useRef<any>(null)

  useEffect(() => {
    const vm = createPassSetupVM()
    vmRef.current = vm

    const cancelState = vm.observeState((s: any) => {
      // Merge available stops into the shift data from state
      if (s.status === 'success' && s.data) {
        const shifts = s.data.shifts
        for (const key of Object.keys(shifts)) {
          const cached = availableStopsRef.current[key]
          if (cached) {
            shifts[key].availablePickupStops = cached.pickup
            shifts[key].availableDropOffStops = cached.dropOff
          }
        }
      }
      setState(s)
    })

    const cancelEffect = vm.observeEffect((e: any) => {
      switch (e.type) {
        case 'OpenStopPicker': {
          const key = e.timeOfDay as string
          const stops = (e.availableStops || []) as StopInfo[]
          if (!availableStopsRef.current[key]) {
            availableStopsRef.current[key] = { pickup: [], dropOff: [] }
          }
          if (e.isPickup) {
            availableStopsRef.current[key].pickup = stops
            setPickupSheetOpen(true)
          } else {
            availableStopsRef.current[key].dropOff = stops
            setDropOffSheetOpen(true)
          }
          // Trigger re-render to merge stops into state
          setState((prev) => {
            if (prev.status !== 'success' || !prev.data) return prev
            const shifts = { ...prev.data.shifts }
            const shift = { ...shifts[key] }
            if (e.isPickup) {
              shift.availablePickupStops = stops
            } else {
              shift.availableDropOffStops = stops
            }
            shifts[key] = shift
            return { ...prev, data: { ...prev.data, shifts } }
          })
          break
        }
        case 'LaunchCalendar':
          calendarParamsRef.current = e
          // Stash for CalendarScreen to pick up
          localStorage.setItem('calendarParams', JSON.stringify({
            calendarDataJson: e.calendarDataJson,
            totalRidesPerShift: e.totalRidesPerShift,
            selectedWeekDays: e.selectedWeekDays,
            selectedDates: e.selectedDates,
            maxValidStartDate: e.maxValidStartDate || '',
            minimumDaysPerWeek: e.minimumDaysPerWeek,
          }))
          break
        case 'NavigateToCheckout':
          // Stash checkout data for CheckoutScreen
          localStorage.setItem('checkoutBaseFare', String(e.baseFarePerRide || 65))
          localStorage.setItem('checkoutTotalRides', String(e.totalRides || 44))
          localStorage.setItem('checkoutWalletBalance', String(e.walletBalance || 500))
          localStorage.setItem('checkoutIsRoundTrip', String(e.isRoundTrip ?? true))
          break
        case 'NavigateBack':
          break
        case 'ShowSnackbar':
          console.warn('[KMM PassSetup]', e.message)
          break
      }
    })

    // Fetch prefill data with the selected plan slug
    const planSlug = localStorage.getItem('selectedPlanSlug') || 'monthly-round-trip'
    vm.fetchPrefillData(planSlug)

    return () => {
      cancelState()
      cancelEffect()
      vm.destroy()
    }
  }, [])

  const setActiveShiftTab = useCallback((tab: string) => {
    setActiveShiftTabLocal(tab)
    vmRef.current?.selectShiftTab(tab)
  }, [])

  const requestPickupStops = useCallback((shiftKey: string) => {
    vmRef.current?.openPickupStopPicker(shiftKey)
  }, [])

  const requestDropOffStops = useCallback((shiftKey: string) => {
    vmRef.current?.openDropOffStopPicker(shiftKey)
  }, [])

  const selectPickupStop = useCallback((shiftKey: string, stop: StopInfo) => {
    vmRef.current?.setPickupStop(shiftKey, parseInt(stop.id, 10) || 0, stop.name, stop.time)
    setPickupSheetOpen(false)
  }, [])

  const selectDropOffStop = useCallback((shiftKey: string, stop: StopInfo) => {
    vmRef.current?.setDropOffStop(shiftKey, parseInt(stop.id, 10) || 0, stop.name, stop.time)
    setDropOffSheetOpen(false)
  }, [])

  const openCalendar = useCallback((_shiftKey: string) => {
    vmRef.current?.editSchedule(activeShiftTab)
  }, [activeShiftTab])

  const onScheduleConfirmed = useCallback((dates: string[], weekDays: number[]) => {
    vmRef.current?.onScheduleConfirmed(activeShiftTab, dates, weekDays)
  }, [activeShiftTab])

  const proceed = useCallback(() => {
    vmRef.current?.proceedToCheckout()
  }, [])

  const goBack = useCallback(() => {
    vmRef.current?.changePlan()
  }, [])

  return {
    state,
    activeShiftTab,
    setActiveShiftTab,
    requestPickupStops,
    requestDropOffStops,
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
