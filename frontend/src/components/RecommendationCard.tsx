import { InsightRecommendation } from '../types'

interface RecommendationCardProps {
  recommendation: InsightRecommendation
  className?: string
}

const RecommendationCard = ({
  recommendation,
  className = '',
}: RecommendationCardProps) => {
  // Map recommendation types to styles and icons
  const typeStyles: Record<string, { 
    bgColor: string, 
    textColor: string,
    icon: JSX.Element
  }> = {
    reduction: {
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    shift: {
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
    },
    optimization: {
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },
    general: {
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-purple-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
  }

  const { bgColor, textColor, icon } = typeStyles[recommendation.type] || typeStyles.general

  return (
    <div className={`${bgColor} ${textColor} rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-base">{recommendation.title}</h3>
          <p className="mt-1 text-sm">{recommendation.description}</p>
        </div>
      </div>
    </div>
  )
}

export default RecommendationCard