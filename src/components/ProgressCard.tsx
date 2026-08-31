import type { BucketItem } from '../types/bucket';

interface ProgressCardProps {
  items: BucketItem[];
}

export default function ProgressCard({ items }: ProgressCardProps) {
  const total = items.length;
  const completed = items.filter(item => item.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const highPriority = items.filter(item => item.priority === 'HIGH' && !item.completed).length;

  return (
    <div className="glass-panel progress-container">
      <h3 className="progress-header">Quest Analytics</h3>

      <div className="progress-section">
        <div className="progress-label">
          <span>Overall Accomplishment</span>
          <span className="progress-percent">{completionRate}%</span>
        </div>
        
        {/* Progress Bar Container */}
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill"
            style={{ 
              width: `${completionRate}%` 
            }}
          />
        </div>
      </div>

      {/* Grid of Mini Stats */}
      <div className="progress-stats-grid">
        <div className="progress-stat-box">
          <span className="progress-stat-val">{total}</span>
          <span className="progress-stat-label">Total Dreams</span>
        </div>

        <div className="progress-stat-box" style={{ borderColor: 'rgba(52, 211, 153, 0.2)' }}>
          <span className="progress-stat-val" style={{ color: 'var(--color-success)' }}>{completed}</span>
          <span className="progress-stat-label">Achieved</span>
        </div>

        <div className="progress-stat-box" style={{ borderColor: 'rgba(56, 189, 248, 0.2)' }}>
          <span className="progress-stat-val" style={{ color: 'var(--color-info)' }}>{pending}</span>
          <span className="progress-stat-label">In Progress</span>
        </div>

        <div className="progress-stat-box" style={{ borderColor: highPriority > 0 ? 'rgba(244, 114, 182, 0.3)' : undefined }}>
          <span className="progress-stat-val" style={{ color: highPriority > 0 ? 'var(--color-accent)' : 'var(--text-primary)' }}>{highPriority}</span>
          <span className="progress-stat-label">High Priority Urgent</span>
        </div>
      </div>
    </div>
  );
}
