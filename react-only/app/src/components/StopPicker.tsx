import BottomSheet from './BottomSheet'

interface Stop {
  id: string
  name: string
  time: string
  area?: string
}

interface StopPickerProps {
  isOpen: boolean
  title: string
  stops: Stop[]
  selectedStopId?: string
  onSelect: (stop: Stop) => void
  onClose: () => void
}

export type { Stop }

export default function StopPicker({
  isOpen,
  title,
  stops,
  selectedStopId,
  onSelect,
  onClose,
}: StopPickerProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-1">
        {stops.map((stop) => {
          const isSelected = stop.id === selectedStopId
          return (
            <button
              key={stop.id}
              onClick={() => onSelect(stop)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                         transition-colors ${
                isSelected
                  ? 'bg-primary-50 border border-primary'
                  : 'hover:bg-surface-secondary border border-transparent'
              }`}
            >
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

              {/* Stop info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  isSelected ? 'text-primary' : 'text-text-primary'
                }`}>
                  {stop.name}
                </p>
                {stop.area && (
                  <p className="text-xs text-text-muted mt-0.5">{stop.area}</p>
                )}
              </div>

              {/* Time */}
              <span className={`text-sm font-medium shrink-0 ${
                isSelected ? 'text-primary' : 'text-text-secondary'
              }`}>
                {stop.time}
              </span>
            </button>
          )
        })}

        {stops.length === 0 && (
          <p className="text-center text-sm text-text-muted py-8">
            No stops available
          </p>
        )}
      </div>
    </BottomSheet>
  )
}
