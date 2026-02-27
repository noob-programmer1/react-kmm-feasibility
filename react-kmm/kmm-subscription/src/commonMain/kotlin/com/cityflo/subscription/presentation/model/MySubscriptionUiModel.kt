package com.cityflo.subscription.presentation.model

data class UpcomingRideUiModel(
    val date: String,
    val dayOfWeek: String,
    val pickupStop: String,
    val pickupTime: String,
    val dropOffStop: String,
    val isToday: Boolean
)

sealed class RenewalCtaState {
    data object Hidden : RenewalCtaState()
    data class Visible(val message: String) : RenewalCtaState()
    data class Expired(val message: String) : RenewalCtaState()
}

data class MySubscriptionUiModel(
    val orderId: String,
    val planName: String,
    val status: SubscriptionStatus,
    val statusLabel: String,
    val ridesUsed: Int,
    val totalRides: Int,
    val usagePercentage: Float,
    val upcomingRides: List<UpcomingRideUiModel>,
    val startDate: String,
    val endDate: String,
    val daysRemaining: Int,
    val shifts: List<ShiftSummaryUiModel>,
    val renewalCta: RenewalCtaState
) {
    val usageText: String = "$ridesUsed / $totalRides rides used"
    val daysRemainingText: String = "$daysRemaining days remaining"
}
