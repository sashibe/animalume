type Props = {
  styleVariant?: 'orbit' | 'breath' | 'silhouette';
  label?: string;
};

export function AmLoader({ styleVariant = 'orbit', label = '結果を編んでいます' }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: 32 }}>
      {styleVariant === 'orbit' && (
        <div style={{ position: 'relative', width: 96, height: 96 }}>
          <div className="am-spin-slow" style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1px solid var(--border)',
            borderTopColor: 'var(--accent-gold)',
          }} />
          <div style={{
            position: 'absolute', inset: 12, borderRadius: '50%',
            border: '1px solid var(--border)',
            opacity: 0.55,
          }} />
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            width: 6, height: 6, borderRadius: 9999,
            background: 'var(--accent-gold)',
            transform: 'translate(-50%,-50%)',
            opacity: 0.8,
          }} />
        </div>
      )}

      {styleVariant === 'breath' && (
        <div style={{ position: 'relative', width: 96, height: 96 }}>
          <div className="am-breath" style={{
            position: 'absolute', inset: 8, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(217,165,160,.45) 0%, transparent 65%)',
            filter: 'blur(8px)',
          }} />
          <div className="am-breath" style={{
            position: 'absolute', inset: 20, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,181,160,.4) 0%, transparent 65%)',
            filter: 'blur(6px)',
            animationDelay: '600ms',
          }} />
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%,-50%)',
            width: 6, height: 6, borderRadius: 9999,
            background: 'var(--ink-mute)', opacity: 0.7,
          }} />
        </div>
      )}

      <div className="am-load-glyph" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ink-mute)',
        fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase',
      }}>
        <span style={{ height: 1, width: 24, background: 'currentColor' }} />
        <span>Loading</span>
        <span style={{ height: 1, width: 24, background: 'currentColor' }} />
      </div>

      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--ink-soft)' }}>
        {label}
      </div>
    </div>
  );
}
