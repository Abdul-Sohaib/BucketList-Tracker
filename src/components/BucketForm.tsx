import React, { useEffect, useRef, useState } from 'react';
import type { BucketListItem, BucketPriority } from '../types/bucket';
import { getBucketImageUrl } from '../utils/storage';

interface BucketFormProps {
  initialData?: Partial<BucketListItem>;
  onSubmit: (
    title: string,
    description: string,
    category: string,
    priority: BucketPriority,
    targetDate: string,
    imageFile: File | null
  ) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
}

const CATEGORY_SUGGESTIONS = [
  'Travel',
  'Adventure',
  'Learning & Career',
  'Health & Fitness',
  'Creative & Art',
  'Finance & Wealth',
  'Personal & Life',
];

function BucketForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Goal',
}: BucketFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(
    initialData?.description ?? ''
  );
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [priority, setPriority] = useState<BucketPriority>(
    initialData?.priority ?? 'MEDIUM'
  );
  const [targetDate, setTargetDate] = useState(initialData?.targetDate ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Load existing image when editing an existing item.
   */
  useEffect(() => {
    let cancelled = false;

    const loadExistingImage = async () => {
      if (!initialData?.imageKey) {
        setImagePreview('');
        return;
      }

      try {
        const url = await getBucketImageUrl(initialData.imageKey);
        if (!cancelled) {
          setImagePreview(url);
        }
      } catch (err) {
        console.error('Failed to load existing image:', err);
      }
    };

    loadExistingImage();

    return () => {
      cancelled = true;
    };
  }, [initialData?.imageKey]);

  /**
   * Create local preview for newly selected file.
   */
  useEffect(() => {
    if (!imageFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  const validateAndSetFile = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setError('Please select a JPG, PNG, or WebP image format.');
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      setError('Image size must be less than 5 MB.');
      return false;
    }

    setError('');
    setImageFile(file);
    return true;
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    validateAndSetFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Goal title is required.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(
        title.trim(),
        description.trim(),
        category.trim(),
        priority,
        targetDate,
        imageFile
      );
    } catch (err) {
      console.error('Submission error:', err);
      setError('An error occurred while saving your item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-card glass-panel">
      {/* Form Header */}
      <div className="form-card-header">
        <h2 className="form-title">
          {initialData?.id ? 'Edit Bucket Item' : 'New Bucket List Dream'}
        </h2>
        <p className="form-subtitle">
          {initialData?.id
            ? 'Refine your aspirations, update deadlines or change cover photography.'
            : 'Capture a meaningful goal, travel destination, or life experience.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        {/* Error Alert */}
        {error && (
          <div className="form-error-banner" role="alert">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Goal Title */}
        <div className="form-group-clean">
          <label className="form-label-clean" htmlFor="goal-title">
            Goal Title <span className="form-required-star">*</span>
          </label>
          <input
            id="goal-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Scuba diving in the Great Barrier Reef"
            className="form-input-clean"
            required
            disabled={submitting}
            maxLength={120}
          />
        </div>

        {/* 2-Column: Category & Target Date */}
        <div className="form-row-2col">
          <div className="form-group-clean">
            <label className="form-label-clean" htmlFor="goal-category">
              Category
            </label>
            <input
              id="goal-category"
              type="text"
              list="category-suggestions"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Travel, Learning, Adventure"
              className="form-input-clean"
              disabled={submitting}
            />
            <datalist id="category-suggestions">
              {CATEGORY_SUGGESTIONS.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div className="form-group-clean">
            <label className="form-label-clean" htmlFor="goal-target-date">
              Target Completion Date
            </label>
            <input
              id="goal-target-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="form-input-clean"
              disabled={submitting}
            />
          </div>
        </div>

        {/* Priority Segmented Button Group */}
        <div className="form-group-clean">
          <label className="form-label-clean">Priority Level</label>
          <div className="form-priority-selector" role="group" aria-label="Priority selector">
            <button
              type="button"
              className={`form-priority-btn ${
                priority === 'LOW' ? 'active-low' : ''
              }`}
              onClick={() => setPriority('LOW')}
              disabled={submitting}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
              Low
            </button>

            <button
              type="button"
              className={`form-priority-btn ${
                priority === 'MEDIUM' ? 'active-medium' : ''
              }`}
              onClick={() => setPriority('MEDIUM')}
              disabled={submitting}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Medium
            </button>

            <button
              type="button"
              className={`form-priority-btn ${
                priority === 'HIGH' ? 'active-high' : ''
              }`}
              onClick={() => setPriority('HIGH')}
              disabled={submitting}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              High
            </button>
          </div>
        </div>

        {/* Description / Notes */}
        <div className="form-group-clean">
          <label className="form-label-clean" htmlFor="goal-description">
            Description & Notes
          </label>
          <textarea
            id="goal-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What steps are required? Why does this goal inspire you?"
            rows={4}
            className="form-input-clean form-textarea-clean"
            disabled={submitting}
          />
        </div>

        {/* Cover Image Upload Area */}
        <div className="form-group-clean">
          <label className="form-label-clean">Cover Photography</label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            id="bucket-cover-file"
            disabled={submitting}
          />

          {imagePreview ? (
            <div className="form-preview-container">
              <img
                src={imagePreview}
                alt="Selected cover preview"
                className="form-preview-img"
              />
              <div className="form-preview-overlay">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="form-preview-btn btn-secondary"
                  disabled={submitting}
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Replace Photo
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="form-preview-btn btn-danger"
                  disabled={submitting}
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
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`form-upload-zone ${
                isDragging ? 'dragging-over' : ''
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileInputRef.current?.click();
                }
              }}
            >
              <div className="form-upload-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <span className="form-upload-prompt">
                Click to upload cover photo, or drag and drop
              </span>
              <span className="form-upload-hint">
                JPG, PNG, or WebP format · Maximum 5 MB
              </span>
            </div>
          )}
        </div>

        {/* Form Actions Bar */}
        <div className="form-actions-bar">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="form-btn-cancel"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="form-btn-submit"
          >
            {submitting ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="loader-spinner"
                  style={{ width: '16px', height: '16px' }}
                >
                  <circle cx="12" cy="12" r="10" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
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
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span>{submitLabel}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BucketForm;