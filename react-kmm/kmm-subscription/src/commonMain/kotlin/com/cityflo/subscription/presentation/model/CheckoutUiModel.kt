package com.cityflo.subscription.presentation.model

data class PricingBreakdownUiModel(
    val baseFarePerRide: Float,
    val totalRides: Int,
    val baseFareTotal: Float,           // baseFarePerRide * totalRides
    val convenienceFee: Float,          // Rs.25
    val gstRate: Float,                 // 0.05
    val gstAmount: Float,              // (baseFareTotal + convenienceFee) * gstRate
    val walletCredit: Float,           // min(walletBalance, totalBeforeWallet)
    val totalPayable: Float            // baseFareTotal + convenienceFee + gstAmount - walletCredit
) {
    val baseFareTotalText: String = "₹${baseFareTotal.toInt()}"
    val convenienceFeeText: String = "₹${convenienceFee.toInt()}"
    val gstAmountText: String = "₹${gstAmount.toInt()}"
    val walletCreditText: String = "-₹${walletCredit.toInt()}"
    val totalPayableText: String = "₹${totalPayable.toInt()}"
    val baseFareBreakdownText: String = "₹${baseFarePerRide.toInt()} × $totalRides rides"
}

data class PaymentMethodUiModel(
    val method: PaymentMethod,
    val isSelected: Boolean,
    val isEnabled: Boolean,
    val subtitle: String?
)

data class ShiftSummaryUiModel(
    val timeOfDay: TimeOfDay,
    val pickupStopName: String,
    val dropOffStopName: String,
    val pickupTime: String,
    val ridesCount: Int,
    val dateRange: String
)

data class CheckoutUiModel(
    val planName: String,
    val shiftSummaries: List<ShiftSummaryUiModel>,
    val pricing: PricingBreakdownUiModel,
    val paymentMethods: List<PaymentMethodUiModel>,
    val selectedPaymentMethod: PaymentMethod?,
    val walletBalance: Float,
    val isWalletInsufficient: Boolean,
    val termsAccepted: Boolean,
    val isPlaceOrderEnabled: Boolean,
    val isProcessing: Boolean,
    val isOrderSummaryExpanded: Boolean
)
