import CompassEmblem from './CompassEmblem';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  submessage?: string;
  compact?: boolean;
}

export default function LoadingSpinner({
  fullScreen = false,
  message = 'Gathering your naturalist field ledger...',
  submessage = 'Connecting to DreamQuest archival cloud vault.',
  compact = false,
}: LoadingSpinnerProps) {
  if (compact) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', color: 'var(--primary)' }}>
        <CompassEmblem size={20} />
        <span className="font-label-md">{message}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '100vh' : '400px',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: 'var(--surface)',
      }}
      className="fade-in"
    >
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <CompassEmblem size={56} />
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: '9999px', backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface-variant)', marginBottom: '0.75rem' }} className="font-label-sm">
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--surface-tint)' }} />
        Synchronizing Vault
      </div>

      <h3 className="font-headline-sm" style={{ color: 'var(--primary)', marginBottom: '0.35rem' }}>
        {message}
      </h3>

      <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)', maxWidth: '320px' }}>
        {submessage}
      </p>
    </div>
  );
}
