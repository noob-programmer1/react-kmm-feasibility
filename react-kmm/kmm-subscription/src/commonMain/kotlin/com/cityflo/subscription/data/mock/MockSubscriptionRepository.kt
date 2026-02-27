package com.cityflo.subscription.data.mock

import com.cityflo.subscription.data.dto.*
import com.cityflo.subscription.domain.ISubscriptionRepository
import com.cityflo.subscription.util.ApiResponse
import com.cityflo.subscription.util.DateUtils
import com.cityflo.subscription.util.NetworkResponse
import kotlinx.coroutines.delay
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.plus

class MockSubscriptionRepository : ISubscriptionRepository {

    private val morningPickupStops = listOf(
        StopInfoDto(id = 101, name = "Borivali Station", departureTime = "07:15", lat = 19.2307, lng = 72.8567),
        StopInfoDto(id = 102, name = "Kandivali East", departureTime = "07:30", lat = 19.2047, lng = 72.8697),
        StopInfoDto(id = 103, name = "Malad West", departureTime = "07:45", lat = 19.1872, lng = 72.8484)
    )

    private val morningDropoffStops = listOf(
        StopInfoDto(id = 201, name = "BKC Platina", departureTime = "09:00", lat = 19.0658, lng = 72.8710),
        StopInfoDto(id = 202, name = "Airoli Sector 5", departureTime = "09:15", lat = 19.1551, lng = 72.9984),
        StopInfoDto(id = 203, name = "Ghansoli", departureTime = "09:30", lat = 19.1296, lng = 73.0086)
    )

    private val eveningPickupStops = listOf(
        StopInfoDto(id = 301, name = "BKC Platina", departureTime = "18:30", lat = 19.0658, lng = 72.8710),
        StopInfoDto(id = 302, name = "Airoli Sector 5", departureTime = "18:45", lat = 19.1551, lng = 72.9984),
        StopInfoDto(id = 303, name = "Ghansoli", departureTime = "19:00", lat = 19.1296, lng = 73.0086)
    )

    private val eveningDropoffStops = listOf(
        StopInfoDto(id = 401, name = "Borivali Station", departureTime = "20:15", lat = 19.2307, lng = 72.8567),
        StopInfoDto(id = 402, name = "Kandivali East", departureTime = "20:30", lat = 19.2047, lng = 72.8697),
        StopInfoDto(id = 403, name = "Malad West", departureTime = "20:45", lat = 19.1872, lng = 72.8484)
    )

    override suspend fun getPrefillData(
        planSlug: String,
        timeOfDaySlug: String?,
        startStopInfoPk: Long?,
        endStopInfoPk: Long?
    ): ApiResponse<PrefillResponseDto> {
        delay(700)

        val isRoundTrip = planSlug.contains("round-trip")
        val isMonthly = planSlug.contains("monthly")
        val totalRides = if (isMonthly) {
            if (isRoundTrip) 44 else 22
        } else {
            if (isRoundTrip) 12 else 6
        }

        return NetworkResponse.Success(
            PrefillResponseDto(
                plan = SubscriptionPlanDto(
                    slug = planSlug,
                    name = planSlug.replace("-", " ")
                        .replaceFirstChar { it.uppercase() },
                    totalRides = totalRides,
                    pricePerRide = when (planSlug) {
                        "weekly-one-way" -> 85f
                        "weekly-round-trip" -> 75f
                        "monthly-one-way" -> 75f
                        "monthly-round-trip" -> 65f
                        else -> 75f
                    },
                    totalPrice = when (planSlug) {
                        "weekly-one-way" -> 510f
                        "weekly-round-trip" -> 900f
                        "monthly-one-way" -> 1650f
                        "monthly-round-trip" -> 2860f
                        else -> 0f
                    },
                    durationDays = if (isMonthly) 30 else 7,
                    isRoundTrip = isRoundTrip,
                    features = emptyList(),
                    subscriptionPreferenceDays = listOf(0, 1, 2, 3, 4),
                    minimumDaysPerWeek = 5
                ),
                morningData = if (isRoundTrip || timeOfDaySlug == "1") {
                    ShiftPrefillDto(heading = "Morning Shift")
                } else null,
                eveningData = if (isRoundTrip || timeOfDaySlug == "2") {
                    ShiftPrefillDto(heading = "Evening Shift")
                } else null,
                remarks = listOf(
                    "Select your preferred pickup and drop-off stops",
                    "You can change stops anytime before your subscription starts"
                ),
                holidaySummary = "3 holidays in the selected period",
                walletBalance = 500f
            )
        )
    }

    override suspend fun getAvailableStops(
        timeOfDay: String,
        routeSlotPk: Long?
    ): ApiResponse<AvailableStopsResponse> {
        delay(400)

        val isMorning = timeOfDay == "1"
        return NetworkResponse.Success(
            AvailableStopsResponse(
                pickupStops = if (isMorning) morningPickupStops else eveningPickupStops,
                dropoffStops = if (isMorning) morningDropoffStops else eveningDropoffStops
            )
        )
    }

    override suspend fun placeSubscription(
        request: PlaceSubscriptionRequest
    ): ApiResponse<PlaceSubscriptionResponse> {
        delay(1500) // Simulate payment processing

        val today = DateUtils.today()
        val startDate = today.plus(1, DateTimeUnit.DAY)
        val endDate = if (request.planSlug.contains("monthly"))
            today.plus(30, DateTimeUnit.DAY)
        else
            today.plus(7, DateTimeUnit.DAY)

        return NetworkResponse.Success(
            PlaceSubscriptionResponse(
                orderId = "SUB-${(100000..999999).random()}",
                status = "ACTIVE",
                planName = request.planSlug.replace("-", " ")
                    .replaceFirstChar { it.uppercase() },
                totalRides = request.shifts.sumOf { it.selectedDates.size },
                startDate = DateUtils.formatDate(startDate),
                endDate = DateUtils.formatDate(endDate),
                totalAmount = 2860f // Simplified
            )
        )
    }
}
