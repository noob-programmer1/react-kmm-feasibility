package com.cityflo.subscription.data.mock

import com.cityflo.subscription.data.dto.CalendarDateDto
import com.cityflo.subscription.data.dto.CalendarRemarkDto
import com.cityflo.subscription.data.dto.CalendarResponseDto
import com.cityflo.subscription.domain.ICalendarRepository
import com.cityflo.subscription.util.ApiResponse
import com.cityflo.subscription.util.DateUtils
import com.cityflo.subscription.util.NetworkResponse
import kotlinx.coroutines.delay
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.plus

class MockCalendarRepository : ICalendarRepository {

    // Holidays: fixed dates for the POC
    private val holidays = mapOf(
        "26-01-2026" to "Republic Day",
        "10-03-2026" to "Holi",
        "03-04-2026" to "Good Friday",
        "01-05-2026" to "Maharashtra Day"
    )

    override suspend fun getCalendar(
        startStopInfoPk: Long?,
        endStopInfoPk: Long?,
        planSlug: String,
        startDate: String?
    ): ApiResponse<CalendarResponseDto> {
        delay(600) // Simulate network delay

        val today = DateUtils.today()
        val dates = mutableListOf<CalendarDateDto>()

        // Generate 60 days of calendar data starting from tomorrow
        val start = today.plus(1, DateTimeUnit.DAY)
        for (i in 0 until 60) {
            val date = start.plus(i, DateTimeUnit.DAY)
            val dateString = DateUtils.formatDate(date)
            val isWeekend = DateUtils.isWeekend(date)
            val holidayRemark = holidays[dateString]

            dates.add(
                CalendarDateDto(
                    date = dateString,
                    isRideAvailable = !isWeekend && holidayRemark == null,
                    holidayRemark = holidayRemark
                )
            )
        }

        // Max valid start date: 14 days from today
        val maxStart = today.plus(14, DateTimeUnit.DAY)

        return NetworkResponse.Success(
            CalendarResponseDto(
                dates = dates,
                maxValidStartDate = DateUtils.formatDate(maxStart),
                footerRemarks = listOf(
                    CalendarRemarkDto("Rides are not available on weekends and public holidays"),
                    CalendarRemarkDto("Your subscription will start from the first selected date"),
                    CalendarRemarkDto("You can reschedule rides 24 hours before departure")
                )
            )
        )
    }
}
