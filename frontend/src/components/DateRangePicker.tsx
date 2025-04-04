import { useState } from 'react'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onDateChange: (startDate: string, endDate: string) => void
  className?: string
}

const DateRangePicker = ({
  startDate,
  endDate,
  onDateChange,
  className = '',
}: DateRangePickerProps) => {
  const [start, setStart] = useState(startDate)
  const [end, setEnd] = useState(endDate)

  // Handle start date change
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value
    setStart(newStart)
    // Only update if end date is also set
    if (end) {
      onDateChange(newStart, end)
    }
  }

  // Handle end date change
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value
    setEnd(newEnd)
    // Only update if start date is also set
    if (start) {
      onDateChange(start, newEnd)
    }
  }

  // Generate preset options for common date ranges
  const handlePresetClick = (days: number) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // Format dates as ISO strings and extract the date part
    const newEnd = endDate.toISOString().split('T')[0]
    const newStart = startDate.toISOString().split('T')[0]

    setStart(newStart)
    setEnd(newEnd)
    onDateChange(newStart, newEnd)
  }

  return (
    <div className={`flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:space-x-4">
        <div className="mb-2 sm:mb-0">
          <label htmlFor="start-date" className="form-label">
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={start}
            onChange={handleStartChange}
            max={end}
            className="form-input"
          />
        </div>
        <div>
          <label htmlFor="end-date" className="form-label">
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={end}
            onChange={handleEndChange}
            min={start}
            max={new Date().toISOString().split('T')[0]}
            className="form-input"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2 sm:mt-6">
        <button
          type="button"
          onClick={() => handlePresetClick(7)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Last 7 Days
        </button>
        <button
          type="button"
          onClick={() => handlePresetClick(30)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Last 30 Days
        </button>
        <button
          type="button"
          onClick={() => handlePresetClick(90)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Last 90 Days
        </button>
      </div>
    </div>
  )
}

export default DateRangePicker