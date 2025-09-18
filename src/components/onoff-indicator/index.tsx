import React from 'react';

interface OnOffIndicatorProps {
  value: boolean;
  label?: string;
  className?: string;
}

export default function OnOffIndicator({
  value,
  label,
  className = '',
}: OnOffIndicatorProps) {
  const isOn = value;
  const statusText = isOn ? 'ON' : 'OFF';

  return (
    <>
      <style>{`
        @keyframes gentle-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.05;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.15;
          }
        }

        .pulse-ring {
          animation: gentle-pulse 3s ease-in-out infinite;
        }
      `}</style>

      <div
        className={`flex flex-col items-center justify-center h-full w-full p-4 ${className}`}
      >
        {/* Container principal com tamanho fixo proporcional */}
        <div
          className='relative flex items-center justify-center'
          style={{ width: '120px', height: '120px' }}
        >
          {/* Efeito de pulse/glow */}
          <div
            className={`absolute rounded-full pulse-ring ${
              isOn ? 'bg-green-400' : 'bg-red-400'
            }`}
            style={{
              width: '140px',
              height: '140px',
              boxShadow: `0 0 20px ${isOn ? '#10b981' : '#ef4444'}30`,
            }}
          />

          {/* Botão principal */}
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isOn
                ? 'bg-green-500 shadow-green-500/40'
                : 'bg-red-500 shadow-red-500/40'
            }`}
          >
            <span className='text-white font-bold text-lg'>{statusText}</span>
          </div>
        </div>

        {/* Label abaixo do botão */}
        {label && (
          <div className='mt-4 text-center'>
            <span
              className={`text-sm font-medium ${
                isOn ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {label}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
