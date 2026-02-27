package com.cityflo.subscription.presentation.viewmodel.checkout

import com.cityflo.subscription.arch.UIEffect
import com.cityflo.subscription.arch.UIEvent
import com.cityflo.subscription.presentation.model.CheckoutUiModel
import com.cityflo.subscription.presentation.model.PaymentMethod
import com.cityflo.subscription.util.UiState

typealias CheckoutUiState = UiState<CheckoutUiModel>

sealed class CheckoutEvent : UIEvent {
    data class LoadCheckout(
        val planSlug: String,
        val planName: String,
        val baseFarePerRide: Float,
        val totalRides: Int,
        val walletBalance: Float,
        val isRoundTrip: Boolean
    ) : CheckoutEvent()

    data class SelectPaymentMethod(val method: PaymentMethod) : CheckoutEvent()
    data object ToggleTerms : CheckoutEvent()
    data object ToggleOrderSummary : CheckoutEvent()
    data object PlaceOrder : CheckoutEvent()
}

sealed class CheckoutEffect : UIEffect {
    data class NavigateToMySubscription(val orderId: String) : CheckoutEffect()
    data class ShowError(val message: String) : CheckoutEffect()
}
