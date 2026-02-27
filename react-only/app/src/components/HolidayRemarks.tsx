interface HolidayRemarksProps {
  remarks: string[]
  isExpanded: boolean
  onToggle: () => void
}

export default function HolidayRemarks({ remarks, isExpanded, onToggle }: HolidayRemarksProps) {
  if (remarks.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-surface-secondary overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50
                   transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-danger" />
          <span className="text-sm font-medium text-text-primary">
            Holidays ({remarks.length})
          </span>
        </div>

        <svg
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable list */}
      {isExpanded && (
        <div className="px-4 pb-3 border-t border-border">
          <ul className="space-y-2 mt-3">
            {remarks.map((remark, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
                {remark}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
