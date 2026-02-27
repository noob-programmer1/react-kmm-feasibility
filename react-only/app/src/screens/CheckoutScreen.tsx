import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from '../hooks/useCheckout';
import type { UiState, CheckoutData } from '../types/ui';
import ShiftSummaryCard from '../components/ShiftSummaryCard';
import PricingBreakdown from '../components/PricingBreakdown';
import PaymentMethodPicker from '../components/PaymentMethodPicker';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

// ---------------------------------------------------------------------------
// CheckoutScreen
// ---------------------------------------------------------------------------
// Final review-and-pay screen.  Shows an expandable order summary with shift
// details, pricing breakdown, payment method selector, terms checkbox, and a
// sticky "Place Order" button.  An overlay spinner appears while the order is
// being processed.
// ---------------------------------------------------------------------------

const CheckoutScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state, selectPaymentMethod, toggleTerms, toggleOrderSummary, placeOrder, goBack } =
    useCheckout() as {
      state: UiState<CheckoutData>;
      selectPaymentMethod: (id: string) => void;
      toggleTerms: () => void;
      toggleOrderSummary: () => void;
      placeOrder: () => void;
      goBack: () => void;
    };

  // ------ Loading ----------------------------------------------------------
  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner message="Preparing checkout..." />
      </div>
    );
  }

  // ------ Error ------------------------------------------------------------
  if (state.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-6">
        <ErrorState
          message={state.error ?? 'Unable to load checkout.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // ------ Idle / no data ---------------------------------------------------
  if (state.status === 'idle' || !state.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner message="Initialising checkout..." />
      </div>
    );
  }

  // ------ Success ----------------------------------------------------------
  const data = state.data;

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col relative">
      {/* ---- Processing overlay ---- */}
      {data.isProcessing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-surface rounded-2xl px-8 py-6 flex flex-col items-center shadow-xl">
            <LoadingSpinner message="Placing your order..." />
          </div>
        </div>
      )}

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
          <h1 className="text-xl font-bold text-text-primary">Review & Pay</h1>
        </div>
      </header>

      {/* ---- Content ---- */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-32 space-y-4">
        {/* -- Order summary (expandable) -- */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <button
            onClick={toggleOrderSummary}
            className="w-full flex items-center justify-between px-4 py-3.5"
          >
            <div className="text-left">
              <h2 className="text-sm font-semibold text-text-primary">Order Summary</h2>
              <p className="text-xs text-text-secondary mt-0.5">{data.planName}</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 text-text-muted transition-transform duration-200 ${
                data.isOrderSummaryExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {data.isOrderSummaryExpanded && (
            <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
              {data.shiftSummaries.map((shift, idx) => (
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
          )}
        </div>

        {/* -- Pricing breakdown -- */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Price Details</h2>
          <PricingBreakdown {...data.pricing} />
        </div>

        {/* -- Payment method picker -- */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Payment Method</h2>
          <PaymentMethodPicker
            methods={data.paymentMethods}
            selectedId={data.selectedPaymentMethod ?? undefined}
            onSelect={(id) => selectPaymentMethod(id)}
            walletInsufficient={data.isWalletInsufficient}
          />
        </div>

        {/* -- Wallet insufficiency warning -- */}
        {data.isWalletInsufficient && (
          <div className="bg-warning-light border border-warning/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-warning flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-xs text-warning font-medium leading-relaxed">
              Your wallet balance ({'\u20B9'}{data.walletBalance.toFixed(0)}) is insufficient.
              The remaining amount will be charged via{' '}
              {data.selectedPaymentMethod === 'UPI' ? 'UPI' : 'your selected method'}.
            </p>
          </div>
        )}

        {/* -- Terms checkbox -- */}
        <label className="flex items-start gap-3 bg-surface rounded-xl border border-border p-4 cursor-pointer">
          <input
            type="checkbox"
            checked={data.termsAccepted}
            onChange={toggleTerms}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
          />
          <span className="text-xs text-text-secondary leading-relaxed">
            I agree to the{' '}
            <span className="text-primary font-medium underline underline-offset-2">
              Terms & Conditions
            </span>{' '}
            and acknowledge the cancellation policy for subscription passes.
          </span>
        </label>
      </main>

      {/* ---- Sticky bottom button ---- */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface border-t border-border px-5 py-4 z-30">
        <button
          disabled={!data.isPlaceOrderEnabled || data.isProcessing}
          onClick={() => {
            placeOrder();
          }}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
            ${
              data.isPlaceOrderEnabled && !data.isProcessing
                ? 'bg-primary text-white shadow-md shadow-primary/30 active:scale-[0.98]'
                : 'bg-gray-200 text-text-muted cursor-not-allowed'
            }`}
        >
          {data.isProcessing
            ? 'Processing...'
            : `Place Order ${'\u20B9'}${data.pricing.totalPayable.toFixed(0)}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutScreen;
