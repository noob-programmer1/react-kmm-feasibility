package com.cityflo.subscription.presentation.viewmodel.calendar

import com.cityflo.subscription.arch.BaseViewModel
import com.cityflo.subscription.data.dto.CalendarDateDto
import com.cityflo.subscription.presentation.analytics.AnalyticsService
import com.cityflo.subscription.presentation.analytics.SubscriptionAnalytics
import com.cityflo.subscription.presentation.model.*
import com.cityflo.subscription.util.*
import kotlinx.serialization.json.Json

/**
 * Calendar ViewModel — the most algorithmically complex VM.
 * Mirrors CityFlo's SubscriptionCalendarVM with its date selection algorithm.
 *
 * Core logic:
 * - Weekday toggle → recalculate all selected dates
 * - Date click → if holiday: show remarks; if weekday not selected: toggle it; else: new start date
 * - Selection walks forward from start, picking matching available dates until rides met
 */
class CalendarViewModel(
    private val analyticsService: AnalyticsService
) : BaseViewModel<CalendarUiState, CalendarEvent, CalendarEffect>(
    UiState.idle()
) {

    private var rawDates: List<CalendarDateDto> = emptyList()
    private var maxValidStartDate: String = ""
    private var minimumDaysPerWeek: Int = 5
    private var totalRidesNeeded: Int = 0

    override fun handleEvent(event: CalendarEvent) {
        when (event) {
            is CalendarEvent.Initialize -> initialize(event)
            is CalendarEvent.ToggleWeekDay -> toggleWeekDay(event.dayIndex)
            is CalendarEvent.SelectDate -> selectDate(event.date)
            CalendarEvent.ConfirmDates -> confirmDates()
            CalendarEvent.ToggleHolidayRemarks -> toggleHolidayRemarks()
        }
    }

    private fun initialize(event: CalendarEvent.Initialize) {
        // Parse the raw calendar dates
        rawDates = try {
            Json.decodeFromString<List<CalendarDateDto>>(event.rawDatesJson)
        } catch (e: Exception) {
            emptyList()
        }

        maxValidStartDate = event.maxValidStartDate
        minimumDaysPerWeek = event.minimumDaysPerWeek
        totalRidesNeeded = event.totalRidesNeeded

        val selectedWeekDays = event.selectedWeekDays.ifEmpty { setOf(0, 1, 2, 3, 4) }

        // Build calendar with pre-selected dates
        val calendarDates = if (event.selectedDates.isNotEmpty()) {
            val startDate = DateUtils.parseDate(event.selectedDates.first())
            CalendarEngine.buildCalendarDates(rawDates, selectedWeekDays, totalRidesNeeded, startDate)
        } else {
            CalendarEngine.buildCalendarDates(rawDates, selectedWeekDays, totalRidesNeeded)
        }

        updateCalendarState(calendarDates, selectedWeekDays)
    }

    /**
     * Toggle weekday selection.
     * Mirrors SubscriptionCalendarVM.OnWeekDayToggled logic.
     */
    private fun toggleWeekDay(dayIndex: Int) {
        val data = currentState.getOrNull() ?: return
        val dayModel = data.selectedWeekDays.getOrNull(dayIndex) ?: return

        // Only Mon-Fri can be toggled
        if (!dayModel.enabled) return

        val currentSelected = data.selectedWeekDays
            .filter { it.selected }
            .map { it.index }
            .toMutableSet()

        val isCurrentlySelected = dayIndex in currentSelected

        // Validate minimum days
        if (isCurrentlySelected && currentSelected.size <= minimumDaysPerWeek) {
            setState {
                UiState.success(data.copy(
                    weekSelectionError = "Minimum $minimumDaysPerWeek weekdays must be selected"
                ))
            }
            return
        }

        analyticsService.track(
            SubscriptionAnalytics.WeekDayToggled(
                dayIndex = dayIndex,
                dayLabel = dayModel.label,
                isSelected = !isCurrentlySelected
            )
        )

        if (isCurrentlySelected) {
            currentSelected.remove(dayIndex)
        } else {
            currentSelected.add(dayIndex)
        }

        // Recalculate dates with new weekday selection
        val currentStartDate = data.calendarDates.values
            .find { it.isStartDate }
            ?.let { DateUtils.parseDate(it.date) }

        val result = CalendarEngine.recalculateForWeekDays(
            rawDates = rawDates,
            newSelectedWeekDays = currentSelected,
            totalRidesNeeded = totalRidesNeeded,
            currentStartDate = currentStartDate,
            maxValidStartDate = DateUtils.parseDate(maxValidStartDate)
        )

        when (result) {
            is CalendarRecalcResult.Success -> {
                updateCalendarState(result.dates, currentSelected)
            }
            is CalendarRecalcResult.Error -> {
                setState {
                    UiState.success(data.copy(weekSelectionError = result.message))
                }
            }
        }
    }

    /**
     * Handle date cell click.
     * Mirrors SubscriptionCalendarVM.onDayClicked logic.
     */
    private fun selectDate(date: String) {
        val data = currentState.getOrNull() ?: return
        val dateModel = data.calendarDates[date] ?: return

        analyticsService.track(
            SubscriptionAnalytics.CalendarDateClicked(
                date = date,
                isHoliday = dateModel.isHoliday
            )
        )

        // If holiday/weekend: expand remarks
        if (dateModel.isHoliday || dateModel.isWeekend) {
            setState { UiState.success(data.copy(isHolidayRemarksExpanded = true)) }
            return
        }

        // If not available, do nothing
        if (!dateModel.isAvailable) return

        val clickedDate = DateUtils.parseDate(date)
        val clickedDayIndex = DateUtils.dayOfWeekIndex(clickedDate)

        val selectedWeekDayIndices = data.selectedWeekDays
            .filter { it.selected }
            .map { it.index }
            .toSet()

        // If this weekday isn't selected, toggle it
        if (clickedDayIndex !in selectedWeekDayIndices) {
            toggleWeekDay(clickedDayIndex)
            return
        }

        // Set this as the new start date and recalculate
        val result = CalendarEngine.recalculateFromStartDate(
            rawDates = rawDates,
            selectedWeekDays = selectedWeekDayIndices,
            totalRidesNeeded = totalRidesNeeded,
            newStartDate = clickedDate,
            maxValidStartDate = DateUtils.parseDate(maxValidStartDate)
        )

        when (result) {
            is CalendarRecalcResult.Success -> {
                updateCalendarState(result.dates, selectedWeekDayIndices)
            }
            is CalendarRecalcResult.Error -> {
                setEffect { CalendarEffect.ShowError(result.message) }
            }
        }
    }

    private fun confirmDates() {
        val data = currentState.getOrNull() ?: return

        if (!data.isConfirmEnabled) {
            setEffect { CalendarEffect.ShowError("Please select all required dates") }
            return
        }

        val selectedDates = data.calendarDates.values
            .filter { it.isSelected }
            .map { it.date }

        val selectedWeekDays = data.selectedWeekDays
            .filter { it.selected }
            .map { it.index }
            .toSet()

        analyticsService.track(
            SubscriptionAnalytics.DatesConfirmed(
                numberOfWeekDays = selectedWeekDays.size,
                selectedWeekDays = selectedWeekDays,
                totalRides = selectedDates.size
            )
        )

        setEffect {
            CalendarEffect.NavigateBackWithDates(
                selectedDates = selectedDates,
                selectedWeekDays = selectedWeekDays
            )
        }
    }

    private fun toggleHolidayRemarks() {
        val data = currentState.getOrNull() ?: return
        setState {
            UiState.success(data.copy(isHolidayRemarksExpanded = !data.isHolidayRemarksExpanded))
        }
    }

    private fun updateCalendarState(
        calendarDates: List<CalendarDateUiModel>,
        selectedWeekDays: Set<Int>
    ) {
        val dateMap = calendarDates.associateBy { it.date }
        val selectedCount = calendarDates.count { it.isSelected }
        val (startText, endText) = CalendarEngine.getDateRangeText(calendarDates)
        val weekDayModels = DayOfWeekUiModel.createWeekDays(selectedWeekDays)

        val holidayRemarks = rawDates
            .filter { it.holidayRemark != null }
            .map { "${it.date}: ${it.holidayRemark}" }

        val durationText = if (startText != null && endText != null) {
            "$selectedCount rides · $startText to $endText"
        } else {
            "$selectedCount / $totalRidesNeeded rides selected"
        }

        setState {
            UiState.success(
                CalendarUiModel(
                    calendarDates = dateMap,
                    selectedWeekDays = weekDayModels,
                    totalRidesNeeded = totalRidesNeeded,
                    selectedRideCount = selectedCount,
                    startDateText = startText,
                    endDateText = endText,
                    planDurationText = durationText,
                    weekSelectionError = null,
                    holidayRemarks = holidayRemarks,
                    isHolidayRemarksExpanded = false,
                    maxValidStartDate = maxValidStartDate,
                    minimumDaysPerWeek = minimumDaysPerWeek
                )
            )
        }
    }
}
