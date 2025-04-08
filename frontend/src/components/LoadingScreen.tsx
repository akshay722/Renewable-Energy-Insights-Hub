import React from "react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading your dashboard...",
}) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <div className="text-center">
        {/* Loading animation with solar panel and energy circles */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          {/* Central solar panel - slightly elevated to avoid overlap */}
          <div className="absolute inset-0 flex items-center justify-center mb-2">
            <svg
              className="w-20 h-20 animate-pulse z-10"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <line x1="6" y1="6" x2="6" y2="18" />
              <line x1="10" y1="6" x2="10" y2="18" />
              <line x1="14" y1="6" x2="14" y2="18" />
              <line x1="18" y1="6" x2="18" y2="18" />
              <line x1="2" y1="10" x2="22" y2="10" />
              <line x1="2" y1="14" x2="22" y2="14" />
            </svg>
          </div>

          {/* Animated sun rays */}
          <div className="absolute inset-0 w-full h-full">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-10 bg-primary-light rounded-full origin-bottom animate-ping"
                style={{
                  left: "calc(50% - 0.125rem)",
                  top: "-2.5rem",
                  opacity: 0.7,
                  animationDuration: `${1 + i * 0.1}s`,
                  animationDelay: `${i * 0.1}s`,
                  transform: `rotate(${i * 45}deg) translateY(-50%)`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-primary-dark mb-2">
          Renewable Energy Insights
        </h2>
        <p className="text-gray-600 mb-8">{message}</p>

        {/* Progress bar */}
        <div className="relative w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"
            style={{
              width: "100%",
              animationDuration: "2s",
            }}
          ></div>
        </div>

        {/* Loading dots */}
        <div className="mt-4 flex justify-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
