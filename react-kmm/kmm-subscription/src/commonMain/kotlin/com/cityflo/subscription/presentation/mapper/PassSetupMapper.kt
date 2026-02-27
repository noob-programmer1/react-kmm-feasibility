package com.cityflo.subscription.presentation.mapper

import com.cityflo.subscription.data.dto.PrefillResponseDto
import com.cityflo.subscription.data.dto.ShiftPrefillDto
import com.cityflo.subscription.data.dto.StopInfoDto
import com.cityflo.subscription.presentation.model.*
import com.cityflo.subscription.util.DateUtils

object PassSetupMapper {

    fun mapPrefillToSetupModel(
        dto: PrefillResponseDto,
        planSlug: String
    ): PassSetupUiModel {
        val plan = dto.plan
        val isRoundTrip = plan.isRoundTrip
        val ridesPerShift = if (isRoundTrip) plan.totalRides / 2 else plan.totalRides

        val shifts = mutableMapOf<TimeOfDay, ShiftConfigUiModel>()

        if (dto.morningData != null || !isRoundTrip) {
            shifts[TimeOfDay.MORNING] = mapShiftPrefill(
                dto.morningData,
                TimeOfDay.MORNING,
                plan.subscriptionPreferenceDays?.toSet() ?: setOf(0, 1, 2, 3, 4)
            )
        }

        if (isRoundTrip && dto.eveningData != null) {
            shifts[TimeOfDay.EVENING] = mapShiftPrefill(
                dto.eveningData,
                TimeOfDay.EVENING,
                plan.subscriptionPreferenceDays?.toSet() ?: setOf(0, 1, 2, 3, 4)
            )
        }

        // For one-way, if no morning data exists, create empty morning shift
        if (shifts.isEmpty()) {
            shifts[TimeOfDay.MORNING] = createEmptyShift(TimeOfDay.MORNING)
        }

        return PassSetupUiModel(
            planName = plan.name,
            planSlug = planSlug,
            totalRidesPerShift = ridesPerShift,
            shifts = shifts,
            activeShiftTab = TimeOfDay.MORNING,
            isRoundTrip = isRoundTrip,
            isProceedEnabled = false
        )
    }

    private fun mapShiftPrefill(
        dto: ShiftPrefillDto?,
        timeOfDay: TimeOfDay,
        defaultWeekDays: Set<Int>
    ): ShiftConfigUiModel {
        if (dto == null) return createEmptyShift(timeOfDay)

        val pickupStop = dto.startStopInfo?.let { mapStop(it) }
        val dropOffStop = dto.endStopInfo?.let { mapStop(it) }
        val hasStops = pickupStop != null && dropOffStop != null

        val selectedDates = dto.selectedDates ?: emptyList()
        val scheduleSummary = if (selectedDates.isNotEmpty()) {
            val start = DateUtils.parseDate(selectedDates.first())
            val end = DateUtils.parseDate(selectedDates.last())
            "${selectedDates.size} rides, ${DateUtils.formatDateRange(start, end)}"
        } else null

        return ShiftConfigUiModel(
            timeOfDay = timeOfDay,
            pickupStop = pickupStop,
            dropOffStop = dropOffStop,
            scheduleSummary = scheduleSummary,
            selectedDates = selectedDates,
            selectedWeekDays = defaultWeekDays,
            editMode = !hasStops,
            routeSlotPk = dto.routeSlotPk
        )
    }

    private fun createEmptyShift(timeOfDay: TimeOfDay): ShiftConfigUiModel {
        return ShiftConfigUiModel(
            timeOfDay = timeOfDay,
            pickupStop = null,
            dropOffStop = null,
            scheduleSummary = null,
            selectedDates = emptyList(),
            selectedWeekDays = setOf(0, 1, 2, 3, 4),
            editMode = true,
            routeSlotPk = null
        )
    }

    fun mapStop(dto: StopInfoDto): StopUiModel? {
        if (dto.departureTime == null) return null
        return StopUiModel(
            id = dto.id,
            name = dto.name,
            time = dto.departureTime,
            lat = dto.lat,
            lng = dto.lng
        )
    }

    fun mapToShiftSummary(shift: ShiftConfigUiModel): ShiftSummaryUiModel? {
        if (!shift.isConfigured) return null
        val dates = shift.selectedDates
        val start = DateUtils.parseDate(dates.first())
        val end = DateUtils.parseDate(dates.last())

        return ShiftSummaryUiModel(
            timeOfDay = shift.timeOfDay,
            pickupStopName = shift.pickupStop!!.name,
            dropOffStopName = shift.dropOffStop!!.name,
            pickupTime = shift.pickupStop.time,
            ridesCount = dates.size,
            dateRange = DateUtils.formatDateRange(start, end)
        )
    }
}
