package com.cityflo.subscription.presentation.viewmodel.passsetup

import com.cityflo.subscription.arch.BaseViewModel
import com.cityflo.subscription.data.dto.CalendarResponseDto
import com.cityflo.subscription.data.dto.StopInfoDto
import com.cityflo.subscription.domain.ICalendarRepository
import com.cityflo.subscription.domain.ISubscriptionRepository
import com.cityflo.subscription.presentation.analytics.AnalyticsService
import com.cityflo.subscription.presentation.analytics.SubscriptionAnalytics
import com.cityflo.subscription.presentation.mapper.PassSetupMapper
import com.cityflo.subscription.presentation.model.*
import com.cityflo.subscription.util.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch

/**
 * Thick ViewModel for Pass Setup, mirroring CreateSubscriptionPassVM patterns:
 * - Manages dual shift configuration
 * - Fetches calendar data when stops change
 * - Pre-selects dates from API response
 * - Validates round-trip shift compatibility
 */
class PassSetupViewModel(
    private val subscriptionRepository: ISubscriptionRepository,
    private val calendarRepository: ICalendarRepository,
    private val analyticsService: AnalyticsService
) : BaseViewModel<PassSetupUiState, PassSetupEvent, PassSetupEffect>(
    UiState.idle()
) {

    // Cache calendar responses per shift (mirrors CreateSubscriptionPassVM._subscriptionCalendarParameters)
    private val calendarCache = mutableMapOf<TimeOfDay, CalendarResponseDto>()
    private var walletBalance: Float = 0f

    override fun handleEvent(event: PassSetupEvent) {
        when (event) {
            is PassSetupEvent.FetchPrefillData -> fetchPrefillData(event.planSlug)
            is PassSetupEvent.SelectShiftTab -> selectShiftTab(event.timeOfDay)
            is PassSetupEvent.RequestPickupStopPicker -> requestStopPicker(event.timeOfDay, isPickup = true)
            is PassSetupEvent.RequestDropOffStopPicker -> requestStopPicker(event.timeOfDay, isPickup = false)
            is PassSetupEvent.SetPickupStop -> setStop(event.timeOfDay, event.stop, isPickup = true)
            is PassSetupEvent.SetDropOffStop -> setStop(event.timeOfDay, event.stop, isPickup = false)
            is PassSetupEvent.EditSchedule -> editSchedule(event.timeOfDay)
            is PassSetupEvent.OnScheduleConfirmed -> onScheduleConfirmed(event)
            PassSetupEvent.ProceedToCheckout -> proceedToCheckout()
            PassSetupEvent.ChangePlan -> {
                setEffect { PassSetupEffect.NavigateBack }
            }
        }
    }

    private fun fetchPrefillData(planSlug: String) {
        scope.launch {
            setState { UiState.loading(getOrNull()) }

            analyticsService.track(
                SubscriptionAnalytics.PassSetupStarted(
                    planSlug = planSlug,
                    isRoundTrip = planSlug.contains("round-trip")
                )
            )

            subscriptionRepository.getPrefillData(planSlug, null)
                .onSuccess { response ->
                    walletBalance = response.walletBalance
                    val model = PassSetupMapper.mapPrefillToSetupModel(response, planSlug)
                    setState { UiState.success(model) }

                    // Fetch calendar data for each shift that has stops
                    model.shifts.forEach { (timeOfDay, shift) ->
                        if (shift.hasStops) {
                            fetchCalendarData(timeOfDay, shift.pickupStop!!.id, shift.dropOffStop!!.id, planSlug)
                        }
                    }
                }
                .onFailure {
                    setState { UiState.failure(errorMessage = "Failed to load setup data") }
                    setEffect { PassSetupEffect.ShowSnackbar("Failed to load. Please try again.") }
                }
        }
    }

    private fun requestStopPicker(timeOfDay: TimeOfDay, isPickup: Boolean) {
        val data = currentState.getOrNull() ?: return
        val shift = data.shifts[timeOfDay] ?: return

        // Map TimeOfDay to API slug: MORNING = "1", EVENING = "2"
        val timeOfDaySlug = if (timeOfDay == TimeOfDay.MORNING) "1" else "2"

        scope.launch {
            subscriptionRepository.getAvailableStops(timeOfDaySlug, shift.routeSlotPk)
                .onSuccess { response ->
                    val stops = if (isPickup) response.pickupStops else response.dropoffStops
                    val uiStops = stops.mapNotNull { PassSetupMapper.mapStop(it) }
                    setEffect {
                        PassSetupEffect.OpenStopPicker(
                            timeOfDay = timeOfDay,
                            isPickup = isPickup,
                            availableStops = uiStops
                        )
                    }
                }
                .onFailure {
                    setEffect { PassSetupEffect.ShowSnackbar("Failed to load stops") }
                }
        }
    }

    private fun selectShiftTab(timeOfDay: TimeOfDay) {
        val data = currentState.getOrNull() ?: return

        analyticsService.track(SubscriptionAnalytics.ShiftTabChanged(timeOfDay.shiftName))

        setState {
            UiState.success(data.copy(activeShiftTab = timeOfDay))
        }
    }

    private fun setStop(timeOfDay: TimeOfDay, stop: StopUiModel, isPickup: Boolean) {
        val data = currentState.getOrNull() ?: return
        val shift = data.shifts[timeOfDay] ?: return

        analyticsService.track(
            SubscriptionAnalytics.StopSelected(
                shift = timeOfDay.shiftName,
                isPickup = isPickup,
                stopName = stop.name
            )
        )

        val updatedShift = if (isPickup) {
            shift.copy(pickupStop = stop, editMode = false)
        } else {
            shift.copy(dropOffStop = stop, editMode = false)
        }

        val updatedShifts = data.shifts.toMutableMap()
        updatedShifts[timeOfDay] = updatedShift

        val isProceedEnabled = ValidationEngine.canProceedToCheckout(updatedShifts, data.isRoundTrip)

        setState {
            UiState.success(
                data.copy(shifts = updatedShifts, isProceedEnabled = isProceedEnabled)
            )
        }

        // If both stops are now set, fetch calendar data
        if (updatedShift.hasStops) {
            fetchCalendarData(
                timeOfDay,
                updatedShift.pickupStop!!.id,
                updatedShift.dropOffStop!!.id,
                data.planSlug
            )
        }
    }

    private fun editSchedule(timeOfDay: TimeOfDay) {
        val data = currentState.getOrNull() ?: return
        val shift = data.shifts[timeOfDay] ?: return
        val cached = calendarCache[timeOfDay]

        analyticsService.track(SubscriptionAnalytics.CalendarOpened(timeOfDay.shiftName))

        if (cached != null) {
            setEffect {
                PassSetupEffect.LaunchCalendar(
                    timeOfDay = timeOfDay,
                    calendarData = cached,
                    totalRidesPerShift = data.totalRidesPerShift,
                    selectedWeekDays = shift.selectedWeekDays,
                    selectedDates = shift.selectedDates,
                    minimumDaysPerWeek = 5
                )
            }
        } else if (shift.hasStops) {
            // Fetch calendar first then open
            scope.launch {
                fetchCalendarData(timeOfDay, shift.pickupStop!!.id, shift.dropOffStop!!.id, data.planSlug)
                val calendar = calendarCache[timeOfDay]
                if (calendar != null) {
                    setEffect {
                        PassSetupEffect.LaunchCalendar(
                            timeOfDay = timeOfDay,
                            calendarData = calendar,
                            totalRidesPerShift = data.totalRidesPerShift,
                            selectedWeekDays = shift.selectedWeekDays,
                            selectedDates = shift.selectedDates,
                            minimumDaysPerWeek = 5
                        )
                    }
                }
            }
        } else {
            setEffect { PassSetupEffect.ShowSnackbar("Please select pickup and drop-off stops first") }
        }
    }

    /**
     * Handles confirmed dates from the calendar screen.
     * Mirrors CreateSubscriptionPassVM.OnUpdateSchedule handling.
     */
    private fun onScheduleConfirmed(event: PassSetupEvent.OnScheduleConfirmed) {
        val data = currentState.getOrNull() ?: return
        val shift = data.shifts[event.timeOfDay] ?: return

        val startDate = DateUtils.parseDate(event.selectedDates.first())
        val endDate = DateUtils.parseDate(event.selectedDates.last())
        val scheduleSummary = "${event.selectedDates.size} rides, ${DateUtils.formatDateRange(startDate, endDate)}"

        val updatedShift = shift.copy(
            selectedDates = event.selectedDates,
            selectedWeekDays = event.selectedWeekDays,
            scheduleSummary = scheduleSummary
        )

        val updatedShifts = data.shifts.toMutableMap()
        updatedShifts[event.timeOfDay] = updatedShift

        // For round-trip: validate and update other shift's schedule
        if (data.isRoundTrip) {
            val otherTimeOfDay = if (event.timeOfDay == TimeOfDay.MORNING) TimeOfDay.EVENING else TimeOfDay.MORNING
            val otherShift = updatedShifts[otherTimeOfDay]

            if (otherShift != null && otherShift.isConfigured) {
                val otherCalendar = calendarCache[otherTimeOfDay]
                if (otherCalendar != null) {
                    // Validate compatibility (mirrors updateOtherPassSchedules)
                    val compatible = CalendarEngine.validateOtherShiftCompatibility(
                        rawDates = otherCalendar.dates,
                        otherShiftWeekDays = otherShift.selectedWeekDays,
                        otherShiftTotalRides = data.totalRidesPerShift,
                        proposedWeekDays = event.selectedWeekDays
                    )

                    if (!compatible) {
                        setEffect {
                            PassSetupEffect.ShowSnackbar(
                                "Cannot apply these weekdays — ${otherTimeOfDay.shiftName} shift cannot fill required rides"
                            )
                        }
                        return
                    }

                    // Re-select dates for other shift with new weekdays
                    val otherDates = CalendarEngine.buildCalendarDates(
                        rawDates = otherCalendar.dates,
                        selectedWeekDays = event.selectedWeekDays,
                        totalRidesNeeded = data.totalRidesPerShift
                    )
                    val otherSelectedDates = CalendarEngine.getSelectedDates(otherDates)
                    if (otherSelectedDates.isNotEmpty()) {
                        val otherStart = DateUtils.parseDate(otherSelectedDates.first())
                        val otherEnd = DateUtils.parseDate(otherSelectedDates.last())
                        updatedShifts[otherTimeOfDay] = otherShift.copy(
                            selectedDates = otherSelectedDates,
                            selectedWeekDays = event.selectedWeekDays,
                            scheduleSummary = "${otherSelectedDates.size} rides, ${DateUtils.formatDateRange(otherStart, otherEnd)}"
                        )
                    }
                }
            }
        }

        val isProceedEnabled = ValidationEngine.canProceedToCheckout(updatedShifts, data.isRoundTrip)

        setState {
            UiState.success(
                data.copy(shifts = updatedShifts, isProceedEnabled = isProceedEnabled)
            )
        }
    }

    private fun proceedToCheckout() {
        val data = currentState.getOrNull() ?: return
        if (!data.isProceedEnabled) return

        setEffect {
            PassSetupEffect.NavigateToCheckout(
                passSetupData = data,
                walletBalance = walletBalance
            )
        }
    }

    private fun fetchCalendarData(
        timeOfDay: TimeOfDay,
        startStopInfoPk: Long,
        endStopInfoPk: Long,
        planSlug: String
    ) {
        scope.launch {
            calendarRepository.getCalendar(
                startStopInfoPk = startStopInfoPk,
                endStopInfoPk = endStopInfoPk,
                planSlug = planSlug
            ).onSuccess { response ->
                calendarCache[timeOfDay] = response

                // Pre-select dates (mirrors preSelectedCalendarDatesFromResponse)
                val data = currentState.getOrNull() ?: return@onSuccess
                val shift = data.shifts[timeOfDay] ?: return@onSuccess

                if (shift.selectedDates.isEmpty()) {
                    val dates = CalendarEngine.buildCalendarDates(
                        rawDates = response.dates,
                        selectedWeekDays = shift.selectedWeekDays,
                        totalRidesNeeded = data.totalRidesPerShift
                    )
                    val selectedDates = CalendarEngine.getSelectedDates(dates)
                    if (selectedDates.isNotEmpty()) {
                        val start = DateUtils.parseDate(selectedDates.first())
                        val end = DateUtils.parseDate(selectedDates.last())
                        val summary = "${selectedDates.size} rides, ${DateUtils.formatDateRange(start, end)}"

                        val updatedShifts = data.shifts.toMutableMap()
                        updatedShifts[timeOfDay] = shift.copy(
                            selectedDates = selectedDates,
                            scheduleSummary = summary
                        )
                        val isProceed = ValidationEngine.canProceedToCheckout(updatedShifts, data.isRoundTrip)
                        setState { UiState.success(data.copy(shifts = updatedShifts, isProceedEnabled = isProceed)) }
                    }
                }
            }
        }
    }
}
