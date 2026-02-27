package com.cityflo.subscription.data.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// ---- Plan DTOs ----

@Serializable
data class SubscriptionPlanDto(
    @SerialName("slug") val slug: String,
    @SerialName("name") val name: String,
    @SerialName("total_rides") val totalRides: Int,
    @SerialName("price_per_ride") val pricePerRide: Float,
    @SerialName("total_price") val totalPrice: Float,
    @SerialName("duration_days") val durationDays: Int,
    @SerialName("is_round_trip") val isRoundTrip: Boolean,
    @SerialName("features") val features: List<String>,
    @SerialName("savings_text") val savingsText: String? = null,
    @SerialName("is_popular") val isPopular: Boolean = false,
    @SerialName("subscription_preference_days") val subscriptionPreferenceDays: List<Int>? = null,
    @SerialName("min_days_per_week") val minimumDaysPerWeek: Int = 5
)

@Serializable
data class PlansResponse(
    @SerialName("plans") val plans: List<SubscriptionPlanDto>
)

// ---- Calendar DTOs ----

@Serializable
data class CalendarDateDto(
    @SerialName("date") val date: String,                    // "dd-MM-yyyy"
    @SerialName("is_ride_available") val isRideAvailable: Boolean,
    @SerialName("holiday_remark") val holidayRemark: String? = null
)

@Serializable
data class CalendarRemarkDto(
    @SerialName("text") val text: String,
    @SerialName("icon") val icon: String? = null
)

@Serializable
data class CalendarResponseDto(
    @SerialName("dates") val dates: List<CalendarDateDto>,
    @SerialName("max_valid_start_date") val maxValidStartDate: String,
    @SerialName("footer_remarks") val footerRemarks: List<CalendarRemarkDto> = emptyList()
)

// ---- Prefill DTOs ----

@Serializable
data class StopInfoDto(
    @SerialName("pk") val id: Long,
    @SerialName("stop_name") val name: String,
    @SerialName("departure_time") val departureTime: String?,  // "HH:mm"
    @SerialName("lat") val lat: Double = 0.0,
    @SerialName("lng") val lng: Double = 0.0
)

@Serializable
data class ShiftPrefillDto(
    @SerialName("start_stop_info") val startStopInfo: StopInfoDto? = null,
    @SerialName("end_stop_info") val endStopInfo: StopInfoDto? = null,
    @SerialName("route_slot_pk") val routeSlotPk: Long? = null,
    @SerialName("number_of_working_days") val numberOfWorkingDays: Int? = null,
    @SerialName("heading") val heading: String? = null,
    @SerialName("selected_dates") val selectedDates: List<String>? = null
)

@Serializable
data class PrefillResponseDto(
    @SerialName("plan") val plan: SubscriptionPlanDto,
    @SerialName("morning") val morningData: ShiftPrefillDto? = null,
    @SerialName("evening") val eveningData: ShiftPrefillDto? = null,
    @SerialName("remarks") val remarks: List<String>? = null,
    @SerialName("holiday_summary") val holidaySummary: String? = null,
    @SerialName("wallet_balance") val walletBalance: Float = 0f
)

// ---- Order DTOs ----

@Serializable
data class PlaceSubscriptionRequest(
    @SerialName("plan_slug") val planSlug: String,
    @SerialName("payment_method") val paymentMethod: String,
    @SerialName("shifts") val shifts: List<ShiftOrderDto>
)

@Serializable
data class ShiftOrderDto(
    @SerialName("time_of_day") val timeOfDay: String,
    @SerialName("start_stop_info_pk") val startStopInfoPk: Long,
    @SerialName("end_stop_info_pk") val endStopInfoPk: Long,
    @SerialName("selected_dates") val selectedDates: List<String>,
    @SerialName("route_slot_pk") val routeSlotPk: Long
)

@Serializable
data class PlaceSubscriptionResponse(
    @SerialName("order_id") val orderId: String,
    @SerialName("status") val status: String,
    @SerialName("plan_name") val planName: String,
    @SerialName("total_rides") val totalRides: Int,
    @SerialName("start_date") val startDate: String,
    @SerialName("end_date") val endDate: String,
    @SerialName("total_amount") val totalAmount: Float
)

// ---- Available Stops ----

@Serializable
data class AvailableStopsResponse(
    @SerialName("pickup_stops") val pickupStops: List<StopInfoDto>,
    @SerialName("dropoff_stops") val dropoffStops: List<StopInfoDto>
)
