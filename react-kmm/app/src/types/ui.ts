// Shared UI types used across hooks and screens

export type UiStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UiState<T> {
  status: UiStatus
  data?: T
  error?: string
}

// ---- Plan Selection ----

export interface PlanItem {
  name: string
  slug: string
  duration: string
  totalRides: number
  pricePerRide: number
  totalPrice: number
  isRoundTrip: boolean
  features: string[]
  savingsText?: string
}

export interface PlanSelectionData {
  plans: PlanItem[]
  selectedPlanSlug?: string
  comparisonHighlight?: string
}

// ---- Pass Setup ----

export interface StopInfo {
  id: string
  name: string
  time: string
  area?: string
}

export interface ShiftConfig {
  pickupStop: StopInfo | null
  dropOffStop: StopInfo | null
  scheduleSummary: string | null
  selectedDates: string[]
  selectedWeekDays: number[]
  isConfigured: boolean
  hasStops: boolean
  availablePickupStops: StopInfo[]
  availableDropOffStops: StopInfo[]
}

export interface PassSetupData {
  planName: string
  totalRidesPerShift: number
  isRoundTrip: boolean
  shifts: Record<string, ShiftConfig>
  isProceedEnabled: boolean
}

// ---- Calendar ----

export interface CalendarDateItem {
  date: string
  dayOfMonth: string
  isHoliday: boolean
  isWeekend: boolean
  isSelected: boolean
  isStartDate: boolean
  isEndDate: boolean
  isAvailable: boolean
  holidayRemark?: string
}

export interface WeekDayItem {
  label: string
  index: number
  isSelected: boolean
  isEnabled: boolean
}

export interface CalendarData {
  calendarDates: CalendarDateItem[]
  selectedWeekDays: WeekDayItem[]
  totalRidesNeeded: number
  selectedRideCount: number
  startDateText: string | null
  endDateText: string | null
  planDurationText: string
  weekSelectionError: string | null
  holidayRemarks: string[]
  isHolidayRemarksExpanded: boolean
  isConfirmEnabled: boolean
  monthLabel: string
}

// ---- Checkout ----

export interface ShiftSummary {
  shiftLabel: string
  pickupStop: string
  pickupTime: string
  dropOffStop: string
  dropOffTime: string
  rideCount: number
  scheduleSummary?: string
}

export interface PricingData {
  baseFarePerRide: number
  totalRides: number
  baseFareTotal: number
  convenienceFee: number
  gstRate: number
  gstAmount: number
  walletCredit: number
  totalPayable: number
}

export interface PaymentMethodItem {
  id: string
  label: string
  description?: string
  icon: string
}

export interface CheckoutData {
  planName: string
  shiftSummaries: ShiftSummary[]
  pricing: PricingData
  paymentMethods: PaymentMethodItem[]
  selectedPaymentMethod: string | null
  walletBalance: number
  isWalletInsufficient: boolean
  termsAccepted: boolean
  isPlaceOrderEnabled: boolean
  isProcessing: boolean
  isOrderSummaryExpanded: boolean
}

// ---- My Subscription ----

export interface UpcomingRide {
  date: string
  dayLabel: string
  pickupStop: string
  pickupTime: string
  dropOffStop: string
  dropOffTime: string
  shift: 'Morning' | 'Evening'
}

export interface RenewalCta {
  type: 'HIDDEN' | 'VISIBLE' | 'EXPIRED'
  message?: string
}

export interface MySubscriptionData {
  planName: string
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED'
  statusLabel: string
  ridesUsed: number
  totalRides: number
  usagePercentage: number
  upcomingRides: UpcomingRide[]
  startDate: string
  endDate: string
  daysRemaining: number
  shifts: ShiftSummary[]
  renewalCta: RenewalCta
  usageText: string
  daysRemainingText: string
}
