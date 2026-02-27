package com.cityflo.subscription.data.mock

import com.cityflo.subscription.data.dto.PlansResponse
import com.cityflo.subscription.data.dto.SubscriptionPlanDto
import com.cityflo.subscription.domain.IPlanRepository
import com.cityflo.subscription.util.ApiResponse
import com.cityflo.subscription.util.NetworkResponse
import kotlinx.coroutines.delay

class MockPlanRepository : IPlanRepository {

    override suspend fun getPlans(): ApiResponse<PlansResponse> {
        delay(800) // Simulate network delay
        return NetworkResponse.Success(
            PlansResponse(
                plans = listOf(
                    SubscriptionPlanDto(
                        slug = "weekly-one-way",
                        name = "Weekly One Way",
                        totalRides = 6,
                        pricePerRide = 85f,
                        totalPrice = 510f,
                        durationDays = 7,
                        isRoundTrip = false,
                        features = listOf(
                            "6 rides in one direction",
                            "Valid for 7 days",
                            "Flexible day selection"
                        ),
                        subscriptionPreferenceDays = listOf(0, 1, 2, 3, 4),
                        minimumDaysPerWeek = 5
                    ),
                    SubscriptionPlanDto(
                        slug = "weekly-round-trip",
                        name = "Weekly Round Trip",
                        totalRides = 12,
                        pricePerRide = 75f,
                        totalPrice = 900f,
                        durationDays = 7,
                        isRoundTrip = true,
                        features = listOf(
                            "6 rides per shift (Morning + Evening)",
                            "Valid for 7 days",
                            "Save ₹60 vs one-way"
                        ),
                        savingsText = "Save ₹60",
                        subscriptionPreferenceDays = listOf(0, 1, 2, 3, 4),
                        minimumDaysPerWeek = 5
                    ),
                    SubscriptionPlanDto(
                        slug = "monthly-one-way",
                        name = "Monthly One Way",
                        totalRides = 22,
                        pricePerRide = 75f,
                        totalPrice = 1650f,
                        durationDays = 30,
                        isRoundTrip = false,
                        features = listOf(
                            "22 rides in one direction",
                            "Valid for 30 days",
                            "₹10 cheaper per ride vs weekly"
                        ),
                        savingsText = "Save ₹220 vs weekly",
                        subscriptionPreferenceDays = listOf(0, 1, 2, 3, 4),
                        minimumDaysPerWeek = 5
                    ),
                    SubscriptionPlanDto(
                        slug = "monthly-round-trip",
                        name = "Monthly Round Trip",
                        totalRides = 44,
                        pricePerRide = 65f,
                        totalPrice = 2860f,
                        durationDays = 30,
                        isRoundTrip = true,
                        isPopular = true,
                        features = listOf(
                            "22 rides per shift (Morning + Evening)",
                            "Valid for 30 days",
                            "Best value — ₹20 cheaper per ride"
                        ),
                        savingsText = "Best Value — Save ₹740",
                        subscriptionPreferenceDays = listOf(0, 1, 2, 3, 4),
                        minimumDaysPerWeek = 5
                    )
                )
            )
        )
    }
}
