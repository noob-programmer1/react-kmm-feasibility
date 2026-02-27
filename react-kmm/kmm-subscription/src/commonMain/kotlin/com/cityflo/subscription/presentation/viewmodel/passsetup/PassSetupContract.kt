package com.cityflo.subscription.presentation.viewmodel.passsetup

import com.cityflo.subscription.arch.UIEffect
import com.cityflo.subscription.arch.UIEvent
import com.cityflo.subscription.data.dto.CalendarResponseDto
import com.cityflo.subscription.presentation.model.*
import com.cityflo.subscription.util.UiState

typealias PassSetupUiState = UiState<PassSetupUiModel>

sealed class PassSetupEvent : UIEvent {
    data class FetchPrefillData(val planSlug: String) : PassSetupEvent()
    data class SelectShiftTab(val timeOfDay: TimeOfDay) : PassSetupEvent()
    data class RequestPickupStopPicker(val timeOfDay: TimeOfDay) : PassSetupEvent()
    data class RequestDropOffStopPicker(val timeOfDay: TimeOfDay) : PassSetupEvent()
    data class SetPickupStop(val timeOfDay: TimeOfDay, val stop: StopUiModel) : PassSetupEvent()
    data class SetDropOffStop(val timeOfDay: TimeOfDay, val stop: StopUiModel) : PassSetupEvent()
    data class EditSchedule(val timeOfDay: TimeOfDay) : PassSetupEvent()
    data class OnScheduleConfirmed(
        val timeOfDay: TimeOfDay,
        val selectedDates: List<String>,
        val selectedWeekDays: Set<Int>
    ) : PassSetupEvent()
    data object ProceedToCheckout : PassSetupEvent()
    data object ChangePlan : PassSetupEvent()
}

sealed class PassSetupEffect : UIEffect {
    data class OpenStopPicker(
        val timeOfDay: TimeOfDay,
        val isPickup: Boolean,
        val availableStops: List<StopUiModel>
    ) : PassSetupEffect()

    data class LaunchCalendar(
        val timeOfDay: TimeOfDay,
        val calendarData: CalendarResponseDto,
        val totalRidesPerShift: Int,
        val selectedWeekDays: Set<Int>,
        val selectedDates: List<String>,
        val minimumDaysPerWeek: Int
    ) : PassSetupEffect()

    data class NavigateToCheckout(
        val passSetupData: PassSetupUiModel,
        val walletBalance: Float
    ) : PassSetupEffect()

    data object NavigateBack : PassSetupEffect()
    data class ShowSnackbar(val message: String) : PassSetupEffect()
}
