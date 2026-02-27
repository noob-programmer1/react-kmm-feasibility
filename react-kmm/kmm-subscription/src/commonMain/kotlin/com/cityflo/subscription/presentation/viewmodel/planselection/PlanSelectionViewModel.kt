package com.cityflo.subscription.presentation.viewmodel.planselection

import com.cityflo.subscription.arch.BaseViewModel
import com.cityflo.subscription.domain.IPlanRepository
import com.cityflo.subscription.presentation.analytics.AnalyticsService
import com.cityflo.subscription.presentation.analytics.SubscriptionAnalytics
import com.cityflo.subscription.presentation.mapper.PlanMapper
import com.cityflo.subscription.presentation.model.PlanSelectionUiModel
import com.cityflo.subscription.util.UiState
import com.cityflo.subscription.util.getOrNull
import kotlinx.coroutines.launch

class PlanSelectionViewModel(
    private val planRepository: IPlanRepository,
    private val analyticsService: AnalyticsService
) : BaseViewModel<PlanSelectionUiState, PlanSelectionEvent, PlanSelectionEffect>(
    UiState.idle()
) {

    override fun handleEvent(event: PlanSelectionEvent) {
        when (event) {
            PlanSelectionEvent.FetchPlans -> fetchPlans()
            is PlanSelectionEvent.SelectPlan -> selectPlan(event.slug)
            PlanSelectionEvent.ProceedWithPlan -> proceedWithPlan()
        }
    }

    private fun fetchPlans() {
        scope.launch {
            setState { UiState.loading(getOrNull()) }

            analyticsService.track(SubscriptionAnalytics.PlansViewed)

            planRepository.getPlans()
                .onSuccess { response ->
                    val plans = response.plans.map { PlanMapper.mapToUiModel(it) }
                    val popularPlan = plans.find { it.isPopular }

                    setState {
                        UiState.success(
                            PlanSelectionUiModel(
                                plans = plans,
                                selectedPlanSlug = popularPlan?.slug,
                                comparisonHighlight = popularPlan?.savingsText
                            )
                        )
                    }
                }
                .onFailure {
                    setState { UiState.failure(getOrNull(), "Failed to load plans") }
                    setEffect { PlanSelectionEffect.ShowError("Failed to load plans. Please try again.") }
                }
        }
    }

    private fun selectPlan(slug: String) {
        val currentData = currentState.getOrNull() ?: return
        val plan = currentData.plans.find { it.slug == slug } ?: return

        analyticsService.track(
            SubscriptionAnalytics.PlanSelected(
                planSlug = slug,
                planName = plan.name,
                price = plan.totalPrice
            )
        )

        val previousSlug = currentData.selectedPlanSlug
        if (previousSlug != null && previousSlug != slug) {
            analyticsService.track(
                SubscriptionAnalytics.PlanCompared(
                    fromPlan = previousSlug,
                    toPlan = slug
                )
            )
        }

        setState {
            UiState.success(
                currentData.copy(
                    selectedPlanSlug = slug,
                    comparisonHighlight = plan.savingsText
                )
            )
        }
    }

    private fun proceedWithPlan() {
        val currentData = currentState.getOrNull() ?: return
        val plan = currentData.selectedPlan ?: return

        setEffect { PlanSelectionEffect.NavigateToPassSetup(plan) }
    }
}
