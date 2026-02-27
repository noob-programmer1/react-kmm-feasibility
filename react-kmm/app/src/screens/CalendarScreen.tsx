import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalendar } from '../hooks/useCalendar';
import type { UiState, CalendarData } from '../types/ui';
import WeekDayToggle from '../components/WeekDayToggle';
import CalendarGrid from '../components/CalendarGrid';
import HolidayRemarks from '../components/HolidayRemarks';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

// ---------------------------------------------------------------------------
// CalendarScreen
// ---------------------------------------------------------------------------
// Lets the user pick specific travel dates for a shift.  A WeekDayToggle bar
// at the top controls which weekdays auto-select, then the user fine-tunes
// via the CalendarGrid.  A HolidayRemarks expandable section shows any
// holidays that fall within the selected range.
// ---------------------------------------------------------------------------

const CalendarScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state, toggleWeekDay, selectDate, confirmDates, toggleHolidayRemarks, goBack } =
    useCalendar() as {
      state: UiState<CalendarData>;
      toggleWeekDay: (index: number) => void;
      selectDate: (date: string) => void;
      confirmDates: () => void;
      toggleHolidayRemarks: () => void;
      goBack: () => void;
    };

  // ------ Loading ----------------------------------------------------------
  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner message="Loading calendar..." />
      </div>
    );
  }

  // ------ Error ------------------------------------------------------------
  if (state.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-6">
        <ErrorState
          message={state.error ?? 'Unable to load calendar.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // ------ Idle / no data ---------------------------------------------------
  if (state.status === 'idle' || !state.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner message="Initialising calendar..." />
      </div>
    );
  }

  // ------ Success ----------------------------------------------------------
  const data = state.data;
  const ridesFraction = `${data.selectedRideCount} of ${data.totalRidesNeeded}`;
  const allRidesSelected = data.selectedRideCount === data.totalRidesNeeded;

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
          <h1 className="text-xl font-bold text-text-primary">Select Dates</h1>
        </div>
      </header>

      {/* ---- Weekday toggle bar ---- */}
      <div className="bg-surface border-b border-border px-5 py-3">
        <WeekDayToggle
          weekDays={data.selectedWeekDays}
          onToggle={(index) => toggleWeekDay(index)}
          error={data.weekSelectionError ?? undefined}
        />
      </div>

      {/* ---- Ride count info ---- */}
      <div className="bg-surface border-b border-border px-5 py-3 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          <span
            className={`font-semibold ${allRidesSelected ? 'text-success' : 'text-primary'}`}
          >
            {ridesFraction}
          </span>{' '}
          rides selected
        </p>
        <span className="text-xs text-text-muted">{data.planDurationText}</span>
      </div>

      {/* ---- Calendar grid ---- */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-44">
        <CalendarGrid
          monthLabel={data.monthLabel}
          dates={data.calendarDates}
          onDateClick={(date) => selectDate(date)}
        />

        {/* ---- Date range summary ---- */}
        {(data.startDateText || data.endDateText) && (
          <div className="mt-5 bg-primary-50 rounded-xl px-4 py-3 flex items-center justify-between border border-primary/10">
            <div className="text-sm">
              <span className="text-text-secondary">Start: </span>
              <span className="font-semibold text-text-primary">
                {data.startDateText ?? '--'}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="text-sm">
              <span className="text-text-secondary">End: </span>
              <span className="font-semibold text-text-primary">
                {data.endDateText ?? '--'}
              </span>
            </div>
          </div>
        )}

        {/* ---- Holiday remarks ---- */}
        {data.holidayRemarks.length > 0 && (
          <div className="mt-5">
            <HolidayRemarks
              remarks={data.holidayRemarks}
              isExpanded={data.isHolidayRemarksExpanded}
              onToggle={toggleHolidayRemarks}
            />
          </div>
        )}
      </main>

      {/* ---- Sticky bottom button ---- */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface border-t border-border px-5 py-4 z-30">
        <button
          disabled={!data.isConfirmEnabled}
          onClick={() => {
            confirmDates();
            navigate(-1);
          }}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
            ${
              data.isConfirmEnabled
                ? 'bg-primary text-white shadow-md shadow-primary/30 active:scale-[0.98]'
                : 'bg-gray-200 text-text-muted cursor-not-allowed'
            }`}
        >
          {data.isConfirmEnabled
            ? `Confirm ${data.selectedRideCount} Dates`
            : `Select ${data.totalRidesNeeded - data.selectedRideCount} more ride${
                data.totalRidesNeeded - data.selectedRideCount !== 1 ? 's' : ''
              }`}
        </button>
      </div>
    </div>
  );
};

export default CalendarScreen;
