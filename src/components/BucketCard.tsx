import type { BucketItem } from '../types/bucket';

interface BucketCardProps {
  item: BucketItem;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export const getCategoryTheme = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('travel') || cat.includes('trip') || cat.includes('visit') || cat.includes('world') || cat.includes('place')) {
    return {
      bg: 'rgba(129, 140, 248, 0.1)',
      color: '#818cf8',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      )
    };
  }
  if (cat.includes('adventure') || cat.includes('sport') || cat.includes('outdoor') || cat.includes('climb') || cat.includes('sky')) {
    return {
      bg: 'rgba(251, 191, 36, 0.1)',
      color: '#fbbf24',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 11l-5-5-5 5M17 18l-5-5-5 5" />
        </svg>
      )
    };
  }
  if (cat.includes('learn') || cat.includes('edu') || cat.includes('book') || cat.includes('skill') || cat.includes('career') || cat.includes('code') || cat.includes('study')) {
    return {
      bg: 'rgba(56, 189, 248, 0.1)',
      color: '#38bdf8',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    };
  }
  if (cat.includes('health') || cat.includes('fit') || cat.includes('gym') || cat.includes('run') || cat.includes('diet')) {
    return {
      bg: 'rgba(52, 211, 153, 0.1)',
      color: '#34d399',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    };
  }
  if (cat.includes('creative') || cat.includes('art') || cat.includes('music') || cat.includes('paint') || cat.includes('write')) {
    return {
      bg: 'rgba(244, 114, 182, 0.1)',
      color: '#f472b6',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.03459 19.176 5.109 19.4239 5.04566 19.667C4.9458 20.0504 4.85338 20.449 4.77884 20.8601C4.70889 21.246 4.96541 21.603 5.34758 21.6706C6.73274 21.9157 8.16362 21.6669 9.5 21" />
        </svg>
      )
    };
  }
  if (cat.includes('finance') || cat.includes('money') || cat.includes('buy') || cat.includes('invest') || cat.includes('save') || cat.includes('house')) {
    return {
      bg: 'rgba(52, 211, 153, 0.1)',
      color: '#34d399',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    };
  }
  // Default
  return {
    bg: 'rgba(156, 163, 175, 0.1)',
    color: '#9ca3af',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  };
};

export default function BucketCard({ item, onToggleComplete, onDelete, onEdit }: BucketCardProps) {
  const theme = getCategoryTheme(item.category);

  // Days remaining calculation
  const getDaysRemainingText = () => {
    if (item.completed) return 'Accomplished!';
    
    const target = new Date(item.targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`;
    }
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    
    if (diffDays > 365) {
      const years = (diffDays / 365).toFixed(1);
      return `~${years} years left`;
    }
    
    return `${diffDays} days left`;
  };

  const isOverdue = !item.completed && new Date(item.targetDate) < new Date(new Date().setHours(0,0,0,0));

  return (
    <div
      className={`glass-panel card-container ${item.completed ? 'card-completed-border' : ''}`}
    >
      {/* Header Badges */}
      <div className="card-header">
        <span
          className="card-category-badge"
          style={{
            backgroundColor: theme.bg,
            color: theme.color,
          }}
        >
          {theme.icon}
          {item.category}
        </span>

        <span className={`badge badge-${item.priority.toLowerCase()}`}>
          {item.priority}
        </span>
      </div>

      {/* Title & Info Checkbox */}
      <div className="card-title-section">
        <label className="card-checkbox-container">
          <input
            type="checkbox"
            checked={item.completed}
            onChange={() => onToggleComplete(item.id)}
            className="card-checkbox-input"
          />
          <span
            className={`card-checkmark ${item.completed ? 'card-checkmark-checked' : ''}`}
          >
            {item.completed && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
        </label>

        <h3
          className={`card-title ${item.completed ? 'card-completed-title' : ''}`}
        >
          {item.title}
        </h3>
      </div>

      {/* Description */}
      <p
        className={`card-description ${item.completed ? 'card-completed-text' : ''}`}
      >
        {item.description}
      </p>

      {/* Footer Meta */}
      <div className="card-footer">
        <div className="card-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{item.targetDate}</span>
        </div>

        <span
          className="card-meta-item"
          style={{
            color: item.completed ? 'var(--color-success)' : isOverdue ? 'var(--color-accent)' : 'var(--text-secondary)',
            fontWeight: '600',
          }}
        >
          {getDaysRemainingText()}
        </span>
      </div>

      {/* Divider */}
      <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.04)', margin: '16px 0' }} />

      {/* Action Buttons */}
      <div className="card-actions">
        <button
          className="btn btn-secondary card-action-btn"
          onClick={() => onEdit(item.id)}
          title="Edit Dream"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>

        <button
          className="btn btn-danger card-action-btn card-delete-btn"
          onClick={() => onDelete(item.id)}
          style={{ marginLeft: 'auto' }}
          title="Delete Dream"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
}
