interface LoadingSpinnerProps {
  message?: string
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="relative w-12 h-12">
        <div
          className="absolute inset-0 rounded-full border-4 border-primary-100"
        />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary
                     animate-spin"
        />
      </div>
      <p className="mt-4 text-sm text-text-secondary">{message}</p>
    </div>
  )
}
