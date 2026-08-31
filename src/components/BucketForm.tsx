import { useState, useEffect } from 'react';
import type { BucketPriority } from '../types/bucket';
import { validateBucket } from '../utils/validation';
import type { BucketFormErrors } from '../utils/validation';

interface BucketFormProps {
  initialData?: {
    title: string;
    description: string;
    category: string;
    priority: BucketPriority;
    targetDate: string;
  };
  onSubmit: (data: {
    title: string;
    description: string;
    category: string;
    priority: BucketPriority;
    targetDate: string;
  }) => void;
  onCancel: () => void;
  submitText?: string;
  formTitle?: string;
}

const CATEGORIES = [
  'Travel',
  'Adventure',
  'Learning & Career',
  'Health & Fitness',
  'Creative & Art',
  'Finance & Wealth',
  'Personal & Life'
];

export default function BucketForm({
  initialData,
  onSubmit,
  onCancel,
  submitText = 'Save Dream',
  formTitle
}: BucketFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState<BucketPriority>('MEDIUM');
  const [targetDate, setTargetDate] = useState('');
  const [errors, setErrors] = useState<BucketFormErrors>({});

  // Initialize form fields when initialData is loaded
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setCategory(initialData.category);
      setPriority(initialData.priority);
      setTargetDate(initialData.targetDate);
    } else {
      // Set default target date to 6 months from now
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 6);
      setTargetDate(defaultDate.toISOString().split('T')[0]);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      title,
      description,
      category,
      priority,
      targetDate
    };

    const validationErrors = validateBucket(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  return (
    <form className="glass-panel form-card" onSubmit={handleSubmit}>
      {formTitle && <h2 className="form-title">{formTitle}</h2>}

      <div className="form-group">
        <label className="form-label" htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          className="form-input"
          placeholder="e.g. Visit the Pyramids of Giza"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors({ ...errors, title: undefined });
          }}
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      <div className="form-row">
        <div className="form-group form-flex-item">
          <label className="form-label" htmlFor="category">Category</label>
          <select
            id="category"
            className="form-input form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group form-flex-item">
          <label className="form-label" htmlFor="priority">Priority</label>
          <select
            id="priority"
            className="form-input form-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value as BucketPriority)}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="targetDate">Target Date *</label>
        <input
          id="targetDate"
          type="date"
          className="form-input"
          value={targetDate}
          onChange={(e) => {
            setTargetDate(e.target.value);
            if (errors.targetDate) setErrors({ ...errors, targetDate: undefined });
          }}
        />
        {errors.targetDate && <span className="form-error">{errors.targetDate}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">Description & Notes *</label>
        <textarea
          id="description"
          className="form-input form-textarea"
          placeholder="Describe your goal, why it is important, and how you plan to make it happen..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors({ ...errors, description: undefined });
          }}
        />
        {errors.description && <span className="form-error">{errors.description}</span>}
      </div>

      <div className="form-actions-bar">
        <button type="button" className="btn btn-secondary form-action-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary form-action-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {submitText}
        </button>
      </div>
    </form>
  );
}
