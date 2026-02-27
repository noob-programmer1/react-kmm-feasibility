package com.cityflo.subscription.util

import com.cityflo.subscription.data.dto.CalendarDateDto
import com.cityflo.subscription.presentation.model.CalendarDateUiModel
import kotlinx.datetime.LocalDate

/**
 * Core calendar date selection algorithm.
 * This is the key business logic that gets shared across platforms.
 *
 * Mirrors the logic from CityFlo's SubscriptionCalendarVM:
 * - Pre-selects dates based on weekday preferences
 * - Recalculates when weekdays change
 * - Handles start date shifts
 * - Validates against maxValidStartDate
 */
object CalendarEngine {

    /**
     * Build the full calendar UI model from raw date data and selection preferences.
     *
     * Algorithm (from SubscriptionCalendarMapper.mapToUiModel):
     * 1. Walk through all dates from startDate forward
     * 2. For each date, check if it's available AND matches selected weekdays
     * 3. Mark it as selected until totalRidesNeeded is met
     * 4. First selected = isStartDate, last selected = isEndDate
     */
    fun buildCalendarDates(
        rawDates: List<CalendarDateDto>,
        selectedWeekDays: Set<Int>,
        totalRidesNeeded: Int,
        startDate: LocalDate? = null
    ): List<CalendarDateUiModel> {
        val effectiveStart = startDate ?: findFirstAvailableDate(rawDates, selectedWeekDays)
        ?: return rawDates.map { it.toUnavailableUiModel() }

        var ridesSelected = 0
        var firstSelectedDate: String? = null
        var lastSelectedDate: String? = null

        val models = rawDates.map { dto ->
            val date = DateUtils.parseDate(dto.date)
            val dayIndex = DateUtils.dayOfWeekIndex(date)
            val isWeekend = DateUtils.isWeekend(date)
            val isHoliday = dto.holidayRemark != null

            val isAfterStart = date >= effectiveStart
            val matchesWeekDay = dayIndex in selectedWeekDays
            val shouldSelect = isAfterStart &&
                    dto.isRideAvailable &&
                    matchesWeekDay &&
                    ridesSelected < totalRidesNeeded

            if (shouldSelect) {
                ridesSelected++
                if (firstSelectedDate == null) firstSelectedDate = dto.date
                lastSelectedDate = dto.date
            }

            CalendarDateUiModel(
                date = dto.date,
                dayOfMonth = date.dayOfMonth.toString(),
                monthYear = "${date.month.name.take(3)} ${date.year}",
                isHoliday = isHoliday,
                isWeekend = isWeekend,
                isSelected = shouldSelect,
                isStartDate = false, // Set below
                isEndDate = false,   // Set below
                isAvailable = dto.isRideAvailable,
                holidayRemark = dto.holidayRemark
            )
        }

        // Mark start and end dates
        return models.map { model ->
            model.copy(
                isStartDate = model.date == firstSelectedDate,
                isEndDate = model.date == lastSelectedDate
            )
        }
    }

    /**
     * Recalculate calendar when the start date changes.
     * Keeps the same weekday preferences but shifts the selection window.
     */
    fun recalculateFromStartDate(
        rawDates: List<CalendarDateDto>,
        selectedWeekDays: Set<Int>,
        totalRidesNeeded: Int,
        newStartDate: LocalDate,
        maxValidStartDate: LocalDate
    ): CalendarRecalcResult {
        // Validate start date
        if (newStartDate > maxValidStartDate) {
            return CalendarRecalcResult.Error("Start date cannot be after ${DateUtils.formatDisplayDate(maxValidStartDate)}")
        }

        val dates = buildCalendarDates(rawDates, selectedWeekDays, totalRidesNeeded, newStartDate)
        val selectedCount = dates.count { it.isSelected }

        if (selectedCount < totalRidesNeeded) {
            return CalendarRecalcResult.Error("Not enough available dates to fill $totalRidesNeeded rides from selected start")
        }

        return CalendarRecalcResult.Success(dates)
    }

    /**
     * Recalculate when weekday preferences change.
     * Keeps the same start date but changes which days are selected.
     */
    fun recalculateForWeekDays(
        rawDates: List<CalendarDateDto>,
        newSelectedWeekDays: Set<Int>,
        totalRidesNeeded: Int,
        currentStartDate: LocalDate?,
        maxValidStartDate: LocalDate
    ): CalendarRecalcResult {
        if (newSelectedWeekDays.isEmpty()) {
            return CalendarRecalcResult.Error("At least one weekday must be selected")
        }

        // Try with current start date first
        val startDate = currentStartDate ?: findFirstAvailableDate(rawDates, newSelectedWeekDays)
        ?: return CalendarRecalcResult.Error("No available dates for selected weekdays")

        var dates = buildCalendarDates(rawDates, newSelectedWeekDays, totalRidesNeeded, startDate)
        var selectedCount = dates.count { it.isSelected }

        // If not enough dates, try shifting start date earlier
        if (selectedCount < totalRidesNeeded && startDate > DateUtils.today()) {
            val earlierStart = findFirstAvailableDate(rawDates, newSelectedWeekDays)
            if (earlierStart != null && earlierStart <= maxValidStartDate) {
                dates = buildCalendarDates(rawDates, newSelectedWeekDays, totalRidesNeeded, earlierStart)
                selectedCount = dates.count { it.isSelected }
            }
        }

        if (selectedCount < totalRidesNeeded) {
            return CalendarRecalcResult.Error("Cannot fill $totalRidesNeeded rides with selected weekdays")
        }

        return CalendarRecalcResult.Success(dates)
    }

    /**
     * Validate that a round-trip partner shift can also fill its required rides
     * with the given weekday selection.
     */
    fun validateOtherShiftCompatibility(
        rawDates: List<CalendarDateDto>,
        otherShiftWeekDays: Set<Int>,
        otherShiftTotalRides: Int,
        proposedWeekDays: Set<Int>
    ): Boolean {
        // The other shift needs to be able to fill rides with the proposed weekdays
        val dates = buildCalendarDates(rawDates, proposedWeekDays, otherShiftTotalRides)
        return dates.count { it.isSelected } >= otherShiftTotalRides
    }

    /**
     * Extract selected dates from calendar models.
     */
    fun getSelectedDates(calendarDates: List<CalendarDateUiModel>): List<String> {
        return calendarDates.filter { it.isSelected }.map { it.date }
    }

    /**
     * Find the start and end display text from selected dates.
     */
    fun getDateRangeText(calendarDates: List<CalendarDateUiModel>): Pair<String?, String?> {
        val selected = calendarDates.filter { it.isSelected }
        val start = selected.firstOrNull()?.let { DateUtils.formatDisplayDate(DateUtils.parseDate(it.date)) }
        val end = selected.lastOrNull()?.let { DateUtils.formatDisplayDate(DateUtils.parseDate(it.date)) }
        return start to end
    }

    private fun findFirstAvailableDate(
        rawDates: List<CalendarDateDto>,
        selectedWeekDays: Set<Int>
    ): LocalDate? {
        return rawDates.firstOrNull { dto ->
            val date = DateUtils.parseDate(dto.date)
            dto.isRideAvailable && DateUtils.dayOfWeekIndex(date) in selectedWeekDays
        }?.let { DateUtils.parseDate(it.date) }
    }

    private fun CalendarDateDto.toUnavailableUiModel(): CalendarDateUiModel {
        val date = DateUtils.parseDate(this.date)
        return CalendarDateUiModel(
            date = this.date,
            dayOfMonth = date.dayOfMonth.toString(),
            monthYear = "${date.month.name.take(3)} ${date.year}",
            isHoliday = this.holidayRemark != null,
            isWeekend = DateUtils.isWeekend(date),
            isSelected = false,
            isStartDate = false,
            isEndDate = false,
            isAvailable = this.isRideAvailable,
            holidayRemark = this.holidayRemark
        )
    }
}

sealed class CalendarRecalcResult {
    data class Success(val dates: List<CalendarDateUiModel>) : CalendarRecalcResult()
    data class Error(val message: String) : CalendarRecalcResult()
}
