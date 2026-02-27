package com.cityflo.subscription.util

import com.cityflo.subscription.presentation.model.PricingBreakdownUiModel
import kotlin.math.min

/**
 * Pure business logic for subscription pricing calculation.
 * This is the kind of code that benefits from sharing across platforms.
 */
object PricingCalculator {

    private const val CONVENIENCE_FEE = 25f
    private const val GST_RATE = 0.05f

    /**
     * Calculate the full pricing breakdown for a subscription.
     *
     * @param baseFarePerRide Price per individual ride
     * @param totalRides Total number of rides across all shifts
     * @param walletBalance User's current wallet balance
     * @return Complete pricing breakdown with all line items
     */
    fun calculatePricing(
        baseFarePerRide: Float,
        totalRides: Int,
        walletBalance: Float
    ): PricingBreakdownUiModel {
        val baseFareTotal = baseFarePerRide * totalRides
        val subtotalBeforeGst = baseFareTotal + CONVENIENCE_FEE
        val gstAmount = subtotalBeforeGst * GST_RATE
        val totalBeforeWallet = subtotalBeforeGst + gstAmount
        val walletCredit = min(walletBalance, totalBeforeWallet)
        val totalPayable = (totalBeforeWallet - walletCredit).coerceAtLeast(0f)

        return PricingBreakdownUiModel(
            baseFarePerRide = baseFarePerRide,
            totalRides = totalRides,
            baseFareTotal = baseFareTotal,
            convenienceFee = CONVENIENCE_FEE,
            gstRate = GST_RATE,
            gstAmount = gstAmount,
            walletCredit = walletCredit,
            totalPayable = totalPayable
        )
    }

    /**
     * Check if wallet balance is sufficient for the total payable amount.
     */
    fun isWalletSufficient(walletBalance: Float, totalPayable: Float): Boolean {
        return walletBalance >= totalPayable
    }

    /**
     * Calculate savings between two plans.
     */
    fun calculateSavings(
        weeklyPricePerRide: Float,
        monthlyPricePerRide: Float,
        monthlyTotalRides: Int
    ): Float {
        return (weeklyPricePerRide - monthlyPricePerRide) * monthlyTotalRides
    }
}
