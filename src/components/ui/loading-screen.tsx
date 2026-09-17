'use client';

export function LoadingScreen({ message = 'Loading your office…' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-5">

        {/* NAK Digital Logo mark */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #0a2540, #142840)' }}>
            {/* NAK monogram */}
            <span className="text-3xl font-black tracking-tighter select-none"
              style={{ color: '#d4a017', fontFamily: 'var(--font-sans)' }}>
              NAK
            </span>
          </div>
          {/* Gold pulse ring */}
          <div className="absolute inset-0 rounded-2xl animate-gold-ring pointer-events-none" />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            NAK Digital
          </p>
          <p className="text-xs font-medium tracking-widest uppercase"
            style={{ color: 'var(--nak-gold)' }}>
            Virtual Office
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{message}</p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mt-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: 'var(--nak-gold)',
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
