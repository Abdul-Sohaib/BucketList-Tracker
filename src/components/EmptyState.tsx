interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onActionClick: () => void;
  showAction?: boolean;
}

export default function EmptyState({
  title = 'No dreams found',
  message = 'It looks like you do not have any items here yet. Start tracking your dreams today!',
  actionText = 'Conceive a Dream',
  onActionClick,
  showAction = true,
}: EmptyStateProps) {
  return (
    <div className="glass-panel empty-container">
      <div className="empty-icon-container">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="url(#emptyStateGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <defs>
            <linearGradient id="emptyStateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="10" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="12" y1="8" x2="12" y2="16" />
        </svg>
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-message">{message}</p>
      {showAction && (
        <button className="btn btn-primary empty-btn" onClick={onActionClick}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {actionText}
        </button>
      )}
    </div>
  );
}
