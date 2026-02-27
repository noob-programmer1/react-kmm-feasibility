/* eslint-disable @typescript-eslint/no-explicit-any */

// Import the KMM module at the top level so Vite can resolve it
import * as kmmLib from 'kmm-subscription'

// The KMM JS output uses UMD format. When imported as ESM by Vite,
// the exports live under the `com.cityflo.subscription` namespace.
const ns = (kmmLib as any).com?.cityflo?.subscription ?? kmmLib

export function createPlanSelectionVM(): any {
  return ns.createPlanSelectionVM()
}

export function createPassSetupVM(): any {
  return ns.createPassSetupVM()
}

export function createCalendarVM(): any {
  return ns.createCalendarVM()
}

export function createCheckoutVM(): any {
  return ns.createCheckoutVM()
}

export function createMySubscriptionVM(): any {
  return ns.createMySubscriptionVM()
}
