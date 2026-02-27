interface ShiftSummaryCardProps {
  shiftLabel: string
  pickupStop: string
  pickupTime: string
  dropOffStop: string
  dropOffTime: string
  rideCount: number
  scheduleSummary?: string
  onEdit?: () => void
}

export default function ShiftSummaryCard({
  shiftLabel,
  pickupStop,
  pickupTime,
  dropOffStop,
  dropOffTime,
  rideCount,
  scheduleSummary,
  onEdit,
}: ShiftSummaryCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">
            {shiftLabel.toLowerCase().includes('morning') ? '\u2600\uFE0F' : '\uD83C\uDF19'}
          </span>
          <h4 className="text-sm font-semibold text-text-primary">{shiftLabel}</h4>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {/* Route details */}
      <div className="relative pl-6 space-y-4">
        {/* Vertical connector line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />

        {/* Pickup */}
        <div className="relative">
          <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-success bg-surface" />
          <div>
            <p className="text-xs text-text-muted">Pickup</p>
            <p className="text-sm font-medium text-text-primary">{pickupStop}</p>
            <p className="text-xs text-text-secondary mt-0.5">{pickupTime}</p>
          </div>
        </div>

        {/* Drop-off */}
        <div className="relative">
          <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-danger bg-surface" />
          <div>
            <p className="text-xs text-text-muted">Drop-off</p>
            <p className="text-sm font-medium text-text-primary">{dropOffStop}</p>
            <p className="text-xs text-text-secondary mt-0.5">{dropOffTime}</p>
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="mt-3 pt-3 border-t border-border flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs text-text-secondary">{rideCount} rides</span>
        </div>
        {scheduleSummary && (
          <span className="text-xs text-text-muted">{scheduleSummary}</span>
        )}
      </div>
    </div>
  )
}
