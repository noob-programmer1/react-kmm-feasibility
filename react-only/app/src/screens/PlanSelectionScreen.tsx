import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanSelection } from '../hooks/usePlanSelection';
import type { UiState, PlanSelectionData } from '../types/ui';
import PlanCard from '../components/PlanCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

// ---------------------------------------------------------------------------
// PlanSelectionScreen
// ---------------------------------------------------------------------------
// Displays available subscription plans in a scrollable list. The user taps
// a PlanCard to select it, then taps the sticky bottom button to proceed to
// the PassSetup screen.
// ---------------------------------------------------------------------------

const PlanSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state, selectPlan, proceed } = usePlanSelection() as {
    state: UiState<PlanSelectionData>;
    selectPlan: (slug: string) => void;
    proceed: () => void;
  };

  // ------ Loading state ----------------------------------------------------
  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner message="Fetching plans..." />
      </div>
    );
  }

  // ------ Error state ------------------------------------------------------
  if (state.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-6">
        <ErrorState
          message={state.error ?? 'Something went wrong. Please try again.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // ------ Empty / idle before data -----------------------------------------
  if (state.status === 'idle' || !state.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner message="Initialising..." />
      </div>
    );
  }

  // ------ Success ----------------------------------------------------------
  const { plans, selectedPlanSlug, comparisonHighlight } = state.data;
  const selectedPlan = plans.find((p) => p.slug === selectedPlanSlug);

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      {/* ---- Header ---- */}
      <header className="sticky top-0 z-20 bg-surface px-5 pt-6 pb-4 shadow-sm">
        <h1 className="text-xl font-bold text-text-primary">Choose Your Plan</h1>
        {comparisonHighlight && (
          <p className="mt-1 text-xs font-medium text-primary">
            {comparisonHighlight}
          </p>
        )}
      </header>

      {/* ---- Plan list ---- */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-4">
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted text-sm">
            <span className="text-4xl mb-3">&#128203;</span>
            <p>No plans available right now.</p>
          </div>
        ) : (
          plans.map((plan) => (
            <PlanCard
              key={plan.slug}
              {...plan}
              isSelected={plan.slug === selectedPlanSlug}
              onSelect={() => selectPlan(plan.slug)}
            />
          ))
        )}
      </main>

      {/* ---- Sticky bottom button ---- */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface border-t border-border px-5 py-4 z-30">
        <button
          disabled={!selectedPlan}
          onClick={() => {
            proceed();
            navigate('/pass-setup');
          }}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
            ${
              selectedPlan
                ? 'bg-primary text-white shadow-md shadow-primary/30 active:scale-[0.98]'
                : 'bg-gray-200 text-text-muted cursor-not-allowed'
            }`}
        >
          {selectedPlan
            ? `Continue with ${selectedPlan.name}`
            : 'Select a plan to continue'}
        </button>
      </div>
    </div>
  );
};

export default PlanSelectionScreen;
