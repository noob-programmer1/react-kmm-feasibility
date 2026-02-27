interface UpcomingRideCardProps {
  date: string
  dayLabel: string
  pickupStop: string
  pickupTime: string
  dropOffStop: string
  dropOffTime: string
  shift: 'Morning' | 'Evening'
}

export default function UpcomingRideCard({
  date,
  dayLabel,
  pickupStop,
  pickupTime,
  dropOffStop,
  dropOffTime,
  shift,
}: UpcomingRideCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Date badge */}
          <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-primary-50">
            <span className="text-xs font-bold text-primary leading-none">{date}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{dayLabel}</p>
          </div>
        </div>

        {/* Shift badge */}
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            shift === 'Morning'
              ? 'bg-warning-light text-warning'
              : 'bg-primary-50 text-primary'
          }`}
        >
          {shift === 'Morning' ? '\u2600\uFE0F' : '\uD83C\uDF19'}
          {shift}
        </span>
      </div>

      {/* Route */}
      <div className="relative pl-6">
        {/* Vertical connector */}
        <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-gray-200" />

        {/* Pickup */}
        <div className="relative mb-3">
          <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full border-2 border-success bg-surface" />
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-primary">{pickupStop}</p>
            <span className="text-xs font-medium text-text-secondary">{pickupTime}</span>
          </div>
        </div>

        {/* Drop-off */}
        <div className="relative">
          <div className="absolute -left-6 top-0.5 w-3 h-3 rounded-full border-2 border-danger bg-surface" />
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-primary">{dropOffStop}</p>
            <span className="text-xs font-medium text-text-secondary">{dropOffTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
