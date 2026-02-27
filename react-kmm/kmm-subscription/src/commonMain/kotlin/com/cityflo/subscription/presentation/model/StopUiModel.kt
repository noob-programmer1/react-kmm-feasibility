package com.cityflo.subscription.presentation.model

/**
 * Represents a bus stop for pickup/dropoff selection.
 * Mirrors CityFlo SubscriptionPassStopUiModel.
 */
data class StopUiModel(
    val id: Long,
    val name: String,
    val time: String,          // "HH:mm" format
    val lat: Double,
    val lng: Double
) {
    val displayText: String = "$name · $time"
}
