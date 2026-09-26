import { useEffect, useState } from 'react';
import type { BucketListItem } from '../types/bucket';
import { getBucketImageUrl } from '../utils/storage';

interface BucketCardProps {
  item: BucketListItem;
  onToggleComplete: (id: string) => Promise<boolean> | void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<boolean> | void;
}

function BucketCard({
  item,
  onToggleComplete,
  onEdit,
  onDelete,
}: BucketCardProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadImage = async () => {
      if (!item.imageKey) {
        setImageUrl('');
        return;
      }

      try {
        setImageLoading(true);
        const url = await getBucketImageUrl(item.imageKey);

        if (!cancelled) {
          setImageUrl(url);
        }
      } catch (error) {
        console.error('Failed to load bucket image:', error);
        if (!cancelled) {
          setImageUrl('');
        }
      } finally {
        if (!cancelled) {
          setImageLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      cancelled = true;
    };
  }, [item.imageKey]);

  const handleToggle = async () => {
    if (toggling) return;
    try {
      setToggling(true);
      await onToggleComplete(item.id);
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      await onDelete(item.id);
    } finally {
      setDeleting(false);
    }
  };

  // Format human-friendly target date
  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const dateObj = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        );
        return dateObj.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatDisplayDate(item.targetDate);
  const isOverdue =
    !item.completed &&
    item.targetDate &&
    new Date(item.targetDate).getTime() < new Date().setHours(0, 0, 0, 0);

  const priorityKey = (item.priority || 'MEDIUM').toLowerCase();

  return (
    <article
      className={`card-container ${
        item.completed ? 'card-completed-border' : ''
      }`}
    >
      {/* Cover Media Section */}
      <div className="card-media-wrap">
        {imageLoading ? (
          <div className="card-media-placeholder">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="loader-spinner"
              style={{ width: '24px', height: '24px' }}
            >
              <circle cx="12" cy="12" r="10" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            <span>Loading image...</span>
          </div>
        ) : imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={item.title}
              className="card-media-img"
              loading="lazy"
            />
            <div className="card-media-overlay" />
          </>
        ) : (
          <div className="card-media-placeholder">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            <span>{item.category || 'Bucket List Goal'}</span>
          </div>
        )}

        {/* Floating Top Badges */}
        <div className="card-floating-badges">
          {item.category ? (
            <span className="card-category-badge">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              {item.category}
            </span>
          ) : (
            <span />
          )}

          <span className={`card-priority-badge ${priorityKey}`}>
            {item.priority || 'MEDIUM'}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        {/* Title row with 1-click checkbox */}
        <div className="card-title-row">
          <button
            type="button"
            className={`card-check-toggle ${item.completed ? 'checked' : ''}`}
            onClick={handleToggle}
            title={item.completed ? 'Mark incomplete' : 'Mark completed'}
            aria-label={
              item.completed
                ? `Mark ${item.title} incomplete`
                : `Mark ${item.title} complete`
            }
            disabled={toggling}
          >
            {item.completed && (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>

          <h3
            className={`card-title ${
              item.completed ? 'card-completed-title' : ''
            }`}
          >
            {item.title}
          </h3>
        </div>

        {/* Description */}
        {item.description ? (
          <p
            className={`card-description ${
              item.completed ? 'card-completed-text' : ''
            }`}
          >
            {item.description}
          </p>
        ) : (
          <div style={{ flexGrow: 1 }} />
        )}

        {/* Meta row: Date and status */}
        <div className="card-meta-row">
          {formattedDate ? (
            <div
              className={`card-meta-item ${
                isOverdue ? 'card-meta-date-overdue' : ''
              }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>
                {isOverdue ? `Overdue (${formattedDate})` : formattedDate}
              </span>
            </div>
          ) : (
            <div />
          )}

          {item.completed && (
            <span className="card-status-pill">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Achieved
            </span>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="card-footer">
          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling}
            className={`card-action-btn complete-toggle ${
              item.completed ? 'is-completed' : ''
            }`}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{item.completed ? 'Completed' : 'Mark Done'}</span>
          </button>

          <div className="card-actions-group">
            <button
              type="button"
              onClick={() => onEdit(item.id)}
              className="card-action-btn"
              title="Edit item"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="card-delete-btn"
              title="Delete item"
              aria-label={`Delete ${item.title}`}
            >
              {deleting ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="loader-spinner"
                  style={{ width: '14px', height: '14px' }}
                >
                  <circle cx="12" cy="12" r="10" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default BucketCard;