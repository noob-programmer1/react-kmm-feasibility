package com.cityflo.subscription.presentation.viewmodel.mysubscription

import com.cityflo.subscription.arch.UIEffect
import com.cityflo.subscription.arch.UIEvent
import com.cityflo.subscription.presentation.model.MySubscriptionUiModel
import com.cityflo.subscription.util.UiState

typealias MySubscriptionUiState = UiState<MySubscriptionUiModel>

sealed class MySubscriptionEvent : UIEvent {
    data class LoadSubscription(val orderId: String) : MySubscriptionEvent()
    data object RefreshStatus : MySubscriptionEvent()
    data object RenewSubscription : MySubscriptionEvent()
    data object BackToHome : MySubscriptionEvent()
}

sealed class MySubscriptionEffect : UIEffect {
    data object NavigateToPlanSelection : MySubscriptionEffect()
    data class ShowSnackbar(val message: String) : MySubscriptionEffect()
}
