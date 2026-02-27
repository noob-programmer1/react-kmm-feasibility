package com.cityflo.subscription.presentation.analytics

/**
 * All analytics events for the subscription flow.
 * Mirrors CityFlo's sealed class analytics pattern.
 */
sealed class SubscriptionAnalytics : AnalyticsEvent {

    // ---- Plan Selection ----

    data object PlansViewed : SubscriptionAnalytics() {
        override val name = "Plans Viewed"
    }

    data class PlanSelected(val planSlug: String, val planName: String, val price: Float) : SubscriptionAnalytics() {
        override val name = "Plan Selected"
        override val payload = mapOf("Plan Slug" to planSlug, "Plan Name" to planName, "Price" to price)
    }

    data class PlanCompared(val fromPlan: String, val toPlan: String) : SubscriptionAnalytics() {
        override val name = "Plan Compared"
        override val payload = mapOf("From Plan" to fromPlan, "To Plan" to toPlan)
    }

    // ---- Pass Setup ----

    data class PassSetupStarted(val planSlug: String, val isRoundTrip: Boolean) : SubscriptionAnalytics() {
        override val name = "Pass Setup Started"
        override val payload = mapOf("Plan Slug" to planSlug, "Is Round Trip" to isRoundTrip)
    }

    data class ShiftTabChanged(val shift: String) : SubscriptionAnalytics() {
        override val name = "Shift Tab Changed"
        override val payload = mapOf("Shift" to shift)
    }

    data class StopSelected(
        val shift: String,
        val isPickup: Boolean,
        val stopName: String
    ) : SubscriptionAnalytics() {
        override val name = "Stop Selected"
        override val payload = mapOf(
            "Shift" to shift,
            "Type" to if (isPickup) "Pickup" else "Drop-off",
            "Stop Name" to stopName
        )
    }

    // ---- Calendar ----

    data class CalendarOpened(val shift: String) : SubscriptionAnalytics() {
        override val name = "Calendar Opened"
        override val payload = mapOf("Shift" to shift)
    }

    data class WeekDayToggled(
        val dayIndex: Int,
        val dayLabel: String,
        val isSelected: Boolean
    ) : SubscriptionAnalytics() {
        override val name = "Week Day Toggled"
        override val payload = mapOf("Day" to dayLabel, "Selected" to isSelected)
    }

    data class CalendarDateClicked(val date: String, val isHoliday: Boolean) : SubscriptionAnalytics() {
        override val name = "Calendar Date Clicked"
        override val payload = mapOf("Date" to date, "Is Holiday" to isHoliday)
    }

    data class DatesConfirmed(
        val numberOfWeekDays: Int,
        val selectedWeekDays: Set<Int>,
        val totalRides: Int
    ) : SubscriptionAnalytics() {
        override val name = "Dates Confirmed"
        override val payload = mapOf(
            "Number of Weekdays" to numberOfWeekDays,
            "Total Rides" to totalRides,
            "Monday" to (0 in selectedWeekDays),
            "Tuesday" to (1 in selectedWeekDays),
            "Wednesday" to (2 in selectedWeekDays),
            "Thursday" to (3 in selectedWeekDays),
            "Friday" to (4 in selectedWeekDays)
        )
    }

    // ---- Checkout ----

    data class CheckoutStarted(val planSlug: String, val totalAmount: Float) : SubscriptionAnalytics() {
        override val name = "Checkout Started"
        override val payload = mapOf("Plan Slug" to planSlug, "Total Amount" to totalAmount)
    }

    data class PaymentMethodSelected(val method: String) : SubscriptionAnalytics() {
        override val name = "Payment Method Selected"
        override val payload = mapOf("Method" to method)
    }

    data class OrderPlaced(
        val orderId: String,
        val planSlug: String,
        val totalAmount: Float,
        val paymentMethod: String,
        val totalRides: Int
    ) : SubscriptionAnalytics() {
        override val name = "Order Placed"
        override val payload = mapOf(
            "Order ID" to orderId,
            "Plan Slug" to planSlug,
            "Total Amount" to totalAmount,
            "Payment Method" to paymentMethod,
            "Total Rides" to totalRides
        )
    }

    // ---- My Subscription ----

    data class SubscriptionViewed(val orderId: String, val status: String) : SubscriptionAnalytics() {
        override val name = "Subscription Viewed"
        override val payload = mapOf("Order ID" to orderId, "Status" to status)
    }

    data class RenewalClicked(val currentPlan: String) : SubscriptionAnalytics() {
        override val name = "Renewal Clicked"
        override val payload = mapOf("Current Plan" to currentPlan)
    }
}
