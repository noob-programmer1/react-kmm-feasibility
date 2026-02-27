package com.cityflo.subscription.presentation.model

/**
 * Represents time-of-day shifts for subscription passes.
 * Mirrors the CityFlo TimeOfDay enum.
 */
enum class TimeOfDay(val slug: String, val shiftName: String) {
    MORNING("1", "Morning"),
    EVENING("2", "Evening")
}
