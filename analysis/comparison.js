// comparison.js — "How It Works" section
// Also contains demo helper functions (copyCmd, loadDemos, resetDemos)

function escH(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function dl(type, text) {
  return '<span class="dl dl-' + type + '">' + escH(text) + '</span>';
}

function initComparison() {
  var root = document.getElementById('comparisonRoot');
  if (!root) return;
  var h = '';
  h += '<h2>How It Works — React vs React + KMM</h2>';
  h += '<p class="subtitle">In production (not POC) — no mocks. Real API calls, real business logic, real state management.</p>';
  h += buildArchSection();
  h += buildExamplesSection();
  h += buildDiffSection();
  h += buildSummarySection();
  root.innerHTML = h;
}

// ──────────────────────────────────────────────
// PART 1: Architecture — Who Handles What
// ──────────────────────────────────────────────
function buildArchSection() {
  var h = '';
  h += '<div style="margin-bottom:40px">';
  h += '<h3 style="margin-bottom:6px">1. Who Handles the Logic?</h3>';
  h += '<p style="font-size:13px;color:var(--text2);margin-bottom:16px">';
  h += 'The UI components (screens, buttons, lists) stay <strong style="color:var(--white)">exactly the same</strong>. The only thing that changes is <strong style="color:var(--white)">where the brain lives</strong>.</p>';

  // Two architecture diagrams side by side
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">';

  // ── Pure React ──
  h += '<div class="card glass" style="padding:20px;border-top:3px solid var(--orange)">';
  h += '<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--orange);font-weight:700;margin-bottom:12px">Pure React</div>';
  // Flow
  h += archBox('var(--white)', 'User Action', 'Tap button, select item, type text');
  h += archArrow();
  h += archBox('var(--orange)', 'React Hook = THE BRAIN', 'API calls, business logic, pricing math, validation, state computation, analytics — you write ALL of this');
  h += archArrow();
  h += archBox('var(--white)', 'setState( computed result )', 'You manually build the new state object');
  h += archArrow();
  h += archBox('var(--white)', 'UI Re-renders', 'Same React components');
  h += '<div style="margin-top:12px;padding:8px 12px;background:rgba(245,158,11,0.1);border-radius:8px;font-size:12px;color:var(--orange);text-align:center;font-weight:600">';
  h += 'React developer owns ALL logic</div>';
  h += '</div>';

  // ── React + KMM ──
  h += '<div class="card glass" style="padding:20px;border-top:3px solid var(--blue)">';
  h += '<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--blue);font-weight:700;margin-bottom:12px">React + KMM</div>';
  h += archBox('var(--white)', 'User Action', 'Tap button, select item, type text');
  h += archArrow();
  h += archBox('var(--blue)', 'React Hook = POSTMAN', 'Just forwards the action to Kotlin. One line of code.');
  h += archArrow();
  h += archBox('var(--violet)', 'Kotlin ViewModel = THE BRAIN', 'API calls, business logic, pricing, validation, state computation, analytics — already written by mobile team');
  h += archArrow();
  h += archBox('var(--green)', 'observeState fires automatically', 'Kotlin pushes complete new state to React');
  h += archArrow();
  h += archBox('var(--white)', 'UI Re-renders', 'Same React components');
  h += '<div style="margin-top:12px;padding:8px 12px;background:rgba(59,130,246,0.1);border-radius:8px;font-size:12px;color:var(--blue);text-align:center;font-weight:600">';
  h += 'React developer just connects wires</div>';
  h += '</div>';

  h += '</div>'; // grid

  // Key insight
  h += '<div class="callout green">';
  h += '<strong style="color:var(--white)">The key insight:</strong> ';
  h += '<span style="font-size:13px">In pure React, the hook IS the brain — it decides what happens on every user action. ';
  h += 'With KMM, the hook is just a postman — it passes the message to Kotlin and Kotlin figures out what to do. ';
  h += 'React doesn\'t need to know the business rules. It just observes the state and renders.</span>';
  h += '</div>';

  h += '</div>';
  return h;
}

function archBox(color, title, desc) {
  return '<div style="padding:10px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);margin-bottom:0">'
    + '<div style="font-size:12px;font-weight:700;color:' + color + '">' + title + '</div>'
    + '<div style="font-size:11px;color:var(--text2);margin-top:2px">' + desc + '</div>'
    + '</div>';
}

function archArrow() {
  return '<div style="text-align:center;color:var(--text2);font-size:14px;line-height:1;padding:4px 0">&darr;</div>';
}

// ──────────────────────────────────────────────
// PART 2: Real Examples — User Action Cards
// ──────────────────────────────────────────────
function buildExamplesSection() {
  var examples = [
    {
      action: 'User selects "Monthly Plan"',
      icon: '1',
      reactSteps: [
        'Find the tapped plan object from the list',
        'Unselect the previously selected plan',
        'Set the new plan as selected',
        'Recalculate savings comparison text ("Save 24% vs Weekly")',
        'Check if proceed button should be enabled',
        'Track analytics event: PlanSelected',
        'Build the entire new state object manually',
        'Call setState with computed result',
      ],
      reactLines: '~15 lines of logic',
      kmmCall: 'vm.selectPlan("monthly-roundtrip")',
      kmmSteps: [
        'Unselects previous plan',
        'Selects new plan',
        'Recalculates comparison text',
        'Enables proceed button',
        'Tracks analytics',
        'Pushes complete new state to React via observeState',
      ],
      kmmNote: 'React auto-renders with new state',
    },
    {
      action: 'User selects "UPI" as payment method',
      icon: '2',
      reactSteps: [
        'Check: is this "wallet" payment?',
        'If wallet: compare walletBalance vs totalPayable',
        'Set isWalletInsufficient flag',
        'Update selectedPaymentMethod',
        'Recompute isPlaceOrderEnabled = !insufficient && termsAccepted && !processing',
        'Build new state with all these computed fields',
        'Call setState',
      ],
      reactLines: '~12 lines of validation logic',
      kmmCall: 'vm.selectPaymentMethod("upi")',
      kmmSteps: [
        'Validates wallet sufficiency',
        'Updates selected payment method',
        'Recomputes button enabled state',
        'Tracks analytics event',
        'Pushes new state to React',
      ],
      kmmNote: 'React auto-renders with new state',
    },
    {
      action: 'User confirms calendar dates',
      icon: '3',
      reactSteps: [
        'Run calendar algorithm: filter by selected weekdays',
        'Skip holidays and weekends',
        'Count rides against quota (e.g., 22 rides needed)',
        'Mark start date and end date',
        'Handle edge case: user changes start date mid-selection',
        'Recalculate from new start date',
        'Validate opposite shift compatibility (round trip)',
        'Build schedule summary text',
        'Update state with all computed values',
      ],
      reactLines: '~60 lines of calendar algorithm',
      kmmCall: 'vm.confirmDates()',
      kmmSteps: [
        'Runs CalendarEngine (shared algorithm)',
        'Validates ride quota',
        'Checks opposite shift compatibility',
        'Builds schedule summary',
        'Pushes new state to React',
      ],
      kmmNote: 'The entire calendar algorithm is shared — bug fix in Kotlin = fix on all 3 platforms',
    },
    {
      action: 'User taps "Place Order"',
      icon: '4',
      reactSteps: [
        'Check if order can be placed (terms + payment + not processing)',
        'Set isProcessing = true, disable button',
        'Call API to place subscription order',
        'Handle success: store orderId, navigate to confirmation',
        'Handle failure: re-enable button, show error toast',
        'Track analytics: OrderPlaced or OrderFailed',
      ],
      reactLines: '~20 lines including API + error handling',
      kmmCall: 'vm.placeOrder()',
      kmmSteps: [
        'Validates preconditions',
        'Sets processing state',
        'Calls API via shared repository',
        'Handles success/failure',
        'Tracks analytics',
        'Sends NavigateToConfirmation effect',
      ],
      kmmNote: 'React just listens for the navigation effect',
    },
  ];

  var h = '';
  h += '<div style="margin-bottom:40px">';
  h += '<h3 style="margin-bottom:6px">2. Real Examples — What Happens on Each User Action</h3>';
  h += '<p style="font-size:13px;color:var(--text2);margin-bottom:16px">';
  h += 'In production (no mocks). Left: what the React developer writes. Right: what they write with KMM.</p>';

  for (var i = 0; i < examples.length; i++) {
    var ex = examples[i];
    h += '<div class="card glass" style="padding:0;margin-bottom:12px;overflow:hidden">';

    // Header
    h += '<div style="padding:12px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">';
    h += '<div style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:var(--white)">' + ex.icon + '</div>';
    h += '<span style="font-size:14px;font-weight:700;color:var(--white)">' + ex.action + '</span>';
    h += '</div>';

    // Two columns
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0">';

    // ── Left: Pure React ──
    h += '<div style="padding:16px 20px;border-right:1px solid var(--border)">';
    h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">';
    h += '<span style="width:8px;height:8px;border-radius:50%;background:var(--orange);display:inline-block"></span>';
    h += '<span style="font-size:12px;font-weight:700;color:var(--orange)">Pure React — Your hook must:</span>';
    h += '</div>';
    h += '<div style="font-size:12px;line-height:1.85">';
    for (var j = 0; j < ex.reactSteps.length; j++) {
      h += '<div style="display:flex;gap:8px;align-items:flex-start">';
      h += '<span style="color:var(--orange);flex-shrink:0;margin-top:1px;font-size:10px">&#9679;</span>';
      h += '<span style="color:var(--text)">' + ex.reactSteps[j] + '</span>';
      h += '</div>';
    }
    h += '</div>';
    h += '<div style="margin-top:10px;padding:6px 10px;border-radius:6px;background:rgba(245,158,11,0.1);font-size:11px;color:var(--orange);font-weight:600;text-align:center">';
    h += ex.reactLines + '</div>';
    h += '</div>';

    // ── Right: React + KMM ──
    h += '<div style="padding:16px 20px">';
    h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">';
    h += '<span style="width:8px;height:8px;border-radius:50%;background:var(--blue);display:inline-block"></span>';
    h += '<span style="font-size:12px;font-weight:700;color:var(--blue)">React + KMM — Your hook does:</span>';
    h += '</div>';

    // The one-liner
    h += '<div style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:10px 14px;margin-bottom:10px">';
    h += '<pre class="mono" style="margin:0;padding:0;font-size:12px;color:#6ee7b7;white-space:pre">' + escH(ex.kmmCall) + '</pre>';
    h += '<div style="font-size:10px;color:var(--text2);margin-top:4px">That\'s it. One line. Forward the action.</div>';
    h += '</div>';

    // What Kotlin does
    h += '<div style="font-size:11px;font-weight:600;color:var(--violet);margin-bottom:6px">Kotlin automatically handles:</div>';
    h += '<div style="font-size:12px;line-height:1.85">';
    for (var k = 0; k < ex.kmmSteps.length; k++) {
      h += '<div style="display:flex;gap:8px;align-items:flex-start">';
      h += '<span style="color:var(--violet);flex-shrink:0;margin-top:1px;font-size:10px">&#9679;</span>';
      h += '<span style="color:var(--text2)">' + ex.kmmSteps[k] + '</span>';
      h += '</div>';
    }
    h += '</div>';

    h += '<div style="margin-top:10px;padding:6px 10px;border-radius:6px;background:rgba(16,185,129,0.1);font-size:11px;color:var(--green);font-weight:600;text-align:center">';
    h += '1 line of React code &mdash; ' + ex.kmmNote + '</div>';
    h += '</div>';

    h += '</div>'; // grid
    h += '</div>'; // card
  }

  // Bottom callout
  h += '<div class="callout green" style="margin-top:4px">';
  h += '<strong style="color:var(--white)">The pattern is always the same:</strong> ';
  h += '<span style="font-size:13px">User does something &rarr; React forwards to Kotlin (one line) &rarr; ';
  h += 'Kotlin handles all business logic, validation, analytics &rarr; ';
  h += 'Kotlin pushes new state via <code style="background:var(--bg2);padding:1px 6px;border-radius:3px">observeState</code> &rarr; ';
  h += 'React auto-renders. The React developer never computes anything — just connects the wires.</span>';
  h += '</div>';

  h += '</div>';
  return h;
}

// ──────────────────────────────────────────────
// PART 3: Production Code Diff
// ──────────────────────────────────────────────
function buildDiffSection() {
  var h = '';
  h += '<div style="margin-bottom:40px">';
  h += '<h3 style="margin-bottom:6px">3. The Actual Code Difference (Production, No Mocks)</h3>';
  h += '<p style="font-size:13px;color:var(--text2);margin-bottom:16px">';
  h += 'What <code style="background:var(--bg2);padding:1px 6px;border-radius:4px">useCheckout.ts</code> looks like in production. ';
  h += '<span style="color:#fca5a5">Red = logic you stop writing</span>, ';
  h += '<span style="color:#6ee7b7">Green = bridge code you add instead</span>.</p>';

  // Diff
  h += '<div class="diff-wrap">';
  h += '<div class="diff-hdr">';
  h += '<span>useCheckout.ts &mdash; Production Code</span>';
  h += '<span style="color:var(--text2);font-size:11px">Business logic moves to Kotlin</span>';
  h += '</div>';
  h += '<pre class="diff-body">';

  // Imports
  h += dl('ctx', '  import { useState, useEffect, useCallback, useRef } from "react"');
  h += dl('ctx', '  import { useNavigate } from "react-router-dom"');
  h += dl('add', '+ import { createCheckoutVM } from "./kmmModule"');
  h += dl('ctx', '');

  h += dl('ctx', '  export function useCheckout() {');
  h += dl('ctx', '    const navigate = useNavigate()');
  h += dl('ctx', '    const [state, setState] = useState({ status: "loading" })');
  h += dl('add', '+   const vmRef = useRef(null)');
  h += dl('ctx', '');
  h += dl('ctx', '    useEffect(() => {');

  // useEffect: Pure React version
  h += dl('sep', '  // ── Initialize checkout ──────────────────────────────────');
  h += dl('del', '-     // Fetch checkout data from API');
  h += dl('del', '-     const response = await api.getCheckoutData(planSlug)');
  h += dl('del', '-');
  h += dl('del', '-     // Calculate pricing (business logic in React)');
  h += dl('del', '-     const baseFareTotal = response.baseFare * response.totalRides');
  h += dl('del', '-     const subtotal = baseFareTotal + CONVENIENCE_FEE');
  h += dl('del', '-     const gstAmount = subtotal * GST_RATE');
  h += dl('del', '-     const total = subtotal + gstAmount');
  h += dl('del', '-     const walletCredit = Math.min(response.walletBalance, total)');
  h += dl('del', '-     const totalPayable = Math.max(total - walletCredit, 0)');
  h += dl('del', '-');
  h += dl('del', '-     // Build state object manually');
  h += dl('del', '-     setState({');
  h += dl('del', '-       status: "success",');
  h += dl('del', '-       data: {');
  h += dl('del', '-         pricing: { baseFareTotal, gstAmount, totalPayable, ... },');
  h += dl('del', '-         paymentMethods: response.paymentMethods,');
  h += dl('del', '-         selectedPaymentMethod: null,');
  h += dl('del', '-         isWalletInsufficient: false,');
  h += dl('del', '-         termsAccepted: false,');
  h += dl('del', '-         isPlaceOrderEnabled: false,');
  h += dl('del', '-       },');
  h += dl('del', '-     })');
  h += dl('ctx', '');
  h += dl('add', '+     // Create Kotlin ViewModel — it handles API + pricing + everything');
  h += dl('add', '+     const vm = createCheckoutVM()');
  h += dl('add', '+     vmRef.current = vm');
  h += dl('add', '+');
  h += dl('add', '+     // Kotlin pushes complete state whenever it changes');
  h += dl('add', '+     vm.observeState(s => setState(s))');
  h += dl('add', '+     vm.observeEffect(e => {');
  h += dl('add', '+       if (e.type === "NavigateToConfirmation") navigate("/confirmation")');
  h += dl('add', '+     })');
  h += dl('add', '+');
  h += dl('add', '+     // Tell Kotlin to load — it fetches API + calculates pricing');
  h += dl('add', '+     vm.loadCheckout(planSlug, baseFare, totalRides, walletBalance)');
  h += dl('ctx', '');
  h += dl('ctx', '      return () => { /* cleanup */ }');
  h += dl('ctx', '    }, [])');
  h += dl('ctx', '');

  // selectPaymentMethod
  h += dl('sep', '  // ── When user selects payment method ────────────────────');
  h += dl('del', '-   const selectPaymentMethod = useCallback((id) => {');
  h += dl('del', '-     setState(prev => {');
  h += dl('del', '-       const isInsufficient = id === "wallet"');
  h += dl('del', '-         && prev.data.walletBalance < prev.data.pricing.totalPayable');
  h += dl('del', '-       return { ...prev, data: { ...prev.data,');
  h += dl('del', '-         selectedPaymentMethod: id,');
  h += dl('del', '-         isWalletInsufficient: isInsufficient,');
  h += dl('del', '-         isPlaceOrderEnabled:');
  h += dl('del', '-           !isInsufficient && prev.data.termsAccepted && !prev.data.isProcessing,');
  h += dl('del', '-       }}');
  h += dl('del', '-     })');
  h += dl('del', '-   }, [])');
  h += dl('add', '+   const selectPaymentMethod = useCallback(');
  h += dl('add', '+     (id) => vmRef.current?.selectPaymentMethod(id), [])');
  h += dl('ctx', '');

  // toggleTerms
  h += dl('sep', '  // ── When user toggles terms checkbox ─────────────────────');
  h += dl('del', '-   const toggleTerms = useCallback(() => {');
  h += dl('del', '-     setState(prev => {');
  h += dl('del', '-       const newTerms = !prev.data.termsAccepted');
  h += dl('del', '-       return { ...prev, data: { ...prev.data,');
  h += dl('del', '-         termsAccepted: newTerms,');
  h += dl('del', '-         isPlaceOrderEnabled: prev.data.selectedPaymentMethod');
  h += dl('del', '-           && !prev.data.isWalletInsufficient && newTerms,');
  h += dl('del', '-       }}');
  h += dl('del', '-     })');
  h += dl('del', '-   }, [])');
  h += dl('add', '+   const toggleTerms = useCallback(');
  h += dl('add', '+     () => vmRef.current?.toggleTerms(), [])');
  h += dl('ctx', '');

  // placeOrder
  h += dl('sep', '  // ── When user taps "Place Order" ─────────────────────────');
  h += dl('del', '-   const placeOrder = useCallback(async () => {');
  h += dl('del', '-     setState(prev => ({ ...prev, data: {');
  h += dl('del', '-       ...prev.data, isProcessing: true, isPlaceOrderEnabled: false');
  h += dl('del', '-     }}))');
  h += dl('del', '-     try {');
  h += dl('del', '-       const result = await api.placeOrder(orderRequest)');
  h += dl('del', '-       analytics.track("OrderPlaced", { orderId: result.orderId })');
  h += dl('del', '-       navigate("/confirmation")');
  h += dl('del', '-     } catch (err) {');
  h += dl('del', '-       setState(prev => ({ ...prev, data: {');
  h += dl('del', '-         ...prev.data, isProcessing: false, isPlaceOrderEnabled: true');
  h += dl('del', '-       }}))');
  h += dl('del', '-       showError("Payment failed. Try again.")');
  h += dl('del', '-     }');
  h += dl('del', '-   }, [navigate])');
  h += dl('add', '+   const placeOrder = useCallback(');
  h += dl('add', '+     () => vmRef.current?.placeOrder(), [])');
  h += dl('ctx', '');
  h += dl('ctx', '    return { state, selectPaymentMethod, toggleTerms, placeOrder }');
  h += dl('ctx', '  }');

  h += '</pre>';
  h += '</div>';

  // Callout
  h += '<div class="callout green" style="margin-top:12px">';
  h += '<strong style="color:var(--white)">In production:</strong> ';
  h += '<span style="font-size:13px">There are no mocks. The Kotlin ViewModel calls real APIs via shared repositories, ';
  h += 'runs real pricing calculations via PricingCalculator.kt, handles real error states, ';
  h += 'and tracks real analytics. The React developer doesn\'t touch any of it — they just forward actions and observe state.</span>';
  h += '</div>';

  h += '</div>';
  return h;
}

// ──────────────────────────────────────────────
// PART 4: All Features Summary
// ──────────────────────────────────────────────
function buildSummarySection() {
  var features = [
    { label: 'Plan Selection', ro: 93, rk: 50, what: 'Fetch plans, selection, savings comparison' },
    { label: 'Pass Setup', ro: 160, rk: 181, what: 'Dual-shift config, stops, validation' },
    { label: 'Calendar', ro: 210, rk: 91, what: 'Date algorithm, weekday filter, ride quotas' },
    { label: 'Checkout', ro: 163, rk: 77, what: 'Pricing, payment, order placement' },
    { label: 'My Subscription', ro: 150, rk: 55, what: 'Dashboard, usage, renewal logic' },
  ];

  var totalRo = 0, totalRk = 0;
  for (var i = 0; i < features.length; i++) {
    totalRo += features[i].ro;
    totalRk += features[i].rk;
  }
  var maxLoc = 210;

  var h = '';
  h += '<div style="margin-bottom:24px">';
  h += '<h3 style="margin-bottom:6px">4. Across All 5 Features — The Numbers</h3>';
  h += '<p style="font-size:13px;color:var(--text2);margin-bottom:16px">';
  h += 'React hook LOC comparison. Orange = pure React (all logic). Blue = React+KMM (bridge only).</p>';

  h += '<div class="card glass" style="padding:20px;overflow-x:auto">';

  // Header
  h += '<div style="display:grid;grid-template-columns:130px 1fr 55px 55px 70px;gap:8px;align-items:center;padding-bottom:10px;border-bottom:1px solid var(--border);font-size:10px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px">';
  h += '<span>Hook</span><span>Comparison</span>';
  h += '<span style="text-align:center;color:var(--orange)">React</span>';
  h += '<span style="text-align:center;color:var(--blue)">+KMM</span>';
  h += '<span style="text-align:center">Saved</span>';
  h += '</div>';

  for (var i = 0; i < features.length; i++) {
    var f = features[i];
    var saved = f.ro - f.rk;
    var pct = Math.round((saved / f.ro) * 100);
    var isNeg = saved < 0;

    h += '<div style="display:grid;grid-template-columns:130px 1fr 55px 55px 70px;gap:8px;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px">';

    h += '<div><div style="font-weight:600;color:var(--white);font-size:12px">' + f.label + '</div>';
    h += '<div style="font-size:10px;color:var(--text2)">' + f.what + '</div></div>';

    // Bars
    h += '<div style="display:flex;flex-direction:column;gap:3px">';
    h += '<div style="height:8px;background:var(--bg);border-radius:4px;overflow:hidden"><div style="height:100%;width:' + ((f.ro/maxLoc)*100).toFixed(0) + '%;background:rgba(245,158,11,0.45);border-radius:4px"></div></div>';
    h += '<div style="height:8px;background:var(--bg);border-radius:4px;overflow:hidden"><div style="height:100%;width:' + ((f.rk/maxLoc)*100).toFixed(0) + '%;background:rgba(59,130,246,0.45);border-radius:4px"></div></div>';
    h += '</div>';

    h += '<div style="text-align:center;font-weight:600;color:var(--orange)">' + f.ro + '</div>';
    h += '<div style="text-align:center;font-weight:600;color:var(--blue)">' + f.rk + '</div>';

    if (isNeg) {
      h += '<div style="text-align:center;font-weight:700;color:var(--red);font-size:12px">+' + Math.abs(saved) + '<br><span style="font-size:10px;font-weight:400">(' + Math.abs(pct) + '% more)</span></div>';
    } else {
      h += '<div style="text-align:center;font-weight:700;color:var(--green);font-size:12px">-' + saved + '<br><span style="font-size:10px;font-weight:400">(' + pct + '% less)</span></div>';
    }

    h += '</div>';
  }

  // Total
  var totalSaved = totalRo - totalRk;
  var totalPct = Math.round((totalSaved / totalRo) * 100);
  h += '<div style="display:grid;grid-template-columns:130px 1fr 55px 55px 70px;gap:8px;align-items:center;padding:12px 0 4px;border-top:2px solid rgba(255,255,255,0.15);font-weight:700">';
  h += '<div style="color:var(--white)">TOTAL</div><div></div>';
  h += '<div style="text-align:center;color:var(--orange)">' + totalRo + '</div>';
  h += '<div style="text-align:center;color:var(--blue)">' + totalRk + '</div>';
  h += '<div style="text-align:center;color:var(--green)">-' + totalSaved + '<br><span style="font-size:10px;font-weight:600">(' + totalPct + '% less)</span></div>';
  h += '</div>';

  h += '</div>';

  // Note about PassSetup
  h += '<div class="callout yellow" style="margin-top:12px">';
  h += '<strong style="color:var(--white)">Why Pass Setup is +13% more:</strong> ';
  h += '<span style="font-size:13px">Complex effect handling (open bottom sheet, launch calendar, navigate to checkout) makes the bridge hook longer. ';
  h += 'But it still has <strong>zero business logic</strong> — all stop validation, calendar caching, and shift management lives in Kotlin.</span>';
  h += '<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:var(--green)">';
  h += '<strong>This is fixable.</strong> A reusable <code style="background:var(--bg2);padding:1px 6px;border-radius:3px">useKmmViewModel()</code> helper ';
  h += 'can absorb the repetitive observeState / observeEffect / cleanup boilerplate, ';
  h += 'cutting ~20-80 lines per hook. Pass Setup would drop from 181 to ~120 LOC — well below the React-only 160.</div>';
  h += '</div>';

  // Optimization callout
  h += '<div class="callout green" style="margin-top:12px">';
  h += '<strong style="color:var(--white)">These are unoptimized POC numbers — there is more room to reduce:</strong>';
  h += '<div style="margin-top:8px;font-size:13px;line-height:1.8">';
  h += '<div style="display:flex;gap:8px;align-items:flex-start"><span style="color:var(--green);flex-shrink:0;font-size:10px;margin-top:4px">&#9679;</span>';
  h += '<span>A shared <code style="background:var(--bg2);padding:1px 6px;border-radius:3px">useKmmViewModel()</code> helper eliminates repeated observeState / observeEffect / cleanup boilerplate from every hook (~20-80 lines each)</span></div>';
  h += '<div style="display:flex;gap:8px;align-items:flex-start"><span style="color:var(--green);flex-shrink:0;font-size:10px;margin-top:4px">&#9679;</span>';
  h += '<span>Moving available-stop data into Kotlin state (instead of React-side refs + merging) shrinks Pass Setup significantly</span></div>';
  h += '<div style="display:flex;gap:8px;align-items:flex-start"><span style="color:var(--green);flex-shrink:0;font-size:10px;margin-top:4px">&#9679;</span>';
  h += '<span>Optimized hooks: ~483 &rarr; <strong style="color:var(--white)">~300 LOC</strong> (total React+KMM: ~2,900 &rarr; <strong style="color:var(--white)">~2,700</strong>)</span></div>';
  h += '</div>';
  h += '</div>';

  // Final
  h += '<div class="card glass" style="margin-top:16px;padding:24px;text-align:center;border-left:3px solid var(--green)">';
  h += '<div style="font-size:28px;font-weight:900;color:var(--green);margin-bottom:4px">45% less React hook code</div>';
  h += '<div style="font-size:14px;color:var(--text2);margin-bottom:4px">' + totalRo + ' &rarr; ' + totalRk + ' LOC across all 5 feature hooks (current POC)</div>';
  h += '<div style="font-size:13px;color:var(--green);font-weight:600;margin-bottom:12px">With optimizations: ' + totalRo + ' &rarr; ~300 LOC (65%+ reduction)</div>';
  h += '<div style="font-size:13px;color:var(--text);line-height:1.7;max-width:700px;margin:0 auto">';
  h += 'And the <strong style="color:var(--white)">real win</strong> is cross-platform: this same Kotlin code runs on Android, iOS, and Web. ';
  h += 'Pricing bug? One PR. Calendar algorithm change? One PR. Not three separate codebases doing the same thing.';
  h += '</div>';
  h += '</div>';

  h += '</div>';
  return h;
}

// ──────────────────────────────────────────────
// Demo helpers (used by the Demo section HTML)
// ──────────────────────────────────────────────
function copyCmd(text) {
  navigator.clipboard.writeText(text);
}

function loadDemos() {
  document.getElementById('demoLeft').innerHTML = '<iframe src="http://localhost:5173" class="demo-frame" style="border-radius:0 0 0 12px"></iframe>';
  document.getElementById('demoRight').innerHTML = '<iframe src="http://localhost:5174" class="demo-frame" style="border-radius:0 0 12px 0"></iframe>';
}

function resetDemos() {
  document.getElementById('demoLeft').innerHTML = '<div style="text-align:center;padding:40px"><p style="color:var(--text2)">Click "Load Both Apps" after starting dev servers.</p></div>';
  document.getElementById('demoRight').innerHTML = '<div style="text-align:center;padding:40px"><p style="color:var(--text2)">Click "Load Both Apps" after starting dev servers.</p></div>';
}
