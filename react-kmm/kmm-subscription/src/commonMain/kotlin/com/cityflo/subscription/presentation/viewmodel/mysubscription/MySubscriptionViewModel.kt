package com.cityflo.subscription.presentation.viewmodel.mysubscription

import com.cityflo.subscription.arch.BaseViewModel
import com.cityflo.subscription.presentation.analytics.AnalyticsService
import com.cityflo.subscription.presentation.analytics.SubscriptionAnalytics
import com.cityflo.subscription.presentation.model.*
import com.cityflo.subscription.util.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.DayOfWeek
import kotlinx.datetime.plus

class MySubscriptionViewModel(
    private val analyticsService: AnalyticsService
) : BaseViewModel<MySubscriptionUiState, MySubscriptionEvent, MySubscriptionEffect>(
    UiState.idle()
) {

    override fun handleEvent(event: MySubscriptionEvent) {
        when (event) {
            is MySubscriptionEvent.LoadSubscription -> loadSubscription(event.orderId)
            MySubscriptionEvent.RefreshStatus -> refreshStatus()
            MySubscriptionEvent.RenewSubscription -> renewSubscription()
            MySubscriptionEvent.BackToHome -> {
                setEffect { MySubscriptionEffect.NavigateToPlanSelection }
            }
        }
    }

    private fun loadSubscription(orderId: String) {
        setState { UiState.loading() }

        scope.launch {
            delay(500) // Simulate load

            val today = DateUtils.today()
            val startDate = today.plus(1, DateTimeUnit.DAY)
            val endDate = today.plus(30, DateTimeUnit.DAY)

            // Generate upcoming rides for the next 5 weekdays
            val upcomingRides = mutableListOf<UpcomingRideUiModel>()
            var checkDate = startDate
            while (upcomingRides.size < 5) {
                if (!DateUtils.isWeekend(checkDate)) {
                    val dayName = checkDate.dayOfWeek.name.take(3)
                        .lowercase().replaceFirstChar { it.uppercase() }
                    upcomingRides.add(
                        UpcomingRideUiModel(
                            date = DateUtils.formatDisplayDate(checkDate),
                            dayOfWeek = dayName,
                            pickupStop = "Borivali Station",
                            pickupTime = "07:15 AM",
                            dropOffStop = "BKC Platina",
                            isToday = checkDate == today
                        )
                    )
                }
                checkDate = checkDate.plus(1, DateTimeUnit.DAY)
            }

            val model = MySubscriptionUiModel(
                orderId = orderId,
                planName = "Monthly Round Trip",
                status = SubscriptionStatus.ACTIVE,
                statusLabel = "Active",
                ridesUsed = 3,
                totalRides = 44,
                usagePercentage = 3f / 44f,
                upcomingRides = upcomingRides,
                startDate = DateUtils.formatDisplayDate(startDate),
                endDate = DateUtils.formatDisplayDate(endDate),
                daysRemaining = 28,
                shifts = listOf(
                    ShiftSummaryUiModel(
                        timeOfDay = TimeOfDay.MORNING,
                        pickupStopName = "Borivali Station",
                        dropOffStopName = "BKC Platina",
                        pickupTime = "07:15 AM",
                        ridesCount = 22,
                        dateRange = "${DateUtils.formatDisplayDate(startDate)} to ${DateUtils.formatDisplayDate(endDate)}"
                    ),
                    ShiftSummaryUiModel(
                        timeOfDay = TimeOfDay.EVENING,
                        pickupStopName = "BKC Platina",
                        dropOffStopName = "Borivali Station",
                        pickupTime = "06:30 PM",
                        ridesCount = 22,
                        dateRange = "${DateUtils.formatDisplayDate(startDate)} to ${DateUtils.formatDisplayDate(endDate)}"
                    )
                ),
                renewalCta = RenewalCtaState.Hidden
            )

            analyticsService.track(
                SubscriptionAnalytics.SubscriptionViewed(
                    orderId = orderId,
                    status = model.status.displayName
                )
            )

            setState { UiState.success(model) }

            // Start simulated status progression for demo
            startStatusProgression(model)
        }
    }

    /**
     * Simulated status progression for demo purposes.
     * Advances: ACTIVE (10s) → EXPIRING_SOON (10s) → EXPIRED
     */
    private fun startStatusProgression(initialModel: MySubscriptionUiModel) {
        scope.launch {
            delay(10_000) // 10 seconds

            val expiringModel = initialModel.copy(
                status = SubscriptionStatus.EXPIRING_SOON,
                statusLabel = "Expiring Soon",
                ridesUsed = 38,
                usagePercentage = 38f / 44f,
                daysRemaining = 3,
                renewalCta = RenewalCtaState.Visible("Your subscription expires in 3 days. Renew now!")
            )
            setState { UiState.success(expiringModel) }

            delay(10_000) // 10 more seconds

            val expiredModel = expiringModel.copy(
                status = SubscriptionStatus.EXPIRED,
                statusLabel = "Expired",
                ridesUsed = 44,
                usagePercentage = 1f,
                daysRemaining = 0,
                renewalCta = RenewalCtaState.Expired("Your subscription has expired. Renew to continue riding!")
            )
            setState { UiState.success(expiredModel) }
        }
    }

    private fun refreshStatus() {
        setEffect { MySubscriptionEffect.ShowSnackbar("Status refreshed") }
    }

    private fun renewSubscription() {
        val data = currentState.getOrNull() ?: return
        analyticsService.track(SubscriptionAnalytics.RenewalClicked(data.planName))
        setEffect { MySubscriptionEffect.NavigateToPlanSelection }
    }
}
