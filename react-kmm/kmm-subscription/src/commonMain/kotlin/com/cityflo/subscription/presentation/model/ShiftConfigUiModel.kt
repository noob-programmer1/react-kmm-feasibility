package com.cityflo.subscription.presentation.model

/**
 * Configuration state for a single shift (Morning or Evening).
 * Mirrors CityFlo CreateSubscriptionPassUiModel.
 */
data class ShiftConfigUiModel(
    val timeOfDay: TimeOfDay,
    val pickupStop: StopUiModel?,
    val dropOffStop: StopUiModel?,
    val scheduleSummary: String?,        // "22 rides, 05 Jan to 02 Feb"
    val selectedDates: List<String>,     // "dd-MM-yyyy" format
    val selectedWeekDays: Set<Int>,      // 0=Mon, 1=Tue, ..., 4=Fri
    val editMode: Boolean,               // true = stops not yet configured
    val routeSlotPk: Long?
) {
    val isConfigured: Boolean = pickupStop != null && dropOffStop != null && selectedDates.isNotEmpty()
    val hasStops: Boolean = pickupStop != null && dropOffStop != null
    val routeText: String? = if (hasStops) "${pickupStop!!.name} → ${dropOffStop!!.name}" else null
}

data class PassSetupUiModel(
    val planName: String,
    val planSlug: String,
    val totalRidesPerShift: Int,
    val shifts: Map<TimeOfDay, ShiftConfigUiModel>,
    val activeShiftTab: TimeOfDay,
    val isRoundTrip: Boolean,
    val isProceedEnabled: Boolean
) {
    val activeShift: ShiftConfigUiModel?
        get() = shifts[activeShiftTab]

    val allShiftsConfigured: Boolean
        get() = shifts.values.all { it.isConfigured }
}
