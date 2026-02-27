import { useState, useEffect, useCallback, useRef } from 'react'
import type { UiState, MySubscriptionData } from '../types/ui'
import { createMySubscriptionVM } from './kmmModule'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface UseMySubscriptionReturn {
  state: UiState<MySubscriptionData>
  refresh: () => void
  renew: () => void
  goHome: () => void
}

export function useMySubscription(): UseMySubscriptionReturn {
  const [state, setState] = useState<UiState<MySubscriptionData>>({ status: 'loading' })
  const vmRef = useRef<any>(null)

  useEffect(() => {
    const vm = createMySubscriptionVM()
    vmRef.current = vm

    const cancelState = vm.observeState((s: any) => setState(s))
    const cancelEffect = vm.observeEffect((e: any) => {
      switch (e.type) {
        case 'NavigateToPlanSelection':
          break // Navigation handled by screen
        case 'ShowSnackbar':
          console.info('[KMM MySubscription]', e.message)
          break
      }
    })

    const orderId = localStorage.getItem('orderId') || 'demo-order-001'
    vm.loadSubscription(orderId)

    return () => {
      cancelState()
      cancelEffect()
      vm.destroy()
    }
  }, [])

  const refresh = useCallback(() => {
    vmRef.current?.refreshStatus()
  }, [])

  const renew = useCallback(() => {
    vmRef.current?.renewSubscription()
  }, [])

  const goHome = useCallback(() => {
    vmRef.current?.backToHome()
  }, [])

  return { state, refresh, renew, goHome }
}
