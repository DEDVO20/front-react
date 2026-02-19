import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando...',
  fullScreen = true,
  size = 'lg'
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${fullScreen ? 'min-h-screen bg-[#F5F7FA]' : 'py-16'}`}>
      {/* Animated spinner */}
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full border-4 border-[#E0EDFF] border-t-[#2563EB] animate-spin`} />
        <div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-4 border-transparent border-b-[#93C5FD] animate-spin`}
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
      </div>

      {/* Message */}
      {message && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-semibold text-[#1E3A8A] animate-pulse">
            {message}
          </p>
          {/* Animated dots */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${dotSizes[size]} rounded-full bg-[#2563EB]`}
                style={{
                  animation: 'bounce 1.4s infinite ease-in-out both',
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
