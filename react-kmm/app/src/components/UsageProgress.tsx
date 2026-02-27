interface UsageProgressProps {
  used: number
  total: number
  label?: string
}

export default function UsageProgress({ used, total, label }: UsageProgressProps) {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Determine color based on usage
  const getProgressColor = (): string => {
    if (percentage >= 90) return 'var(--color-danger)'
    if (percentage >= 70) return 'var(--color-warning)'
    return 'var(--color-primary)'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={getProgressColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-text-primary leading-none">
            {used}
          </span>
          <span className="text-xs text-text-muted mt-0.5">
            of {total}
          </span>
        </div>
      </div>

      {label && (
        <p className="mt-2 text-xs font-medium text-text-secondary">{label}</p>
      )}
    </div>
  )
}
