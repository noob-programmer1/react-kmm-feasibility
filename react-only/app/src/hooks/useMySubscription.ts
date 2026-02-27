import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  UiState,
  MySubscriptionData,
  UpcomingRide,
  ShiftSummary,
  RenewalCta,
} from '../types/ui'

function generateUpcomingRides(): UpcomingRide[] {
  const rides: UpcomingRide[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let count = 0
  let dayOffset = 1

  while (count < 5 && dayOffset < 15) {
    const d = new Date(today)
    d.setDate(d.getDate() + dayOffset)
    const jsDay = d.getDay()

    // Skip weekends
    if (jsDay !== 0 && jsDay !== 6) {
      const dateStr = d.toISOString().split('T')[0]
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

      rides.push({
        date: dateStr,
        dayLabel,
        pickupStop: 'Borivali Station',
        pickupTime: '7:15 AM',
        dropOffStop: 'BKC Platina',
        dropOffTime: '9:00 AM',
        shift: 'Morning',
      })
      count++
    }
    dayOffset++
  }

  return rides
}

const MOCK_SHIFTS: ShiftSummary[] = [
  {
    shiftLabel: 'Morning Shift',
    pickupStop: 'Borivali Station',
    pickupTime: '7:15 AM',
    dropOffStop: 'BKC Platina',
    dropOffTime: '9:00 AM',
    rideCount: 22,
    scheduleSummary: 'Mon-Fri, 22 rides',
  },
  {
    shiftLabel: 'Evening Shift',
    pickupStop: 'BKC Platina',
    pickupTime: '6:30 PM',
    dropOffStop: 'Borivali Station',
    dropOffTime: '8:15 PM',
    rideCount: 22,
    scheduleSummary: 'Mon-Fri, 22 rides',
  },
]

function buildSubscriptionData(
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED'
): MySubscriptionData {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 15)
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 15)

  const daysRemaining = status === 'EXPIRED' ? 0 : status === 'EXPIRING_SOON' ? 3 : 15

  const statusLabels: Record<string, string> = {
    ACTIVE: 'Active',
    EXPIRING_SOON: 'Expiring Soon',
    EXPIRED: 'Expired',
  }

  const renewalCtas: Record<string, RenewalCta> = {
    ACTIVE: { type: 'HIDDEN' },
    EXPIRING_SOON: {
      type: 'VISIBLE',
      message: 'Your pass expires in 3 days. Renew now to avoid interruption.',
    },
    EXPIRED: {
      type: 'EXPIRED',
      message: 'Your pass has expired. Renew to continue riding.',
    },
  }

  return {
    planName: 'Monthly Round-Trip',
    status,
    statusLabel: statusLabels[status],
    ridesUsed: 15,
    totalRides: 44,
    usagePercentage: Math.round((15 / 44) * 100),
    upcomingRides: status === 'EXPIRED' ? [] : generateUpcomingRides(),
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    daysRemaining,
    shifts: MOCK_SHIFTS,
    renewalCta: renewalCtas[status],
    usageText: '15 of 44 rides used',
    daysRemainingText:
      status === 'EXPIRED' ? 'Pass expired' : `${daysRemaining} days remaining`,
  }
}

export interface UseMySubscriptionReturn {
  state: UiState<MySubscriptionData>
  refresh: () => void
  renew: () => void
  goHome: () => void
}

export function useMySubscription(): UseMySubscriptionReturn {
  const [state, setState] = useState<UiState<MySubscriptionData>>({
    status: 'loading',
  })
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    // Initial load
    const loadTimer = setTimeout(() => {
      setState({
        status: 'success',
        data: buildSubscriptionData('ACTIVE'),
      })
    }, 700)
    timersRef.current.push(loadTimer)

    // Transition to EXPIRING_SOON after 10s
    const expiringTimer = setTimeout(() => {
      setState((prev) => {
        if (prev.status !== 'success') return prev
        return {
          ...prev,
          data: buildSubscriptionData('EXPIRING_SOON'),
        }
      })
    }, 10000)
    timersRef.current.push(expiringTimer)

    // Transition to EXPIRED after 20s
    const expiredTimer = setTimeout(() => {
      setState((prev) => {
        if (prev.status !== 'success') return prev
        return {
          ...prev,
          data: buildSubscriptionData('EXPIRED'),
        }
      })
    }, 20000)
    timersRef.current.push(expiredTimer)

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [])

  const refresh = useCallback(() => {
    setState({ status: 'loading' })
    const timer = setTimeout(() => {
      setState({
        status: 'success',
        data: buildSubscriptionData('ACTIVE'),
      })
    }, 700)
    timersRef.current.push(timer)
  }, [])

  const renew = useCallback(() => {
    // Navigation handled by screen
  }, [])

  const goHome = useCallback(() => {
    // Navigation handled by screen
  }, [])

  return { state, refresh, renew, goHome }
}
