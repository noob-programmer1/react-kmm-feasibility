import { useState, useEffect, useCallback } from 'react'
import type { UiState, PlanSelectionData, PlanItem } from '../types/ui'

const MOCK_PLANS: PlanItem[] = [
  {
    name: 'Weekly One-Way',
    slug: 'weekly-oneway',
    totalRides: 6,
    pricePerRide: 85,
    totalPrice: 510,
    duration: '7 days',
    isRoundTrip: false,
    features: ['6 rides per week', 'Flexible scheduling', 'Cancel anytime'],
  },
  {
    name: 'Weekly Round-Trip',
    slug: 'weekly-roundtrip',
    totalRides: 12,
    pricePerRide: 75,
    totalPrice: 900,
    duration: '7 days',
    isRoundTrip: true,
    features: ['12 rides (6 per shift)', 'Morning + Evening', 'Cancel anytime'],
    savingsText: 'Save \u20B9120/week',
  },
  {
    name: 'Monthly One-Way',
    slug: 'monthly-oneway',
    totalRides: 22,
    pricePerRide: 75,
    totalPrice: 1650,
    duration: '30 days',
    isRoundTrip: false,
    features: ['22 rides per month', 'Priority booking', 'Cancel anytime'],
    savingsText: 'Save \u20B9220/month',
  },
  {
    name: 'Monthly Round-Trip',
    slug: 'monthly-roundtrip',
    totalRides: 44,
    pricePerRide: 65,
    totalPrice: 2860,
    duration: '30 days',
    isRoundTrip: true,
    features: ['44 rides (22 per shift)', 'Morning + Evening', 'Priority booking'],
    savingsText: 'Save \u20B9880/month',
  },
]

export interface UsePlanSelectionReturn {
  state: UiState<PlanSelectionData>
  selectPlan: (slug: string) => void
  proceed: () => void
}

export function usePlanSelection(): UsePlanSelectionReturn {
  const [state, setState] = useState<UiState<PlanSelectionData>>({
    status: 'loading',
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setState({
        status: 'success',
        data: {
          plans: MOCK_PLANS,
          selectedPlanSlug: undefined,
          comparisonHighlight: 'Save up to 24% with Monthly plans',
        },
      })
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const selectPlan = useCallback((slug: string) => {
    setState((prev) => {
      if (prev.status !== 'success' || !prev.data) return prev
      return {
        ...prev,
        data: {
          ...prev.data,
          selectedPlanSlug: slug,
        },
      }
    })
  }, [])

  const proceed = useCallback(() => {
    // Navigation handled by the screen component
  }, [])

  return { state, selectPlan, proceed }
}
