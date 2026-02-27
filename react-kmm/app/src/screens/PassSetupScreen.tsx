import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePassSetup } from '../hooks/usePassSetup';
import type { UiState, PassSetupData, StopInfo } from '../types/ui';
import ShiftTab from '../components/ShiftTab';
import StopPicker from '../components/StopPicker';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

// ---------------------------------------------------------------------------
// PassSetupScreen
// ---------------------------------------------------------------------------
// After a plan is selected the user configures their pass: pickup/drop-off
// stops and a date schedule for each shift (Morning / Evening).  A bottom
// sheet (StopPicker) opens when the user taps a stop selector.
// ---------------------------------------------------------------------------

const PassSetupScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    activeShiftTab,
    setActiveShiftTab,
    requestPickupStops,
    requestDropOffStops,
    selectPickupStop,
    selectDropOffStop,
    openCalendar,
    onScheduleConfirmed,
    proceed,
    goBack,
    isPickupSheetOpen,
    setPickupSheetOpen,
    isDropOffSheetOpen,
    setDropOffSheetOpen,
  } = usePassSetup() as {
    state: UiState<PassSetupData>;
    activeShiftTab: string;
    setActiveShiftTab: (tab: string) => void;
    requestPickupStops: (shift: string) => void;
    requestDropOffStops: (shift: string) => void;
    selectPickupStop: (shift: string, stop: StopInfo) => void;
    selectDropOffStop: (shift: string, stop: StopInfo) => void;
    openCalendar: (shift: string) => void;
    onScheduleConfirmed: () => void;
    proceed: () => void;
    goBack: () => void;
    isPickupSheetOpen: boolean;
    setPickupSheetOpen: (open: boolean) => void;
    isDropOffSheetOpen: boolean;
    setDropOffSheetOpen: (open: boolean) => void;
  };

  // ------ Loading ----------------------------------------------------------
  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner message="Setting up your pass..." />
      </div>
    );
  }

  // ------ Error ------------------------------------------------------------
  if (state.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-6">
        <ErrorState
          message={state.error ?? 'Unable to load pass setup.'}
          onRetry={() => window.location.reload()}
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
  const activeShift = data.shifts[activeShiftTab];
  const shiftKeys = Object.keys(data.shifts) as Array<keyof typeof data.shifts>;
  const showEvening = shiftKeys.includes('EVENING');

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      {/* ---- Header ---- */}
      <header className="sticky top-0 z-20 bg-surface px-5 pt-4 pb-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              goBack();
              navigate(-1);
            }}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-surface-secondary transition-colors"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-text-primary">Setup Your Pass</h1>
        </div>
      </header>

      {/* ---- Plan summary bar ---- */}
      <div className="bg-primary-50 border-b border-primary-100 px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary-dark">{data.planName}</p>
          <p className="text-xs text-text-secondary mt-0.5">
            {data.totalRidesPerShift} rides/shift
          </p>
        </div>
        <span className="text-xs font-medium text-primary bg-white px-3 py-1 rounded-full shadow-sm">
          {data.isRoundTrip ? 'Round Trip' : 'One Way'}
        </span>
      </div>

      {/* ---- Shift tabs (only for round-trip) ---- */}
      {data.isRoundTrip && (
        <div className="px-5 pt-4">
          <ShiftTab
            activeTab={activeShiftTab as 'MORNING' | 'EVENING'}
            onTabChange={(tab) => setActiveShiftTab(tab)}
            showEvening={showEvening}
          />
        </div>
      )}

      {/* ---- Shift configuration ---- */}
      <main className="flex-1 overflow-y-auto px-5 pt-5 pb-28 space-y-5">
        {/* Pickup stop selector */}
        <StopSelector
          label="Pickup Stop"
          value={activeShift?.pickupStop}
          placeholder="Tap to select pickup stop"
          onTap={() => requestPickupStops(activeShiftTab)}
        />

        {/* Drop-off stop selector */}
        <StopSelector
          label="Drop-off Stop"
          value={activeShift?.dropOffStop}
          placeholder="Tap to select drop-off stop"
          onTap={() => requestDropOffStops(activeShiftTab)}
        />

        {/* Schedule section */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
            Schedule
          </h3>

          {activeShift?.scheduleSummary ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {activeShift.scheduleSummary}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {activeShift.selectedDates.length} dates selected
                </p>
              </div>
              <button
                onClick={() => openCalendar(activeShiftTab)}
                className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                Edit
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                openCalendar(activeShiftTab);
                navigate('/calendar');
              }}
              disabled={!activeShift?.hasStops}
              className={`w-full py-3 rounded-lg text-sm font-medium transition-all
                ${
                  activeShift?.hasStops
                    ? 'bg-primary-50 text-primary border border-primary/20 hover:bg-primary-100 active:scale-[0.99]'
                    : 'bg-gray-100 text-text-muted cursor-not-allowed'
                }`}
            >
              {activeShift?.hasStops
                ? 'Select Schedule'
                : 'Select stops first'}
            </button>
          )}
        </div>

        {/* Configuration status indicator */}
        {data.isRoundTrip && (
          <div className="flex gap-3">
            {shiftKeys.map((key) => {
              const shift = data.shifts[key];
              const configured = shift?.isConfigured ?? false;
              return (
                <div
                  key={key}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-center text-xs font-medium border transition-colors
                    ${
                      configured
                        ? 'bg-success-light text-success border-success/20'
                        : 'bg-surface border-border text-text-muted'
                    }`}
                >
                  {key === 'MORNING' ? 'Morning' : 'Evening'}
                  {configured ? ' \u2713' : ' \u2014 Pending'}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ---- Sticky bottom button ---- */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface border-t border-border px-5 py-4 z-30">
        <button
          disabled={!data.isProceedEnabled}
          onClick={() => {
            proceed();
            navigate('/checkout');
          }}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
            ${
              data.isProceedEnabled
                ? 'bg-primary text-white shadow-md shadow-primary/30 active:scale-[0.98]'
                : 'bg-gray-200 text-text-muted cursor-not-allowed'
            }`}
        >
          Proceed to Checkout
        </button>
      </div>

      {/* ---- Bottom sheet: Pickup Stop Picker ---- */}
      {isPickupSheetOpen && (
        <StopPicker
          isOpen={true}
          title="Select Pickup Stop"
          stops={activeShift?.availablePickupStops ?? []}
          selectedStopId={activeShift?.pickupStop?.id}
          onSelect={(stop) => {
            selectPickupStop(activeShiftTab, stop);
            setPickupSheetOpen(false);
          }}
          onClose={() => setPickupSheetOpen(false)}
        />
      )}

      {/* ---- Bottom sheet: Drop-off Stop Picker ---- */}
      {isDropOffSheetOpen && (
        <StopPicker
          isOpen={true}
          title="Select Drop-off Stop"
          stops={activeShift?.availableDropOffStops ?? []}
          selectedStopId={activeShift?.dropOffStop?.id}
          onSelect={(stop) => {
            selectDropOffStop(activeShiftTab, stop);
            setDropOffSheetOpen(false);
          }}
          onClose={() => setDropOffSheetOpen(false)}
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// StopSelector — inline helper component
// ---------------------------------------------------------------------------
interface StopSelectorProps {
  label: string;
  value?: { name: string; time: string } | null;
  placeholder: string;
  onTap: () => void;
}

const StopSelector: React.FC<StopSelectorProps> = ({ label, value, placeholder, onTap }) => (
  <button
    onClick={onTap}
    className="relative w-full bg-surface rounded-xl border border-border p-4 pr-10 text-left transition-all hover:border-primary/40 active:scale-[0.99]"
  >
    <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
      {label}
    </span>
    {value ? (
      <div className="mt-1.5">
        <p className="text-sm font-medium text-text-primary">{value.name}</p>
        <p className="text-xs text-text-secondary mt-0.5">{value.time}</p>
      </div>
    ) : (
      <p className="mt-1.5 text-sm text-text-muted">{placeholder}</p>
    )}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-text-muted absolute right-4 top-1/2 -translate-y-1/2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  </button>
);

export default PassSetupScreen;
