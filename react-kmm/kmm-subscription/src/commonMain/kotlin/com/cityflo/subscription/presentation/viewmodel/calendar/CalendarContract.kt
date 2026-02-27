package com.cityflo.subscription.presentation.viewmodel.calendar

import com.cityflo.subscription.arch.UIEffect
import com.cityflo.subscription.arch.UIEvent
import com.cityflo.subscription.presentation.model.CalendarUiModel
import com.cityflo.subscription.util.UiState

typealias CalendarUiState = UiState<CalendarUiModel>

sealed class CalendarEvent : UIEvent {
    data class Initialize(
        val rawDatesJson: String,   // Serialized CalendarResponseDto dates
        val totalRidesNeeded: Int,
        val selectedWeekDays: Set<Int>,
        val selectedDates: List<String>,
        val maxValidStartDate: String,
        val minimumDaysPerWeek: Int
    ) : CalendarEvent()

    data class ToggleWeekDay(val dayIndex: Int) : CalendarEvent()
    data class SelectDate(val date: String) : CalendarEvent()
    data object ConfirmDates : CalendarEvent()
    data object ToggleHolidayRemarks : CalendarEvent()
}

sealed class CalendarEffect : UIEffect {
    data class NavigateBackWithDates(
        val selectedDates: List<String>,
        val selectedWeekDays: Set<Int>
    ) : CalendarEffect()
    data class ShowError(val message: String) : CalendarEffect()
}
