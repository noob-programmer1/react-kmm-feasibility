package com.cityflo.subscription.util

import com.cityflo.subscription.presentation.model.PaymentMethod
import com.cityflo.subscription.presentation.model.ShiftConfigUiModel
import com.cityflo.subscription.presentation.model.TimeOfDay

/**
 * Composite validation rules for the subscription flow.
 * Centralizes all validation logic for sharing across platforms.
 */
object ValidationEngine {

    /**
     * Validate that a shift is fully configured.
     */
    fun isShiftConfigured(shift: ShiftConfigUiModel): Boolean {
        return shift.pickupStop != null &&
                shift.dropOffStop != null &&
                shift.selectedDates.isNotEmpty()
    }

    /**
     * Validate all shifts are configured for proceeding to checkout.
     * For round-trip: both morning and evening must be configured.
     * For one-way: the single shift must be configured.
     */
    fun canProceedToCheckout(
        shifts: Map<TimeOfDay, ShiftConfigUiModel>,
        isRoundTrip: Boolean
    ): Boolean {
        if (isRoundTrip) {
            val morning = shifts[TimeOfDay.MORNING] ?: return false
            val evening = shifts[TimeOfDay.EVENING] ?: return false
            return isShiftConfigured(morning) && isShiftConfigured(evening)
        } else {
            return shifts.values.any { isShiftConfigured(it) }
        }
    }

    /**
     * Validate checkout can be placed.
     */
    fun canPlaceOrder(
        paymentMethod: PaymentMethod?,
        termsAccepted: Boolean,
        isProcessing: Boolean
    ): Boolean {
        return paymentMethod != null && termsAccepted && !isProcessing
    }

    /**
     * Validate weekday selection meets minimum requirement.
     */
    fun validateWeekDaySelection(
        selectedWeekDays: Set<Int>,
        minimumDaysPerWeek: Int
    ): String? {
        if (selectedWeekDays.size < minimumDaysPerWeek) {
            return "Minimum $minimumDaysPerWeek weekdays must be selected"
        }
        return null
    }

    /**
     * Validate that required number of rides are selected.
     */
    fun validateRideCount(
        selectedCount: Int,
        requiredCount: Int
    ): String? {
        if (selectedCount != requiredCount) {
            return "Expected $requiredCount rides, but $selectedCount selected"
        }
        return null
    }
}
