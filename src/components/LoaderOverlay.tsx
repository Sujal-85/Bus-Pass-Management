import React from 'react';

type LoaderOverlayProps = {
  show: boolean;
  message?: string;
  fullscreen?: boolean;
  absolute?: boolean;
};

const LoaderOverlay: React.FC<LoaderOverlayProps> = ({ show, message = 'Loading…', fullscreen = true, absolute = false }) => {
  if (!show) return null;

  const base: React.CSSProperties = fullscreen
    ? { position: 'fixed', inset: 0 }
    : absolute
    ? { position: 'absolute', inset: 0 }
    : { position: 'fixed', inset: 0 };

  return (
    <div role="status" aria-live="polite" style={{ ...base, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,250,252,0.85)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <img
          src="https://cdn-icons-png.flaticon.com/128/1992/1992901.png"
          alt="Loading"
          width={48}
          height={48}
          style={{ filter: 'grayscale(10%)' }}
        />
        <div style={{ color: '#334155', fontWeight: 600 }}>{message}</div>
      </div>
    </div>
  );
};

export default LoaderOverlay;


