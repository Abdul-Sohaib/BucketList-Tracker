interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onActionClick: () => void;
  showAction?: boolean;
}

export default function EmptyState({
  title = 'No aspirations recorded',
  message = 'Your naturalist ledger is clear. Catalog your next expedition before motivation fades.',
  actionText = 'Conceive Aspirations',
  onActionClick,
  showAction = true,
}: EmptyStateProps) {
  return (
    <div className="dq-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--primary)', marginBottom: '0.75rem', opacity: 0.8 }}>
        explore
      </span>
      <h3 className="font-headline-sm" style={{ color: 'var(--primary)', marginBottom: '0.35rem' }}>
        {title}
      </h3>
      <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '420px', margin: '0.25rem auto 1.5rem' }}>
        {message}
      </p>
      {showAction && (
        <button type="button" className="btn-dq-primary" onClick={onActionClick}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
