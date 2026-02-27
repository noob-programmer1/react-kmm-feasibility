interface StatusStepperProps {
  currentStatus: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED'
}

const STEPS = [
  { key: 'ACTIVE' as const, label: 'Active' },
  { key: 'EXPIRING_SOON' as const, label: 'Expiring Soon' },
  { key: 'EXPIRED' as const, label: 'Expired' },
]

function getStepColor(stepKey: string, currentStatus: string): { dot: string; text: string } {
  const statusOrder = ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED']
  const currentIdx = statusOrder.indexOf(currentStatus)
  const stepIdx = statusOrder.indexOf(stepKey)

  if (stepIdx > currentIdx) {
    return { dot: 'bg-gray-200 border-gray-300', text: 'text-text-muted' }
  }

  switch (stepKey) {
    case 'ACTIVE':
      return { dot: 'bg-success border-success', text: 'text-success' }
    case 'EXPIRING_SOON':
      return { dot: 'bg-warning border-warning', text: 'text-warning' }
    case 'EXPIRED':
      return { dot: 'bg-danger border-danger', text: 'text-danger' }
    default:
      return { dot: 'bg-gray-200 border-gray-300', text: 'text-text-muted' }
  }
}

function getLineColor(fromKey: string, currentStatus: string): string {
  const statusOrder = ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED']
  const currentIdx = statusOrder.indexOf(currentStatus)
  const fromIdx = statusOrder.indexOf(fromKey)

  if (fromIdx >= currentIdx) {
    return 'bg-gray-200'
  }

  switch (fromKey) {
    case 'ACTIVE':
      return currentStatus === 'EXPIRING_SOON' ? 'bg-warning' : 'bg-danger'
    case 'EXPIRING_SOON':
      return 'bg-danger'
    default:
      return 'bg-gray-200'
  }
}

export default function StatusStepper({ currentStatus }: StatusStepperProps) {
  return (
    <div className="flex items-start justify-between px-2">
      {STEPS.map((step, index) => {
        const colors = getStepColor(step.key, currentStatus)
        const isCurrent = step.key === currentStatus

        return (
          <div key={step.key} className="flex items-start flex-1">
            {/* Step dot + label */}
            <div className="flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full border-2 ${colors.dot} ${
                  isCurrent ? 'ring-4 ring-opacity-20' : ''
                } ${
                  isCurrent && step.key === 'ACTIVE'
                    ? 'ring-success/20'
                    : isCurrent && step.key === 'EXPIRING_SOON'
                      ? 'ring-warning/20'
                      : isCurrent && step.key === 'EXPIRED'
                        ? 'ring-danger/20'
                        : ''
                }`}
              />
              <span
                className={`text-[10px] font-medium mt-1.5 text-center whitespace-nowrap ${
                  isCurrent ? `${colors.text} font-semibold` : colors.text
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div className="flex-1 flex items-center pt-[7px] px-1">
                <div className={`h-0.5 w-full rounded-full ${getLineColor(step.key, currentStatus)}`} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
