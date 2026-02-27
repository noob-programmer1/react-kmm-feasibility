package com.cityflo.subscription.util

import kotlinx.datetime.*

/**
 * Date utility functions for the subscription module.
 * Uses kotlinx-datetime for multiplatform date handling.
 */
object DateUtils {

    private const val DATE_FORMAT = "dd-MM-yyyy"

    /**
     * Parse a date string in "dd-MM-yyyy" format to LocalDate.
     */
    fun parseDate(dateString: String): LocalDate {
        val parts = dateString.split("-")
        require(parts.size == 3) { "Invalid date format: $dateString, expected dd-MM-yyyy" }
        val day = parts[0].toInt()
        val month = parts[1].toInt()
        val year = parts[2].toInt()
        return LocalDate(year, month, day)
    }

    /**
     * Format a LocalDate to "dd-MM-yyyy" string.
     */
    fun formatDate(date: LocalDate): String {
        val day = date.dayOfMonth.toString().padStart(2, '0')
        val month = date.monthNumber.toString().padStart(2, '0')
        return "$day-$month-${date.year}"
    }

    /**
     * Format a LocalDate to display format "dd MMM" (e.g., "05 Jan").
     */
    fun formatDisplayDate(date: LocalDate): String {
        val day = date.dayOfMonth.toString().padStart(2, '0')
        val month = date.month.name.take(3).lowercase()
            .replaceFirstChar { it.uppercase() }
        return "$day $month"
    }

    /**
     * Format a date range to display string "dd MMM to dd MMM".
     */
    fun formatDateRange(startDate: LocalDate, endDate: LocalDate): String {
        return "${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}"
    }

    /**
     * Get today's date.
     */
    fun today(): LocalDate {
        return Clock.System.now().toLocalDateTime(TimeZone.currentSystemDefault()).date
    }

    /**
     * Get the day of week index (0 = Monday, 6 = Sunday).
     */
    fun dayOfWeekIndex(date: LocalDate): Int {
        return date.dayOfWeek.ordinal // Monday = 0, Sunday = 6
    }

    /**
     * Check if a date falls on a weekend (Saturday = 5, Sunday = 6).
     */
    fun isWeekend(date: LocalDate): Boolean {
        val index = dayOfWeekIndex(date)
        return index == 5 || index == 6
    }

    /**
     * Generate a list of dates from start (inclusive) for the given number of days.
     */
    fun generateDateRange(start: LocalDate, days: Int): List<LocalDate> {
        return (0 until days).map { start.plus(it, DateTimeUnit.DAY) }
    }
}
