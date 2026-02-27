package com.cityflo.subscription.presentation.mapper

import com.cityflo.subscription.data.dto.SubscriptionPlanDto
import com.cityflo.subscription.presentation.model.PlanUiModel

object PlanMapper {

    fun mapToUiModel(dto: SubscriptionPlanDto): PlanUiModel {
        val ridesPerShift = if (dto.isRoundTrip) dto.totalRides / 2 else dto.totalRides
        return PlanUiModel(
            slug = dto.slug,
            name = dto.name,
            totalRides = dto.totalRides,
            ridesPerShift = ridesPerShift,
            pricePerRide = dto.pricePerRide,
            totalPrice = dto.totalPrice,
            durationDays = dto.durationDays,
            isRoundTrip = dto.isRoundTrip,
            features = dto.features,
            savingsText = dto.savingsText,
            isPopular = dto.isPopular
        )
    }
}
