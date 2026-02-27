import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UiState, CheckoutData } from '../types/ui'
import { createCheckoutVM } from './kmmModule'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface UseCheckoutReturn {
  state: UiState<CheckoutData>
  selectPaymentMethod: (id: string) => void
  toggleTerms: () => void
  toggleOrderSummary: () => void
  placeOrder: () => void
  goBack: () => void
}

export function useCheckout(): UseCheckoutReturn {
  const navigate = useNavigate()
  const [state, setState] = useState<UiState<CheckoutData>>({ status: 'loading' })
  const vmRef = useRef<any>(null)

  useEffect(() => {
    const vm = createCheckoutVM()
    vmRef.current = vm

    const cancelState = vm.observeState((s: any) => setState(s))
    const cancelEffect = vm.observeEffect((e: any) => {
      switch (e.type) {
        case 'NavigateToMySubscription':
          localStorage.setItem('orderId', e.orderId || '')
          navigate('/subscription')
          break
        case 'ShowError':
          console.error('[KMM Checkout]', e.message)
          break
      }
    })

    // Load checkout with data from PassSetup (stored in localStorage by effect handler)
    const planSlug = localStorage.getItem('selectedPlanSlug') || 'monthly-round-trip'
    const planName = localStorage.getItem('selectedPlanName') || 'Monthly Round-Trip'
    const baseFare = parseFloat(localStorage.getItem('checkoutBaseFare') || '65')
    const totalRides = parseInt(localStorage.getItem('checkoutTotalRides') || '44', 10)
    const walletBalance = parseFloat(localStorage.getItem('checkoutWalletBalance') || '500')
    const isRoundTrip = localStorage.getItem('checkoutIsRoundTrip') !== 'false'

    vm.loadCheckout(planSlug, planName, baseFare, totalRides, walletBalance, isRoundTrip)

    return () => {
      cancelState()
      cancelEffect()
      vm.destroy()
    }
  }, [navigate])

  const selectPaymentMethod = useCallback((id: string) => {
    vmRef.current?.selectPaymentMethod(id)
  }, [])

  const toggleTerms = useCallback(() => {
    vmRef.current?.toggleTerms()
  }, [])

  const toggleOrderSummary = useCallback(() => {
    vmRef.current?.toggleOrderSummary()
  }, [])

  const placeOrder = useCallback(() => {
    vmRef.current?.placeOrder()
  }, [])

  const goBack = useCallback(() => {
    // Navigation handled by screen
  }, [])

  return { state, selectPaymentMethod, toggleTerms, toggleOrderSummary, placeOrder, goBack }
}
