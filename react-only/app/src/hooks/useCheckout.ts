import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type {
  UiState,
  CheckoutData,
  ShiftSummary,
  PricingData,
  PaymentMethodItem,
} from '../types/ui'

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

const MOCK_PRICING: PricingData = {
  baseFarePerRide: 65,
  totalRides: 44,
  baseFareTotal: 2860,
  convenienceFee: 25,
  gstRate: 5,
  gstAmount: 144.25,
  walletCredit: 500,
  totalPayable: 2529.25,
}

const MOCK_PAYMENT_METHODS: PaymentMethodItem[] = [
  { id: 'wallet', label: 'Wallet', description: 'Balance: \u20B91,200', icon: '\uD83D\uDCB0' },
  { id: 'upi', label: 'UPI', description: 'Google Pay, PhonePe, etc.', icon: '\uD83D\uDCF1' },
  { id: 'card', label: 'Card', description: 'Credit or Debit card', icon: '\uD83D\uDCB3' },
]

const WALLET_BALANCE = 1200

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

  const [state, setState] = useState<UiState<CheckoutData>>({
    status: 'loading',
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setState({
        status: 'success',
        data: {
          planName: 'Monthly Round-Trip',
          shiftSummaries: MOCK_SHIFTS,
          pricing: MOCK_PRICING,
          paymentMethods: MOCK_PAYMENT_METHODS,
          selectedPaymentMethod: null,
          walletBalance: WALLET_BALANCE,
          isWalletInsufficient: false,
          termsAccepted: false,
          isPlaceOrderEnabled: false,
          isProcessing: false,
          isOrderSummaryExpanded: false,
        },
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const selectPaymentMethod = useCallback((id: string) => {
    setState((prev) => {
      if (prev.status !== 'success' || !prev.data) return prev
      const isWalletInsufficient = id === 'wallet' && WALLET_BALANCE < MOCK_PRICING.totalPayable
      const d = prev.data
      return {
        ...prev,
        data: {
          ...d,
          selectedPaymentMethod: id,
          isWalletInsufficient,
          isPlaceOrderEnabled: !isWalletInsufficient && d.termsAccepted && !d.isProcessing,
        },
      }
    })
  }, [])

  const toggleTerms = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'success' || !prev.data) return prev
      const d = prev.data
      const newTerms = !d.termsAccepted
      return {
        ...prev,
        data: {
          ...d,
          termsAccepted: newTerms,
          isPlaceOrderEnabled:
            d.selectedPaymentMethod !== null &&
            !d.isWalletInsufficient &&
            newTerms &&
            !d.isProcessing,
        },
      }
    })
  }, [])

  const toggleOrderSummary = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'success' || !prev.data) return prev
      return {
        ...prev,
        data: {
          ...prev.data,
          isOrderSummaryExpanded: !prev.data.isOrderSummaryExpanded,
        },
      }
    })
  }, [])

  const placeOrder = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'success' || !prev.data) return prev
      if (!prev.data.isPlaceOrderEnabled) return prev
      return {
        ...prev,
        data: {
          ...prev.data,
          isProcessing: true,
          isPlaceOrderEnabled: false,
        },
      }
    })

    setTimeout(() => {
      navigate('/subscription')
    }, 2000)
  }, [navigate])

  const goBack = useCallback(() => {
    // Navigation handled by screen
  }, [])

  return { state, selectPaymentMethod, toggleTerms, toggleOrderSummary, placeOrder, goBack }
}
