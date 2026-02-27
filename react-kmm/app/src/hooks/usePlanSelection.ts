import { useState, useEffect, useCallback, useRef } from 'react'
import type { UiState, PlanSelectionData } from '../types/ui'
import { createPlanSelectionVM } from './kmmModule'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface UsePlanSelectionReturn {
  state: UiState<PlanSelectionData>
  selectPlan: (slug: string) => void
  proceed: () => void
}

export function usePlanSelection(): UsePlanSelectionReturn {
  const [state, setState] = useState<UiState<PlanSelectionData>>({ status: 'loading' })
  const vmRef = useRef<any>(null)

  useEffect(() => {
    const vm = createPlanSelectionVM()
    vmRef.current = vm

    const cancelState = vm.observeState((s: any) => setState(s))
    const cancelEffect = vm.observeEffect((e: any) => {
      switch (e.type) {
        case 'NavigateToPassSetup':
          // Stash selected plan info for PassSetup screen
          if (e.plan) {
            localStorage.setItem('selectedPlanSlug', e.plan.slug || '')
            localStorage.setItem('selectedPlanName', e.plan.name || '')
          }
          break
        case 'ShowError':
          console.error('[KMM PlanSelection]', e.message)
          break
      }
    })

    vm.fetchPlans()

    return () => {
      cancelState()
      cancelEffect()
      vm.destroy()
    }
  }, [])

  const selectPlan = useCallback((slug: string) => vmRef.current?.selectPlan(slug), [])
  const proceed = useCallback(() => vmRef.current?.proceedWithPlan(), [])

  return { state, selectPlan, proceed }
}
