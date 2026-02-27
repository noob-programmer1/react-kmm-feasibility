package com.cityflo.subscription.presentation.viewmodel.checkout

import com.cityflo.subscription.arch.BaseViewModel
import com.cityflo.subscription.data.dto.PlaceSubscriptionRequest
import com.cityflo.subscription.data.dto.ShiftOrderDto
import com.cityflo.subscription.domain.ISubscriptionRepository
import com.cityflo.subscription.presentation.analytics.AnalyticsService
import com.cityflo.subscription.presentation.analytics.SubscriptionAnalytics
import com.cityflo.subscription.presentation.model.*
import com.cityflo.subscription.util.*
import kotlinx.coroutines.launch

class CheckoutViewModel(
    private val subscriptionRepository: ISubscriptionRepository,
    private val analyticsService: AnalyticsService
) : BaseViewModel<CheckoutUiState, CheckoutEvent, CheckoutEffect>(
    UiState.idle()
) {

    private var planSlug: String = ""
    private var passSetupData: PassSetupUiModel? = null

    override fun handleEvent(event: CheckoutEvent) {
        when (event) {
            is CheckoutEvent.LoadCheckout -> loadCheckout(event)
            is CheckoutEvent.SelectPaymentMethod -> selectPaymentMethod(event.method)
            CheckoutEvent.ToggleTerms -> toggleTerms()
            CheckoutEvent.ToggleOrderSummary -> toggleOrderSummary()
            CheckoutEvent.PlaceOrder -> placeOrder()
        }
    }

    fun initWithPassSetupData(data: PassSetupUiModel, walletBalance: Float) {
        passSetupData = data
        sendEvent(
            CheckoutEvent.LoadCheckout(
                planSlug = data.planSlug,
                planName = data.planName,
                baseFarePerRide = 65f, // Will be overridden
                totalRides = data.shifts.values.sumOf { it.selectedDates.size },
                walletBalance = walletBalance,
                isRoundTrip = data.isRoundTrip
            )
        )
    }

    private fun loadCheckout(event: CheckoutEvent.LoadCheckout) {
        planSlug = event.planSlug

        analyticsService.track(
            SubscriptionAnalytics.CheckoutStarted(
                planSlug = event.planSlug,
                totalAmount = event.baseFarePerRide * event.totalRides
            )
        )

        val pricing = PricingCalculator.calculatePricing(
            baseFarePerRide = event.baseFarePerRide,
            totalRides = event.totalRides,
            walletBalance = event.walletBalance
        )

        val shiftSummaries = passSetupData?.shifts?.values
            ?.mapNotNull { shift ->
                if (!shift.isConfigured) return@mapNotNull null
                val dates = shift.selectedDates
                val start = DateUtils.parseDate(dates.first())
                val end = DateUtils.parseDate(dates.last())
                ShiftSummaryUiModel(
                    timeOfDay = shift.timeOfDay,
                    pickupStopName = shift.pickupStop!!.name,
                    dropOffStopName = shift.dropOffStop!!.name,
                    pickupTime = shift.pickupStop.time,
                    ridesCount = dates.size,
                    dateRange = DateUtils.formatDateRange(start, end)
                )
            } ?: emptyList()

        val isWalletInsufficient = !PricingCalculator.isWalletSufficient(event.walletBalance, pricing.totalPayable)

        val paymentMethods = listOf(
            PaymentMethodUiModel(
                method = PaymentMethod.WALLET,
                isSelected = false,
                isEnabled = !isWalletInsufficient,
                subtitle = if (isWalletInsufficient)
                    "Insufficient balance (₹${event.walletBalance.toInt()})"
                else
                    "Balance: ₹${event.walletBalance.toInt()}"
            ),
            PaymentMethodUiModel(
                method = PaymentMethod.UPI,
                isSelected = false,
                isEnabled = true,
                subtitle = "Pay via UPI"
            ),
            PaymentMethodUiModel(
                method = PaymentMethod.CARD,
                isSelected = false,
                isEnabled = true,
                subtitle = "Credit/Debit Card"
            )
        )

        setState {
            UiState.success(
                CheckoutUiModel(
                    planName = event.planName,
                    shiftSummaries = shiftSummaries,
                    pricing = pricing,
                    paymentMethods = paymentMethods,
                    selectedPaymentMethod = null,
                    walletBalance = event.walletBalance,
                    isWalletInsufficient = isWalletInsufficient,
                    termsAccepted = false,
                    isPlaceOrderEnabled = false,
                    isProcessing = false,
                    isOrderSummaryExpanded = false
                )
            )
        }
    }

    private fun selectPaymentMethod(method: PaymentMethod) {
        val data = currentState.getOrNull() ?: return

        analyticsService.track(
            SubscriptionAnalytics.PaymentMethodSelected(method.displayName)
        )

        val updatedMethods = data.paymentMethods.map {
            it.copy(isSelected = it.method == method)
        }

        val canPlace = ValidationEngine.canPlaceOrder(method, data.termsAccepted, data.isProcessing)

        setState {
            UiState.success(
                data.copy(
                    paymentMethods = updatedMethods,
                    selectedPaymentMethod = method,
                    isPlaceOrderEnabled = canPlace
                )
            )
        }
    }

    private fun toggleTerms() {
        val data = currentState.getOrNull() ?: return
        val newTerms = !data.termsAccepted
        val canPlace = ValidationEngine.canPlaceOrder(data.selectedPaymentMethod, newTerms, data.isProcessing)

        setState {
            UiState.success(
                data.copy(termsAccepted = newTerms, isPlaceOrderEnabled = canPlace)
            )
        }
    }

    private fun toggleOrderSummary() {
        val data = currentState.getOrNull() ?: return
        setState {
            UiState.success(data.copy(isOrderSummaryExpanded = !data.isOrderSummaryExpanded))
        }
    }

    private fun placeOrder() {
        val data = currentState.getOrNull() ?: return
        if (!data.isPlaceOrderEnabled) return

        setState { UiState.success(data.copy(isProcessing = true, isPlaceOrderEnabled = false)) }

        scope.launch {
            val shifts = passSetupData?.shifts?.values?.map { shift ->
                ShiftOrderDto(
                    timeOfDay = shift.timeOfDay.slug,
                    startStopInfoPk = shift.pickupStop?.id ?: 0,
                    endStopInfoPk = shift.dropOffStop?.id ?: 0,
                    selectedDates = shift.selectedDates,
                    routeSlotPk = shift.routeSlotPk ?: 0
                )
            } ?: emptyList()

            subscriptionRepository.placeSubscription(
                PlaceSubscriptionRequest(
                    planSlug = planSlug,
                    paymentMethod = data.selectedPaymentMethod?.name ?: "UPI",
                    shifts = shifts
                )
            ).onSuccess { response ->
                analyticsService.track(
                    SubscriptionAnalytics.OrderPlaced(
                        orderId = response.orderId,
                        planSlug = planSlug,
                        totalAmount = data.pricing.totalPayable,
                        paymentMethod = data.selectedPaymentMethod?.displayName ?: "",
                        totalRides = response.totalRides
                    )
                )
                setEffect { CheckoutEffect.NavigateToMySubscription(response.orderId) }
            }.onFailure {
                setState {
                    UiState.success(data.copy(isProcessing = false, isPlaceOrderEnabled = true))
                }
                setEffect { CheckoutEffect.ShowError("Payment failed. Please try again.") }
            }
        }
    }
}
