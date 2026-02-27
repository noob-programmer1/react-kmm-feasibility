interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      {/* Error icon */}
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-danger-light mb-4">
        <svg
          className="w-8 h-8 text-danger"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-text-primary mb-1">{title}</h2>
      <p className="text-sm text-text-secondary mb-6 max-w-[280px]">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg
                     hover:bg-primary-dark active:scale-[0.98] transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
