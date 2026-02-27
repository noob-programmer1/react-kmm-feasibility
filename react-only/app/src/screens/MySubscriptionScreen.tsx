import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMySubscription } from '../hooks/useMySubscription';
import type { UiState, MySubscriptionData } from '../types/ui';
import StatusStepper from '../components/StatusStepper';
import UsageProgress from '../components/UsageProgress';
import UpcomingRideCard from '../components/UpcomingRideCard';
import ShiftSummaryCard from '../components/ShiftSummaryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

// ---------------------------------------------------------------------------
// MySubscriptionScreen
// ---------------------------------------------------------------------------
// Dashboard view for an active (or expired) subscription.  Shows a status
// stepper, plan info card, a circular usage-progress ring, upcoming rides,
// shift details, and a conditional renewal CTA at the bottom.
// ---------------------------------------------------------------------------

const MySubscriptionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state, refresh, renew, goHome } = useMySubscription() as {
    state: UiState<MySubscriptionData>;
    refresh: () => void;
    renew: () => void;
    goHome: () => void;
  };

  // ------ Loading ----------------------------------------------------------
  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner message="Loading subscription..." />
      </div>
    );
  }

  // ------ Error ------------------------------------------------------------
  if (state.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-6">
        <ErrorState
          message={state.error ?? 'Unable to load subscription details.'}
          onRetry={refresh}
        />
      </div>
    );
  }

  // ------ Idle / no data ---------------------------------------------------
  if (state.status === 'idle' || !state.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner message="Initialising..." />
      </div>
    );
  }

  // ------ Success ----------------------------------------------------------
  const data = state.data;

  // Derive status badge style
  const statusBadgeClass = (() => {
    switch (data.status) {
      case 'ACTIVE':
        return 'bg-success-light text-success';
      case 'EXPIRING_SOON':
        return 'bg-warning-light text-warning';
      case 'EXPIRED':
        return 'bg-danger-light text-danger';
      default:
        return 'bg-gray-100 text-text-muted';
    }
  })();

  // Should we show the renewal CTA at the bottom?
  const showRenewalCta =
    data.renewalCta &&
    data.renewalCta.type !== 'HIDDEN';

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      {/* ---- Header ---- */}
      <header className="sticky top-0 z-20 bg-surface px-5 pt-5 pb-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">My Subscription</h1>
        <button
          onClick={refresh}
          className="p-2 rounded-lg hover:bg-surface-secondary transition-colors"
          aria-label="Refresh"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </header>

      {/* ---- Content ---- */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-5">
        {/* -- Status stepper -- */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <StatusStepper currentStatus={data.status} />
        </div>

        {/* -- Plan info card -- */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-text-primary">{data.planName}</h2>
              <p className="text-xs text-text-secondary mt-1">
                {data.startDate} &mdash; {data.endDate}
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass}`}
            >
              {data.statusLabel}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-text-secondary">
            <span>{data.usageText}</span>
            <span className="text-text-muted">|</span>
            <span>{data.daysRemainingText}</span>
          </div>
        </div>

        {/* -- Usage progress ring -- */}
        <div className="bg-surface rounded-xl border border-border p-6 flex flex-col items-center">
          <UsageProgress
            used={data.ridesUsed}
            total={data.totalRides}
            label={data.usageText}
          />
          <p className="mt-3 text-sm font-medium text-text-primary">{data.usageText}</p>
          <p className="text-xs text-text-muted mt-0.5">
            {data.totalRides - data.ridesUsed} rides remaining
          </p>
        </div>

        {/* -- Upcoming rides -- */}
        {data.upcomingRides.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 px-1">
              Upcoming Rides
            </h3>
            <div className="space-y-2.5">
              {data.upcomingRides.map((ride, idx) => (
                <UpcomingRideCard
                  key={idx}
                  date={ride.date}
                  dayLabel={ride.dayLabel}
                  pickupStop={ride.pickupStop}
                  pickupTime={ride.pickupTime}
                  dropOffStop={ride.dropOffStop}
                  dropOffTime={ride.dropOffTime}
                  shift={ride.shift}
                />
              ))}
            </div>
          </div>
        )}

        {/* -- Shift details -- */}
        {data.shifts.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 px-1">
              Shift Details
            </h3>
            <div className="space-y-3">
              {data.shifts.map((shift, idx) => (
                <ShiftSummaryCard
                  key={idx}
                  shiftLabel={shift.shiftLabel}
                  pickupStop={shift.pickupStop}
                  pickupTime={shift.pickupTime}
                  dropOffStop={shift.dropOffStop}
                  dropOffTime={shift.dropOffTime}
                  rideCount={shift.rideCount}
                  scheduleSummary={shift.scheduleSummary}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ---- Sticky bottom: Renewal CTA or Back to Home ---- */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface border-t border-border px-5 py-4 z-30">
        {showRenewalCta ? (
          <div>
            {data.renewalCta.message && (
              <p
                className={`text-xs font-medium text-center mb-2 ${
                  data.renewalCta.type === 'EXPIRED' ? 'text-danger' : 'text-warning'
                }`}
              >
                {data.renewalCta.message}
              </p>
            )}
            <button
              onClick={() => {
                renew();
                navigate('/plans');
              }}
              className="w-full py-3.5 rounded-xl text-sm font-semibold bg-primary text-white shadow-md shadow-primary/30 active:scale-[0.98] transition-all duration-200"
            >
              {data.renewalCta.type === 'EXPIRED'
                ? 'Get a New Plan'
                : 'Renew Subscription'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              goHome();
              navigate('/');
            }}
            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-surface border border-border text-text-primary hover:bg-surface-secondary active:scale-[0.98] transition-all duration-200"
          >
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
};

export default MySubscriptionScreen;
