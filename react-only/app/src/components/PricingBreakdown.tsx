interface PricingBreakdownProps {
  baseFarePerRide: number
  totalRides: number
  baseFareTotal: number
  convenienceFee: number
  gstRate: number
  gstAmount: number
  walletCredit: number
  totalPayable: number
}

function formatCurrency(amount: number): string {
  return `\u20B9${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export default function PricingBreakdown({
  baseFarePerRide,
  totalRides,
  baseFareTotal,
  convenienceFee,
  gstRate,
  gstAmount,
  walletCredit,
  totalPayable,
}: PricingBreakdownProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h4 className="text-sm font-semibold text-text-primary mb-3">Price Breakdown</h4>

      <div className="space-y-2.5">
        {/* Base fare */}
        <div className="flex items-start justify-between text-sm">
          <span className="text-text-secondary">
            Base fare ({formatCurrency(baseFarePerRide)} x {totalRides} rides)
          </span>
          <span className="text-text-primary font-medium shrink-0 ml-4">
            {formatCurrency(baseFareTotal)}
          </span>
        </div>

        {/* Convenience fee */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Convenience fee</span>
          <span className="text-text-primary font-medium">
            {formatCurrency(convenienceFee)}
          </span>
        </div>

        {/* GST */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">GST ({gstRate}%)</span>
          <span className="text-text-primary font-medium">
            {formatCurrency(gstAmount)}
          </span>
        </div>

        {/* Wallet credit */}
        {walletCredit > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-success">Wallet credit</span>
            <span className="text-success font-medium">
              -{formatCurrency(walletCredit)}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border my-1" />

        {/* Total payable */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-text-primary">Total Payable</span>
          <span className="text-base font-bold text-text-primary">
            {formatCurrency(totalPayable)}
          </span>
        </div>
      </div>
    </div>
  )
}
