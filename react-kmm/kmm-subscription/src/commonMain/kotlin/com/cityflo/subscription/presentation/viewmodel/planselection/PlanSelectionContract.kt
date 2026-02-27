package com.cityflo.subscription.presentation.viewmodel.planselection

import com.cityflo.subscription.arch.UIEffect
import com.cityflo.subscription.arch.UIEvent
import com.cityflo.subscription.presentation.model.PlanSelectionUiModel
import com.cityflo.subscription.presentation.model.PlanUiModel
import com.cityflo.subscription.util.UiState

typealias PlanSelectionUiState = UiState<PlanSelectionUiModel>

sealed class PlanSelectionEvent : UIEvent {
    data object FetchPlans : PlanSelectionEvent()
    data class SelectPlan(val slug: String) : PlanSelectionEvent()
    data object ProceedWithPlan : PlanSelectionEvent()
}

sealed class PlanSelectionEffect : UIEffect {
    data class NavigateToPassSetup(val plan: PlanUiModel) : PlanSelectionEffect()
    data class ShowError(val message: String) : PlanSelectionEffect()
}
