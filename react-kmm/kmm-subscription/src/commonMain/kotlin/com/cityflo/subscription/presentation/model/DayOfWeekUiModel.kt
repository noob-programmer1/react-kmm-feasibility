package com.cityflo.subscription.presentation.model

/**
 * Represents a day of the week for weekday selection UI.
 * Mirrors CityFlo DayOfWeekUiModel pattern.
 *
 * @param index 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
 * @param label Display label ("M", "T", "W", "Th", "F", "S", "Su")
 * @param enabled Whether the day can be toggled (Sat/Sun are disabled)
 * @param selected Whether the day is currently selected
 */
data class DayOfWeekUiModel(
    val index: Int,
    val label: String,
    val enabled: Boolean,
    val selected: Boolean
) {
    companion object {
        val WEEKDAY_LABELS = listOf("M", "T", "W", "Th", "F", "S", "Su")

        fun createWeekDays(selectedIndices: Set<Int> = setOf(0, 1, 2, 3, 4)): List<DayOfWeekUiModel> {
            return WEEKDAY_LABELS.mapIndexed { index, label ->
                DayOfWeekUiModel(
                    index = index,
                    label = label,
                    enabled = index < 5, // Only Mon-Fri are toggleable
                    selected = index in selectedIndices
                )
            }
        }
    }
}
