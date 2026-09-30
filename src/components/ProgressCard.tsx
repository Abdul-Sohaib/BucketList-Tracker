import type { BucketItem } from '../types/bucket';

interface ProgressCardProps {
  items: BucketItem[];
}

export default function ProgressCard({ items }: ProgressCardProps) {
  const total = items.length;
  const completed = items.filter((item) => item.completed).length;
  const inProgress = total - completed;
  const highPriority = items.filter(
    (item) => (item.priority || '').toUpperCase() === 'HIGH' && !item.completed
  ).length;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const displayPercentage = percentage;

  return (
    <section className="dq-progress-card">
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="font-label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
            Life Horizon Index
          </span>
          <h2 className="font-headline-sm" style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>
            Overall Expedition Accomplishment
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span className="font-display" style={{ color: 'var(--primary)', lineHeight: 1 }}>
            {displayPercentage}%
          </span>
          <span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>
            fulfillment quotient
          </span>
        </div>
      </div>

      {/* Segmented Tactile Progress Bar */}
      <div style={{ width: '100%' }}>
        <div className="dq-progress-bar-track">
          <div
            className="dq-progress-bar-fill"
            style={{ width: `${displayPercentage}%` }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.5rem',
            color: 'var(--on-surface-variant)',
          }}
          className="font-label-sm"
        >
          <span>Tethered Reality (0%)</span>
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
            {completed} Realized Chapters
          </span>
          <span>Sovereign Horizon (100%)</span>
        </div>
      </div>

      {/* 4-Column Metric Ledger Grid */}
      <div className="dq-metric-grid">
        {/* Total Dreams */}
        <div className="dq-metric-item">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--on-surface-variant)' }}>
            <span className="font-label-md" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Total Dreams
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>
              auto_stories
            </span>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span className="font-headline-md" style={{ color: 'var(--primary)' }}>
              {total}
            </span>
            <span className="font-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
              aspirations
            </span>
          </div>
        </div>

        {/* Achieved */}
        <div className="dq-metric-item">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--primary)' }}>
            <span className="font-label-md" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Achieved
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>
              verified
            </span>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span className="font-headline-md" style={{ color: 'var(--primary)' }}>
              {completed}
            </span>
            <span className="font-label-sm" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              realized ({percentage}%)
            </span>
          </div>
        </div>

        {/* In Progress */}
        <div className="dq-metric-item">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--on-surface-variant)' }}>
            <span className="font-label-md" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              In Progress
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--on-surface-variant)' }}>
              timelapse
            </span>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span className="font-headline-md" style={{ color: 'var(--on-surface)' }}>
              {inProgress}
            </span>
            <span className="font-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
              active pursuits
            </span>
          </div>
        </div>

        {/* High Priority */}
        <div className="dq-metric-item dq-metric-item-accent">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--secondary)' }}>
            <span className="font-label-md" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              High Priority
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--secondary)' }}>
              local_fire_department
            </span>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span className="font-headline-md" style={{ color: 'var(--secondary)' }}>
              {highPriority}
            </span>
            <span className="font-label-sm" style={{ color: 'var(--secondary)', fontWeight: 600 }}>
              urgent focus
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
