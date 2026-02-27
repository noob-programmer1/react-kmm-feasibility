package com.cityflo.subscription.domain

import com.cityflo.subscription.data.dto.*
import com.cityflo.subscription.util.ApiResponse

/**
 * Repository interfaces following the CityFlo pattern.
 * Each returns ApiResponse<T> (NetworkResponse<T, ApiError>).
 */

interface IPlanRepository {
    suspend fun getPlans(): ApiResponse<PlansResponse>
}

interface ICalendarRepository {
    suspend fun getCalendar(
        startStopInfoPk: Long?,
        endStopInfoPk: Long?,
        planSlug: String,
        startDate: String? = null
    ): ApiResponse<CalendarResponseDto>
}

interface ISubscriptionRepository {
    suspend fun getPrefillData(
        planSlug: String,
        timeOfDaySlug: String?,
        startStopInfoPk: Long? = null,
        endStopInfoPk: Long? = null
    ): ApiResponse<PrefillResponseDto>

    suspend fun getAvailableStops(
        timeOfDay: String,
        routeSlotPk: Long? = null
    ): ApiResponse<AvailableStopsResponse>

    suspend fun placeSubscription(
        request: PlaceSubscriptionRequest
    ): ApiResponse<PlaceSubscriptionResponse>
}
