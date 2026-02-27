interface PlanCardProps {
  name: string
  slug: string
  duration: string
  totalRides: number
  pricePerRide: number
  totalPrice: number
  isRoundTrip: boolean
  features: string[]
  savingsText?: string
  isSelected: boolean
  onSelect: () => void
}

function formatCurrency(amount: number): string {
  return `\u20B9${amount.toLocaleString('en-IN')}`
}

export default function PlanCard({
  name,
  slug: _slug,
  duration,
  totalRides,
  pricePerRide,
  totalPrice,
  isRoundTrip,
  features,
  savingsText,
  isSelected,
  onSelect,
}: PlanCardProps) {
  return (
    <div
      className={`relative rounded-xl border-2 p-4 transition-all duration-200 ${
        isSelected
          ? 'border-primary bg-primary-50 shadow-md'
          : 'border-border bg-surface hover:border-gray-300'
      }`}
    >
      {/* Savings badge */}
      {savingsText && (
        <div className="absolute -top-3 left-4">
          <span className="inline-block px-3 py-0.5 bg-success text-white text-xs font-semibold rounded-full">
            {savingsText}
          </span>
        </div>
      )}

      {/* Plan header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-text-primary">{name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-text-secondary">{duration}</span>
            <span className="w-1 h-1 rounded-full bg-text-muted" />
            <span className="text-xs text-text-secondary">{totalRides} rides</span>
            {isRoundTrip && (
              <>
                <span className="w-1 h-1 rounded-full bg-text-muted" />
                <span className="text-xs text-primary font-medium">Round Trip</span>
              </>
            )}
          </div>
        </div>

        {/* Selection indicator */}
        <div
          className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mt-0.5 ${
            isSelected ? 'border-primary bg-primary' : 'border-gray-300'
          }`}
        >
          {isSelected && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-text-primary">
          {formatCurrency(pricePerRide)}
        </span>
        <span className="text-sm text-text-secondary">/ride</span>
        <span className="ml-auto text-sm text-text-secondary">
          Total: {formatCurrency(totalPrice)}
        </span>
      </div>

      {/* Features */}
      {features.length > 0 && (
        <ul className="space-y-1.5 mb-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
              <svg
                className="w-4 h-4 text-success mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* Select button */}
      <button
        onClick={onSelect}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
          isSelected
            ? 'bg-primary text-white'
            : 'bg-surface text-primary border border-primary hover:bg-primary-50'
        }`}
      >
        {isSelected ? 'Selected \u2713' : 'Select Plan'}
      </button>
    </div>
  )
}
