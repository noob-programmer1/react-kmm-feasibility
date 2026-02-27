package com.cityflo.subscription.presentation.model

/**
 * UI model for a single date cell in the calendar grid.
 * Mirrors CityFlo CalendarDateUiModel.
 */
data class CalendarDateUiModel(
    val date: String,              // "dd-MM-yyyy"
    val dayOfMonth: String,        // "1", "15", etc.
    val monthYear: String,         // "MMM yyyy" for section headers
    val isHoliday: Boolean,
    val isWeekend: Boolean,
    val isSelected: Boolean,
    val isStartDate: Boolean,
    val isEndDate: Boolean,
    val isAvailable: Boolean,      // Ride available on this date
    val holidayRemark: String?
) {
    val isClickable: Boolean = isAvailable && !isWeekend
    val isDisabled: Boolean = !isAvailable || isWeekend || isHoliday
}

data class CalendarUiModel(
    val calendarDates: Map<String, CalendarDateUiModel>,  // "dd-MM-yyyy" → model
    val selectedWeekDays: List<DayOfWeekUiModel>,
    val totalRidesNeeded: Int,
    val selectedRideCount: Int,
    val startDateText: String?,
    val endDateText: String?,
    val planDurationText: String,
    val weekSelectionError: String?,
    val holidayRemarks: List<String>,
    val isHolidayRemarksExpanded: Boolean,
    val maxValidStartDate: String,
    val minimumDaysPerWeek: Int
) {
    val isConfirmEnabled: Boolean = selectedRideCount == totalRidesNeeded && weekSelectionError == null
    val ridesSelectedText: String = "$selectedRideCount / $totalRidesNeeded rides selected"
}
