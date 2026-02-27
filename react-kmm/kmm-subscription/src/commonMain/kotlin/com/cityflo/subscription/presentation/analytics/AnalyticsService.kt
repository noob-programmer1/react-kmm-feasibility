package com.cityflo.subscription.presentation.analytics

/**
 * Mirrors the CityFlo AnalyticsService/AnalyticsEvent pattern.
 */
interface AnalyticsEvent {
    val name: String
    val payload: Map<String, Any?>?
        get() = null
}

enum class AnalyticsType {
    CleverTap,
    RudderStack,
    Console
}

interface AnalyticsService {
    fun track(event: AnalyticsEvent, type: AnalyticsType = AnalyticsType.Console)
}

fun AnalyticsService.track(
    event: AnalyticsEvent,
    types: Set<AnalyticsType> = setOf(AnalyticsType.Console)
) {
    types.forEach { track(event, it) }
}

/**
 * Console-based analytics service for POC. Logs events to console.
 */
class ConsoleAnalyticsService : AnalyticsService {
    override fun track(event: AnalyticsEvent, type: AnalyticsType) {
        println("[Analytics:$type] ${event.name} ${event.payload ?: ""}")
    }
}
