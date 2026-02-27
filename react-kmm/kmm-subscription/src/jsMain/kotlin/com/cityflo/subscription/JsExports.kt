@file:OptIn(ExperimentalJsExport::class)
package com.cityflo.subscription

import com.cityflo.subscription.data.mock.MockCalendarRepository
import com.cityflo.subscription.data.mock.MockPlanRepository
import com.cityflo.subscription.data.mock.MockSubscriptionRepository
import com.cityflo.subscription.presentation.analytics.ConsoleAnalyticsService
import com.cityflo.subscription.presentation.model.*
import com.cityflo.subscription.presentation.viewmodel.calendar.*
import com.cityflo.subscription.presentation.viewmodel.checkout.*
import com.cityflo.subscription.presentation.viewmodel.mysubscription.*
import com.cityflo.subscription.presentation.viewmodel.passsetup.*
import com.cityflo.subscription.presentation.viewmodel.planselection.*
import com.cityflo.subscription.util.UiState
import kotlinx.serialization.json.Json
import kotlinx.serialization.encodeToString

// =============================================================================
// JS-friendly wrappers that convert Kotlin sealed classes, Lists, Maps, Sets
// into plain JS objects { status, data?, error? } for React consumption.
// =============================================================================

// ─── Generic UiState → plain JS ─────────────────────────────────────────────

private fun <T : Any> mapUiState(
    state: UiState<T>,
    dataMapper: (T) -> dynamic
): dynamic {
    val obj = js("({})")
    when (state) {
        is UiState.Idle -> obj.status = "idle"
        is UiState.Loading -> obj.status = "loading"
        is UiState.Success -> {
            obj.status = "success"
            obj.data = dataMapper(state.data)
        }
        is UiState.Failure -> {
            obj.status = "error"
            obj.error = state.errorMessage
        }
    }
    return obj
}

// ─── Shared model mappers ────────────────────────────────────────────────────

private fun mapStopInfo(stop: StopUiModel): dynamic {
    val o = js("({})")
    o.id = stop.id.toString()
    o.name = stop.name
    o.time = stop.time
    return o
}

private fun mapShiftSummary(s: ShiftSummaryUiModel): dynamic {
    val o = js("({})")
    o.shiftLabel = s.timeOfDay.shiftName + " Shift"
    o.pickupStop = s.pickupStopName
    o.pickupTime = s.pickupTime
    o.dropOffStop = s.dropOffStopName
    o.dropOffTime = if (s.timeOfDay == TimeOfDay.MORNING) "9:00 AM" else "8:15 PM"
    o.rideCount = s.ridesCount
    o.scheduleSummary = s.dateRange
    return o
}

// ─── Plan Selection ──────────────────────────────────────────────────────────

private fun mapPlanSelectionData(model: PlanSelectionUiModel): dynamic {
    val o = js("({})")
    o.plans = model.plans.map { mapPlanItem(it) }.toTypedArray()
    o.selectedPlanSlug = model.selectedPlanSlug
    o.comparisonHighlight = model.comparisonHighlight
    return o
}

private fun mapPlanItem(plan: PlanUiModel): dynamic {
    val o = js("({})")
    o.name = plan.name
    o.slug = plan.slug
    o.duration = "${plan.durationDays} days"
    o.totalRides = plan.totalRides
    o.pricePerRide = plan.pricePerRide
    o.totalPrice = plan.totalPrice
    o.isRoundTrip = plan.isRoundTrip
    o.features = plan.features.toTypedArray()
    o.savingsText = plan.savingsText
    return o
}

private fun mapPlanSelectionEffect(effect: PlanSelectionEffect): dynamic {
    val o = js("({})")
    when (effect) {
        is PlanSelectionEffect.NavigateToPassSetup -> {
            o.type = "NavigateToPassSetup"
            o.plan = mapPlanItem(effect.plan)
        }
        is PlanSelectionEffect.ShowError -> {
            o.type = "ShowError"
            o.message = effect.message
        }
    }
    return o
}

// ─── Pass Setup ──────────────────────────────────────────────────────────────

private fun mapPassSetupData(model: PassSetupUiModel): dynamic {
    val o = js("({})")
    o.planName = model.planName
    o.totalRidesPerShift = model.totalRidesPerShift
    o.isRoundTrip = model.isRoundTrip
    o.isProceedEnabled = model.isProceedEnabled
    val sh = js("({})")
    model.shifts.forEach { (tod, cfg) -> sh[tod.name] = mapShiftConfig(cfg) }
    o.shifts = sh
    return o
}

private fun mapShiftConfig(c: ShiftConfigUiModel): dynamic {
    val o = js("({})")
    o.pickupStop = c.pickupStop?.let { mapStopInfo(it) }
    o.dropOffStop = c.dropOffStop?.let { mapStopInfo(it) }
    o.scheduleSummary = c.scheduleSummary
    o.selectedDates = c.selectedDates.toTypedArray()
    o.selectedWeekDays = c.selectedWeekDays.toList().toTypedArray()
    o.isConfigured = c.isConfigured
    o.hasStops = c.hasStops
    o.availablePickupStops = emptyArray<dynamic>()
    o.availableDropOffStops = emptyArray<dynamic>()
    return o
}

private fun mapPassSetupEffect(effect: PassSetupEffect): dynamic {
    val o = js("({})")
    when (effect) {
        is PassSetupEffect.OpenStopPicker -> {
            o.type = "OpenStopPicker"
            o.timeOfDay = effect.timeOfDay.name
            o.isPickup = effect.isPickup
            o.availableStops = effect.availableStops.map { mapStopInfo(it) }.toTypedArray()
        }
        is PassSetupEffect.LaunchCalendar -> {
            o.type = "LaunchCalendar"
            o.timeOfDay = effect.timeOfDay.name
            o.calendarDataJson = Json.encodeToString(effect.calendarData)
            o.totalRidesPerShift = effect.totalRidesPerShift
            o.selectedWeekDays = effect.selectedWeekDays.toList().toTypedArray()
            o.selectedDates = effect.selectedDates.toTypedArray()
            o.minimumDaysPerWeek = effect.minimumDaysPerWeek
        }
        is PassSetupEffect.NavigateToCheckout -> {
            o.type = "NavigateToCheckout"
            o.planName = effect.passSetupData.planName
            o.planSlug = effect.passSetupData.planSlug
            o.totalRides = effect.passSetupData.totalRidesPerShift *
                (if (effect.passSetupData.isRoundTrip) 2 else 1)
            o.isRoundTrip = effect.passSetupData.isRoundTrip
            o.walletBalance = effect.walletBalance
        }
        is PassSetupEffect.NavigateBack -> o.type = "NavigateBack"
        is PassSetupEffect.ShowSnackbar -> {
            o.type = "ShowSnackbar"
            o.message = effect.message
        }
    }
    return o
}

// ─── Calendar ────────────────────────────────────────────────────────────────

private fun mapCalendarData(model: CalendarUiModel): dynamic {
    val o = js("({})")
    o.calendarDates = model.calendarDates.values.map { mapCalendarDateItem(it) }.toTypedArray()
    o.selectedWeekDays = model.selectedWeekDays.map { mapWeekDayItem(it) }.toTypedArray()
    o.totalRidesNeeded = model.totalRidesNeeded
    o.selectedRideCount = model.selectedRideCount
    o.startDateText = model.startDateText
    o.endDateText = model.endDateText
    o.planDurationText = model.planDurationText
    o.weekSelectionError = model.weekSelectionError
    o.holidayRemarks = model.holidayRemarks.toTypedArray()
    o.isHolidayRemarksExpanded = model.isHolidayRemarksExpanded
    o.isConfirmEnabled = model.isConfirmEnabled
    o.monthLabel = model.calendarDates.values.firstOrNull()?.monthYear ?: ""
    return o
}

private fun mapCalendarDateItem(d: CalendarDateUiModel): dynamic {
    val o = js("({})")
    o.date = d.date; o.dayOfMonth = d.dayOfMonth
    o.isHoliday = d.isHoliday; o.isWeekend = d.isWeekend
    o.isSelected = d.isSelected; o.isStartDate = d.isStartDate; o.isEndDate = d.isEndDate
    o.isAvailable = d.isAvailable; o.holidayRemark = d.holidayRemark
    return o
}

private fun mapWeekDayItem(d: DayOfWeekUiModel): dynamic {
    val o = js("({})")
    o.label = d.label; o.index = d.index
    o.isSelected = d.selected; o.isEnabled = d.enabled
    return o
}

private fun mapCalendarEffect(effect: CalendarEffect): dynamic {
    val o = js("({})")
    when (effect) {
        is CalendarEffect.NavigateBackWithDates -> {
            o.type = "NavigateBackWithDates"
            o.selectedDates = effect.selectedDates.toTypedArray()
            o.selectedWeekDays = effect.selectedWeekDays.toList().toTypedArray()
        }
        is CalendarEffect.ShowError -> { o.type = "ShowError"; o.message = effect.message }
    }
    return o
}

// ─── Checkout ────────────────────────────────────────────────────────────────

private fun mapCheckoutData(model: CheckoutUiModel): dynamic {
    val o = js("({})")
    o.planName = model.planName
    o.shiftSummaries = model.shiftSummaries.map { mapShiftSummary(it) }.toTypedArray()
    o.pricing = mapPricingData(model.pricing)
    o.paymentMethods = model.paymentMethods.map { mapPaymentMethodItem(it) }.toTypedArray()
    o.selectedPaymentMethod = model.selectedPaymentMethod?.name?.lowercase()
    o.walletBalance = model.walletBalance
    o.isWalletInsufficient = model.isWalletInsufficient
    o.termsAccepted = model.termsAccepted
    o.isPlaceOrderEnabled = model.isPlaceOrderEnabled
    o.isProcessing = model.isProcessing
    o.isOrderSummaryExpanded = model.isOrderSummaryExpanded
    return o
}

private fun mapPricingData(p: PricingBreakdownUiModel): dynamic {
    val o = js("({})")
    o.baseFarePerRide = p.baseFarePerRide
    o.totalRides = p.totalRides
    o.baseFareTotal = p.baseFareTotal
    o.convenienceFee = p.convenienceFee
    o.gstRate = p.gstRate * 100f
    o.gstAmount = p.gstAmount
    o.walletCredit = p.walletCredit
    o.totalPayable = p.totalPayable
    return o
}

private fun mapPaymentMethodItem(pm: PaymentMethodUiModel): dynamic {
    val o = js("({})")
    o.id = pm.method.name.lowercase()
    o.label = pm.method.displayName
    o.description = pm.subtitle
    o.icon = when (pm.method) {
        PaymentMethod.WALLET -> "\uD83D\uDCB0"
        PaymentMethod.UPI -> "\uD83D\uDCF1"
        PaymentMethod.CARD -> "\uD83D\uDCB3"
    }
    return o
}

private fun mapCheckoutEffect(effect: CheckoutEffect): dynamic {
    val o = js("({})")
    when (effect) {
        is CheckoutEffect.NavigateToMySubscription -> {
            o.type = "NavigateToMySubscription"; o.orderId = effect.orderId
        }
        is CheckoutEffect.ShowError -> { o.type = "ShowError"; o.message = effect.message }
    }
    return o
}

// ─── My Subscription ─────────────────────────────────────────────────────────

private fun mapMySubscriptionData(model: MySubscriptionUiModel): dynamic {
    val o = js("({})")
    o.planName = model.planName
    o.status = model.status.name
    o.statusLabel = model.statusLabel
    o.ridesUsed = model.ridesUsed
    o.totalRides = model.totalRides
    o.usagePercentage = model.usagePercentage
    o.upcomingRides = model.upcomingRides.map { mapUpcomingRide(it) }.toTypedArray()
    o.startDate = model.startDate
    o.endDate = model.endDate
    o.daysRemaining = model.daysRemaining
    o.shifts = model.shifts.map { mapShiftSummary(it) }.toTypedArray()
    o.renewalCta = mapRenewalCta(model.renewalCta)
    o.usageText = model.usageText
    o.daysRemainingText = model.daysRemainingText
    return o
}

private fun mapUpcomingRide(r: UpcomingRideUiModel): dynamic {
    val o = js("({})")
    o.date = r.date; o.dayLabel = r.dayOfWeek
    o.pickupStop = r.pickupStop; o.pickupTime = r.pickupTime
    o.dropOffStop = r.dropOffStop; o.dropOffTime = ""
    o.shift = "Morning"
    return o
}

private fun mapRenewalCta(cta: RenewalCtaState): dynamic {
    val o = js("({})")
    when (cta) {
        is RenewalCtaState.Hidden -> o.type = "HIDDEN"
        is RenewalCtaState.Visible -> { o.type = "VISIBLE"; o.message = cta.message }
        is RenewalCtaState.Expired -> { o.type = "EXPIRED"; o.message = cta.message }
    }
    return o
}

private fun mapMySubscriptionEffect(effect: MySubscriptionEffect): dynamic {
    val o = js("({})")
    when (effect) {
        is MySubscriptionEffect.NavigateToPlanSelection -> o.type = "NavigateToPlanSelection"
        is MySubscriptionEffect.ShowSnackbar -> { o.type = "ShowSnackbar"; o.message = effect.message }
    }
    return o
}

// =============================================================================
// Wrapper VM classes
// =============================================================================

@JsExport
class JsPlanSelectionVM {
    private val vm = PlanSelectionViewModel(
        planRepository = MockPlanRepository(),
        analyticsService = ConsoleAnalyticsService()
    )
    fun observeState(callback: (dynamic) -> Unit): () -> Unit =
        vm.observeState { callback(mapUiState(it, ::mapPlanSelectionData)) }
    fun observeEffect(callback: (dynamic) -> Unit): () -> Unit =
        vm.observeEffect { callback(mapPlanSelectionEffect(it)) }
    fun destroy() = vm.destroy()
    fun fetchPlans() = vm.sendEvent(PlanSelectionEvent.FetchPlans)
    fun selectPlan(slug: String) = vm.sendEvent(PlanSelectionEvent.SelectPlan(slug))
    fun proceedWithPlan() = vm.sendEvent(PlanSelectionEvent.ProceedWithPlan)
}

@JsExport
class JsPassSetupVM {
    private val vm = PassSetupViewModel(
        subscriptionRepository = MockSubscriptionRepository(),
        calendarRepository = MockCalendarRepository(),
        analyticsService = ConsoleAnalyticsService()
    )
    fun observeState(callback: (dynamic) -> Unit): () -> Unit =
        vm.observeState { callback(mapUiState(it, ::mapPassSetupData)) }
    fun observeEffect(callback: (dynamic) -> Unit): () -> Unit =
        vm.observeEffect { callback(mapPassSetupEffect(it)) }
    fun destroy() = vm.destroy()
    fun fetchPrefillData(planSlug: String) = vm.sendEvent(PassSetupEvent.FetchPrefillData(planSlug))
    fun selectShiftTab(timeOfDay: String) = vm.sendEvent(PassSetupEvent.SelectShiftTab(TimeOfDay.valueOf(timeOfDay)))
    fun openPickupStopPicker(timeOfDay: String) =
        vm.sendEvent(PassSetupEvent.RequestPickupStopPicker(TimeOfDay.valueOf(timeOfDay)))
    fun openDropOffStopPicker(timeOfDay: String) =
        vm.sendEvent(PassSetupEvent.RequestDropOffStopPicker(TimeOfDay.valueOf(timeOfDay)))
    fun setPickupStop(timeOfDay: String, stopId: Long, stopName: String, stopTime: String) =
        vm.sendEvent(PassSetupEvent.SetPickupStop(TimeOfDay.valueOf(timeOfDay), StopUiModel(stopId, stopName, stopTime, 0.0, 0.0)))
    fun setDropOffStop(timeOfDay: String, stopId: Long, stopName: String, stopTime: String) =
        vm.sendEvent(PassSetupEvent.SetDropOffStop(TimeOfDay.valueOf(timeOfDay), StopUiModel(stopId, stopName, stopTime, 0.0, 0.0)))
    fun editSchedule(timeOfDay: String) = vm.sendEvent(PassSetupEvent.EditSchedule(TimeOfDay.valueOf(timeOfDay)))
    fun onScheduleConfirmed(timeOfDay: String, dates: Array<String>, weekDays: Array<Int>) =
        vm.sendEvent(PassSetupEvent.OnScheduleConfirmed(TimeOfDay.valueOf(timeOfDay), dates.toList(), weekDays.toSet()))
    fun proceedToCheckout() = vm.sendEvent(PassSetupEvent.ProceedToCheckout)
    fun changePlan() = vm.sendEvent(PassSetupEvent.ChangePlan)
}

@JsExport
class JsCalendarVM {
    private val vm = CalendarViewModel(analyticsService = ConsoleAnalyticsService())
    fun observeState(callback: (dynamic) -> Unit): () -> Unit =
        vm.observeState { callback(mapUiState(it, ::mapCalendarData)) }
    fun observeEffect(callback: (dynamic) -> Unit): () -> Unit =
        vm.observeEffect { callback(mapCalendarEffect(it)) }
    fun destroy() = vm.destroy()
    fun initialize(rawDatesJson: String, totalRidesNeeded: Int, selectedWeekDays: Array<Int>,
                   selectedDates: Array<String>, maxValidStartDate: String, minimumDaysPerWeek: Int) {
        vm.sendEvent(CalendarEvent.Initialize(rawDatesJson, totalRidesNeeded, selectedWeekDays.toSet(),
            selectedDates.toList(), maxValidStartDate, minimumDaysPerWeek))
    }
    fun toggleWeekDay(dayIndex: Int) = vm.sendEvent(CalendarEvent.ToggleWeekDay(dayIndex))
    fun selectDate(date: String) = vm.sendEvent(CalendarEvent.SelectDate(date))
    fun confirmDates() = vm.sendEvent(CalendarEvent.ConfirmDates)
    fun toggleHolidayRemarks() = vm.sendEvent(CalendarEvent.ToggleHolidayRemarks)
}

@JsExport
class JsCheckoutVM {
    private val vm = CheckoutViewModel(
        subscriptionRepository = MockSubscriptionRepository(),
        analyticsService = ConsoleAnalyticsService()
    )
    fun observeState(callback: (dynamic) -> Unit): () -> Unit =
        vm.observeState { callback(mapUiState(it, ::mapCheckoutData)) }
    fun observeEffect(callback: (dynamic) -> Unit): () -> Unit =
        vm.observeEffect { callback(mapCheckoutEffect(it)) }
    fun destroy() = vm.destroy()
    fun loadCheckout(planSlug: String, planName: String, baseFarePerRide: Float,
                     totalRides: Int, walletBalance: Float, isRoundTrip: Boolean) =
        vm.sendEvent(CheckoutEvent.LoadCheckout(planSlug, planName, baseFarePerRide, totalRides, walletBalance, isRoundTrip))
    fun selectPaymentMethod(method: String) =
        vm.sendEvent(CheckoutEvent.SelectPaymentMethod(PaymentMethod.valueOf(method.uppercase())))
    fun toggleTerms() = vm.sendEvent(CheckoutEvent.ToggleTerms)
    fun toggleOrderSummary() = vm.sendEvent(CheckoutEvent.ToggleOrderSummary)
    fun placeOrder() = vm.sendEvent(CheckoutEvent.PlaceOrder)
}

@JsExport
class JsMySubscriptionVM {
    private val vm = MySubscriptionViewModel(analyticsService = ConsoleAnalyticsService())
    fun observeState(callback: (dynamic) -> Unit): () -> Unit =
        vm.observeState { callback(mapUiState(it, ::mapMySubscriptionData)) }
    fun observeEffect(callback: (dynamic) -> Unit): () -> Unit =
        vm.observeEffect { callback(mapMySubscriptionEffect(it)) }
    fun destroy() = vm.destroy()
    fun loadSubscription(orderId: String) = vm.sendEvent(MySubscriptionEvent.LoadSubscription(orderId))
    fun refreshStatus() = vm.sendEvent(MySubscriptionEvent.RefreshStatus)
    fun renewSubscription() = vm.sendEvent(MySubscriptionEvent.RenewSubscription)
    fun backToHome() = vm.sendEvent(MySubscriptionEvent.BackToHome)
}

// ─── Factory functions ───────────────────────────────────────────────────────

@JsExport fun createPlanSelectionVM(): JsPlanSelectionVM = JsPlanSelectionVM()
@JsExport fun createPassSetupVM(): JsPassSetupVM = JsPassSetupVM()
@JsExport fun createCalendarVM(): JsCalendarVM = JsCalendarVM()
@JsExport fun createCheckoutVM(): JsCheckoutVM = JsCheckoutVM()
@JsExport fun createMySubscriptionVM(): JsMySubscriptionVM = JsMySubscriptionVM()
