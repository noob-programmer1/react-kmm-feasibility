interface ShiftTabProps {
  activeTab: 'MORNING' | 'EVENING'
  onTabChange: (tab: 'MORNING' | 'EVENING') => void
  showEvening: boolean
}

export default function ShiftTab({ activeTab, onTabChange, showEvening }: ShiftTabProps) {
  return (
    <div className="flex border-b border-border">
      {/* Morning tab */}
      <button
        onClick={() => onTabChange('MORNING')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium
                     transition-colors relative ${
          activeTab === 'MORNING'
            ? 'text-primary'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        <span className="text-base" role="img" aria-label="Morning">
          &#9728;&#65039;
        </span>
        Morning
        {activeTab === 'MORNING' && (
          <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
        )}
      </button>

      {/* Evening tab */}
      {showEvening && (
        <button
          onClick={() => onTabChange('EVENING')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium
                       transition-colors relative ${
            activeTab === 'EVENING'
              ? 'text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span className="text-base" role="img" aria-label="Evening">
            &#127769;
          </span>
          Evening
          {activeTab === 'EVENING' && (
            <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      )}
    </div>
  )
}
