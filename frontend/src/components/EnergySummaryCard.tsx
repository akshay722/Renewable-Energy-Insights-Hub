import { EnergySummary } from '../types'

interface EnergySummaryCardProps {
  summary: EnergySummary
  isLoading?: boolean
  className?: string
}

const EnergySummaryCard = ({
  summary,
  isLoading = false,
  className = '',
}: EnergySummaryCardProps) => {
  // Helper to format numbers nicely
  const formatValue = (value: number): string => {
    return value.toFixed(1)
  }

  // Calculate surplus/deficit
  const netEnergy = summary.total_generation - summary.total_consumption
  const isPositiveNet = netEnergy >= 0

  if (isLoading) {
    return (
      <div className={`card animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Energy Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Consumption Card */}
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-red-800">Consumption</h3>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-red-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {formatValue(summary.total_consumption)} kWh
          </p>
          <p className="text-sm text-red-800">
            Total energy consumed during period
          </p>
        </div>
        
        {/* Generation Card */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-green-800">Generation</h3>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-green-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
              />
            </svg>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {formatValue(summary.total_generation)} kWh
          </p>
          <p className="text-sm text-green-800">
            Total energy generated during period
          </p>
        </div>
        
        {/* Net Energy Card */}
        <div className={`${isPositiveNet ? 'bg-teal-50' : 'bg-amber-50'} p-4 rounded-lg`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-medium ${isPositiveNet ? 'text-teal-800' : 'text-amber-800'}`}>
              {isPositiveNet ? 'Net Surplus' : 'Net Deficit'}
            </h3>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-8 w-8 ${isPositiveNet ? 'text-teal-400' : 'text-amber-400'}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isPositiveNet ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              )}
            </svg>
          </div>
          <p className={`mt-2 text-2xl font-bold ${isPositiveNet ? 'text-teal-600' : 'text-amber-600'}`}>
            {formatValue(Math.abs(netEnergy))} kWh
          </p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full bg-primary" 
                style={{ width: `${Math.min(100, summary.renewable_percentage)}%` }}
              ></div>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {summary.renewable_percentage.toFixed(1)}% from renewable sources
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnergySummaryCard