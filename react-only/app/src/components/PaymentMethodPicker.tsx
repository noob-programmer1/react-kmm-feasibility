interface PaymentMethod {
  id: string
  label: string
  description?: string
  icon: string
}

interface PaymentMethodPickerProps {
  methods: PaymentMethod[]
  selectedId?: string
  onSelect: (id: string) => void
  walletInsufficient?: boolean
}

export default function PaymentMethodPicker({
  methods,
  selectedId,
  onSelect,
  walletInsufficient,
}: PaymentMethodPickerProps) {
  return (
    <div className="space-y-2">
      {methods.map((method) => {
        const isSelected = method.id === selectedId
        const isWallet = method.id === 'wallet'
        const isDisabled = isWallet && walletInsufficient

        return (
          <button
            key={method.id}
            onClick={() => !isDisabled && onSelect(method.id)}
            disabled={isDisabled}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2
                       transition-all text-left ${
              isDisabled
                ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                : isSelected
                  ? 'border-primary bg-primary-50'
                  : 'border-border bg-surface hover:border-gray-300'
            }`}
          >
            {/* Icon */}
            <span className="text-xl shrink-0">{method.icon}</span>

            {/* Label and description */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                isSelected ? 'text-primary' : 'text-text-primary'
              }`}>
                {method.label}
              </p>
              {method.description && (
                <p className="text-xs text-text-muted mt-0.5">{method.description}</p>
              )}
              {isWallet && walletInsufficient && (
                <p className="text-xs text-danger mt-0.5">Insufficient balance</p>
              )}
            </div>

            {/* Radio indicator */}
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                isSelected ? 'border-primary' : 'border-gray-300'
              }`}
            >
              {isSelected && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
