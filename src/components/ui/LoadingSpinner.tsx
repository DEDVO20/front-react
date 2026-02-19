import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// ─── Paleta institucional IUDC ───────────────────────────────────────────────
const UC_YELLOW = '#FFCC00'; // Supernova — amarillo institucional
const UC_RED = '#D72828'; // Rojo institucional
const UC_BLUE = '#1A2340'; // Azul marino oscuro
const UC_WHITE = '#FFFFFF';
// ─────────────────────────────────────────────────────────────────────────────

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando...',
  fullScreen = true,
  size = 'lg',
}) => {
  const logoSize = { sm: 56, md: 72, lg: 96 }[size];
  const ringSize = { sm: 100, md: 128, lg: 168 }[size];
  const ring2Size = { sm: 80, md: 102, lg: 136 }[size];

  return (
    <div
      className={`flex flex-col items-center justify-center gap-8 ${fullScreen ? 'min-h-screen' : 'py-16'
        }`}
      style={{ background: fullScreen ? UC_BLUE : 'transparent' }}
    >
      {/* ── Anillos orbitales + logo IUDC ─────────────────────── */}
      <div className="relative flex items-center justify-center">

        {/* Anillo exterior — amarillo */}
        <div
          style={{
            position: 'absolute',
            width: ringSize,
            height: ringSize,
            borderRadius: '50%',
            border: `3px solid ${UC_YELLOW}30`,
            borderTopColor: UC_YELLOW,
            borderRightColor: UC_YELLOW,
            animation: 'iudc-spin 1.4s linear infinite',
          }}
        />

        {/* Anillo medio — rojo */}
        <div
          style={{
            position: 'absolute',
            width: ring2Size,
            height: ring2Size,
            borderRadius: '50%',
            border: `2px solid ${UC_RED}25`,
            borderBottomColor: UC_RED,
            borderLeftColor: UC_RED,
            animation: 'iudc-spin 2s linear infinite reverse',
          }}
        />

        {/* Puntos orbitales — 5 chispas en amarillo */}
        {[0, 72, 144, 216, 288].map((deg, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: ringSize,
              height: ringSize,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              transform: `rotate(${deg}deg)`,
              animation: 'iudc-spin 1.4s linear infinite',
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                marginTop: -3.5,
                borderRadius: '50%',
                background: i % 2 === 0 ? UC_YELLOW : UC_RED,
                opacity: 0.5 + i * 0.1,
                animation: `iudc-pop 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.28}s`,
              }}
            />
          </div>
        ))}

        {/* ── Logo institucional centrado con pulso ── */}
        <div
          style={{
            width: logoSize,
            height: logoSize,
            borderRadius: '50%',
            background: UC_WHITE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 0 4px ${UC_YELLOW}40, 0 0 24px ${UC_YELLOW}30, 0 4px 20px rgba(0,0,0,0.4)`,
            animation: 'iudc-pulse 2.4s ease-in-out infinite',
            overflow: 'hidden',
            padding: 6,
          }}
        >
          <img
            src="/iudc-icon.png"
            alt="Universitaria de Colombia"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* ── Nombre institucional ───────────────────────────────── */}
      <div className="flex flex-col items-center gap-2">
        {/* Línea decorativa */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{ width: 28, height: 1.5, background: `linear-gradient(90deg, transparent, ${UC_YELLOW})` }} />
          <span style={{
            color: UC_YELLOW,
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            fontWeight: 700,
            fontSize: '0.65rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}>
            Universitaria de Colombia
          </span>
          <div style={{ width: 28, height: 1.5, background: `linear-gradient(90deg, ${UC_YELLOW}, transparent)` }} />
        </div>
        <span style={{
          color: `${UC_WHITE}50`,
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          fontWeight: 400,
          fontSize: '0.6rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}>
          Sistema de Gestión de Calidad
        </span>
      </div>

      {/* ── Mensaje + barra + puntos ───────────────────────────── */}
      {message && (
        <div className="flex flex-col items-center gap-3">
          <p style={{
            color: UC_WHITE,
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            fontSize: '0.95rem',
            fontWeight: 600,
            letterSpacing: '0.02em',
            animation: 'iudc-pulse 2s ease-in-out infinite',
          }}>
            {message}
          </p>

          {/* Barra de progreso indeterminada */}
          <div style={{
            width: 180,
            height: 3,
            background: `${UC_WHITE}10`,
            borderRadius: 9999,
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: 0, left: '-50%',
              width: '45%',
              height: '100%',
              background: `linear-gradient(90deg, ${UC_RED}, ${UC_YELLOW})`,
              borderRadius: 9999,
              animation: 'iudc-slide 1.6s ease-in-out infinite',
            }} />
          </div>

          {/* Puntos bouncing con colores institucionales */}
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            {[UC_RED, UC_YELLOW, UC_WHITE, UC_YELLOW, UC_RED].map((color, i) => (
              <div
                key={i}
                style={{
                  width: i === 2 ? 9 : 5,
                  height: i === 2 ? 9 : 5,
                  borderRadius: '50%',
                  background: color,
                  opacity: 0.4,
                  animation: 'iudc-dot 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.14}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Keyframes ─────────────────────────────────────────── */}
      <style>{`
        @keyframes iudc-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes iudc-pulse {
          0%, 100% { opacity: 1;    transform: scale(1);    }
          50%       { opacity: 0.8; transform: scale(0.96); }
        }
        @keyframes iudc-pop {
          0%, 100% { transform: scale(0.6); opacity: 0.2; }
          50%       { transform: scale(1.4); opacity: 1;   }
        }
        @keyframes iudc-slide {
          0%   { left: -50%; }
          100% { left: 110%; }
        }
        @keyframes iudc-dot {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.2; }
          40%           { transform: scale(1.3); opacity: 1;   }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
