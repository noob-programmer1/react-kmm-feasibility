import type { ReactNode } from 'react'

interface HeaderProps {
  title: string
  onBack?: () => void
  rightAction?: ReactNode
}

export default function Header({ title, onBack, rightAction }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border">
      <div className="flex items-center h-14 px-4">
        {/* Back button */}
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-9 h-9 -ml-1 rounded-full
                       hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Go back"
          >
            <svg
              className="w-5 h-5 text-text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <div className="w-9" />
        )}

        {/* Title */}
        <h1 className="flex-1 text-center text-lg font-semibold text-text-primary truncate mx-2">
          {title}
        </h1>

        {/* Right action */}
        {rightAction ? (
          <div className="flex items-center">{rightAction}</div>
        ) : (
          <div className="w-9" />
        )}
      </div>
    </header>
  )
}
