package com.cityflo.subscription.presentation.model

/**
 * UI model for a subscription plan card.
 */
data class PlanUiModel(
    val slug: String,
    val name: String,
    val totalRides: Int,
    val ridesPerShift: Int,
    val pricePerRide: Float,
    val totalPrice: Float,
    val durationDays: Int,
    val isRoundTrip: Boolean,
    val features: List<String>,
    val savingsText: String?,
    val isPopular: Boolean
) {
    val pricePerRideText: String = "₹${pricePerRide.toInt()}/ride"
    val totalPriceText: String = "₹${totalPrice.toInt()}"
    val durationText: String = if (durationDays == 7) "Weekly" else "Monthly"
    val tripTypeText: String = if (isRoundTrip) "Round Trip" else "One Way"
    val ridesText: String = if (isRoundTrip) "$ridesPerShift rides/shift" else "$totalRides rides"
}

data class PlanSelectionUiModel(
    val plans: List<PlanUiModel>,
    val selectedPlanSlug: String?,
    val comparisonHighlight: String?
) {
    val selectedPlan: PlanUiModel?
        get() = plans.find { it.slug == selectedPlanSlug }
}
