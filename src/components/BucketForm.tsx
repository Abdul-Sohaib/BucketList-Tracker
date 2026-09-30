import React, { useEffect, useRef, useState } from 'react';
import type { BucketListItem, BucketPriority } from '../types/bucket';
import { getBucketImageUrl } from '../utils/storage';

interface MilestoneStep {
  id: string;
  text: string;
  completed: boolean;
}

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
  isEdit?: boolean;
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

export default function BucketForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Preserve into Vault',
  isEdit = false,
}: BucketFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [category, setCategory] = useState(initialData?.category ?? 'Adventure');
  const [customCategory, setCustomCategory] = useState('');
  const [priority, setPriority] = useState<BucketPriority>(initialData?.priority ?? 'HIGH');
  const [targetDate, setTargetDate] = useState(initialData?.targetDate ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // Interactive milestone steps
  const [milestones, setMilestones] = useState<MilestoneStep[]>([]);
  const [newStepText, setNewStepText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    const loadExistingImage = async () => {
      if (!initialData?.imageKey) {
        setImagePreview('');
        return;
      }

      if (initialData.imageKey.startsWith('http')) {
        setImagePreview(initialData.imageKey);
        return;
      }

      try {
        const url = await getBucketImageUrl(initialData.imageKey);
        if (!cancelled && url) {
          setImagePreview(url);
        }
      } catch (err) {
        console.error('Failed to load image:', err);
      }
    };

    loadExistingImage();

    return () => {
      cancelled = true;
    };
  }, [initialData?.imageKey]);

  useEffect(() => {
    if (!imageFile) return;
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    setFileName(imageFile.name);
    setFileSize(`${(imageFile.size / (1024 * 1024)).toFixed(1)} MB • Custom Field Asset`);

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

    const maxSize = 5 * 1024 * 1024;
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddMilestone = () => {
    if (!newStepText.trim()) return;
    setMilestones([
      ...milestones,
      { id: Date.now().toString(), text: newStepText.trim(), completed: false },
    ]);
    setNewStepText('');
  };

  const handleToggleMilestone = (id: string) => {
    setMilestones(
      milestones.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter an evocative goal title.');
      return;
    }

    const finalCategory = customCategory.trim() || category || 'Adventure';

    try {
      setSubmitting(true);
      setError('');
      await onSubmit(
        title.trim(),
        description.trim(),
        finalCategory,
        priority,
        targetDate,
        imageFile
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to preserve dream into ledger.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dq-form-grid fade-in">
      {/* Primary Form Ledger Card (8 cols) */}
      <div className="dq-form-card">
        <div style={{ position: 'absolute', top: 0, right: '3rem', width: '5rem', height: '6px', backgroundColor: 'var(--primary-container)', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px', opacity: 0.5 }} />

        {isEdit && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.65rem', borderRadius: '9999px', backgroundColor: 'var(--secondary-container)', color: 'var(--on-secondary-container)', marginBottom: '1rem', width: 'fit-content' }} className="font-label-sm">
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit_note</span>
            <span>Editing Existing Ledger Item</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {error && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Field 1: Title */}
          <div className="dq-form-group">
            <div className="dq-form-label-row">
              <label htmlFor="dream-title" className="dq-form-label">
                Goal Title <span style={{ color: 'var(--secondary)' }}>*</span>
              </label>
              <span className="dq-form-hint">Distinct &amp; evocative</span>
            </div>
            <input
              id="dream-title"
              type="text"
              className="dq-input-text font-title-md"
              placeholder="e.g., Solo sea kayak expedition through the Norwegian Fjords"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Field 2: Category Selector */}
          <div className="dq-form-group">
            <div className="dq-form-label-row">
              <label className="dq-form-label">Category</label>
              <span className="dq-form-hint">Archival Taxonomy</span>
            </div>
            <div className="dq-category-chips-group">
              {CATEGORY_SUGGESTIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`dq-chip-btn ${category === cat && !customCategory ? 'active' : ''}`}
                  onClick={() => {
                    setCategory(cat);
                    setCustomCategory('');
                  }}
                >
                  {cat === 'Adventure' && <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>explore</span>}
                  {cat === 'Travel' && <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>flight</span>}
                  {cat === 'Creative & Art' && <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>palette</span>}
                  {cat === 'Health & Fitness' && <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>directions_run</span>}
                  <span>{cat}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              <input
                type="text"
                className="dq-input-text font-body-sm"
                placeholder="Or type a custom category..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            </div>
          </div>

          {/* Field 3: Priority Selector Grid */}
          <div className="dq-form-group">
            <div className="dq-form-label-row">
              <label className="dq-form-label">Priority Level</label>
              <span className="dq-form-hint" style={{ color: 'var(--secondary)', fontWeight: 600 }}>Determines Ledger Weight</span>
            </div>
            <div className="dq-priority-grid">
              {/* Low */}
              <div
                className={`dq-priority-option ${priority === 'LOW' ? 'selected-low' : ''}`}
                onClick={() => setPriority('LOW')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span className="font-title-md" style={{ color: 'var(--on-surface)' }}>Low</span>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--outline-variant)' }} />
                </div>
                <span className="font-body-sm" style={{ color: 'var(--on-surface-variant)' }}>Calm horizon, gently paced aspiration</span>
              </div>

              {/* Medium */}
              <div
                className={`dq-priority-option ${priority === 'MEDIUM' ? 'selected-medium' : ''}`}
                onClick={() => setPriority('MEDIUM')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span className="font-title-md" style={{ color: 'var(--tertiary)' }}>Medium</span>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--on-tertiary-container)' }} />
                </div>
                <span className="font-body-sm" style={{ color: 'var(--on-surface-variant)' }}>Active focus, intended near-term pursuit</span>
              </div>

              {/* High */}
              <div
                className={`dq-priority-option ${priority === 'HIGH' ? 'selected-high' : ''}`}
                onClick={() => setPriority('HIGH')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span className="font-title-md" style={{ color: 'var(--secondary)', fontWeight: 700 }}>High</span>
                  <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: 700, backgroundColor: 'var(--secondary)', color: 'var(--on-secondary)' }}>
                    Essential Quest
                  </span>
                </div>
                <span className="font-body-sm" style={{ color: 'var(--on-secondary-fixed-variant)', fontWeight: 600 }}>Terracotta Ember • Top Life Milestone</span>
              </div>
            </div>
          </div>

          {/* Field 4: Target Accomplishment Date */}
          <div className="dq-form-group">
            <label htmlFor="target-date" className="dq-form-label">
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--surface-tint)' }}>calendar_month</span>
              Target Accomplishment Date
            </label>
            <div style={{ maxWidth: '24rem' }}>
              <input
                id="target-date"
                type="date"
                className="dq-input-text font-title-md"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
            <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
              Leave blank if open-ended, or set a milestone deadline to stay accountable.
            </p>
          </div>

          {/* Field 5: Inspiration Cover Dropzone */}
          <div className="dq-form-group">
            <label className="dq-form-label">
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--surface-tint)' }}>image</span>
              Inspiration Cover
            </label>
            <div
              className={`dq-dropzone ${isDragging ? 'dq-dropzone-active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {imagePreview && (
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--surface-container-lowest)', padding: '0.75rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ width: '100px', height: '70px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', bottom: '3px', right: '3px', backgroundColor: 'rgba(27, 59, 50, 0.85)', color: '#fff', fontSize: '9px', padding: '1px 4px', borderRadius: '2px', fontFamily: 'monospace' }}>
                      JPG
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--surface-tint)' }}>verified</span>
                      <span className="font-title-md" style={{ color: 'var(--primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileName}</span>
                    </div>
                    <span className="font-body-sm" style={{ color: 'var(--on-surface-variant)', display: 'block', marginTop: '2px' }}>{fileSize}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="font-label-md"
                        style={{ color: 'var(--secondary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>sync</span>
                        Change photo
                      </button>
                      <span style={{ color: 'var(--outline-variant)' }}>•</span>
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(''); }}
                        className="font-label-md"
                        style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', color: 'var(--on-surface-variant)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--surface-tint)' }}>cloud_upload</span>
                  <span className="font-body-sm">Drag &amp; drop visual inspiration here, or browse files (JPG, PNG, WebP up to 5MB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-dq-secondary font-label-md"
                  style={{ padding: '0.35rem 0.85rem' }}
                >
                  Browse
                </button>
              </div>
            </div>
          </div>

          {/* Field 6: Personal Notes & Reflections */}
          <div className="dq-form-group">
            <div className="dq-form-label-row">
              <label htmlFor="dream-desc" className="dq-form-label">
                Personal Notes &amp; Reflections
              </label>
              <span className="dq-form-hint">Field Monograph</span>
            </div>
            <textarea
              id="dream-desc"
              rows={4}
              className="dq-textarea font-body-md"
              placeholder="Why does this dream matter to you? What feelings or milestones are tied to this horizon?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Field 7: Milestone Checklist / Mini-steps */}
          <div className="dq-form-group">
            <div className="dq-form-label-row">
              <label className="dq-form-label">
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--surface-tint)' }}>checklist</span>
                Milestone Waypoints
              </label>
              <span className="dq-form-hint">Sequential Steps</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {milestones.map((step) => (
                <div
                  key={step.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'var(--surface-container-low)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={step.completed}
                    onChange={() => handleToggleMilestone(step.id)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary-container)', cursor: 'pointer' }}
                  />
                  <span
                    className="font-title-md"
                    style={{
                      flex: 1,
                      color: step.completed ? 'var(--on-surface-variant)' : 'var(--on-surface)',
                      textDecoration: step.completed ? 'line-through' : 'none',
                    }}
                  >
                    {step.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteMilestone(step.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--outline)', cursor: 'pointer', display: 'flex' }}
                    title="Remove step"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                  </button>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input
                  type="text"
                  className="dq-input-text font-title-md"
                  placeholder="Enter a new milestone step..."
                  value={newStepText}
                  onChange={(e) => setNewStepText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMilestone();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-dq-secondary"
                  onClick={handleAddMilestone}
                  style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  Add Step
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(216, 228, 220, 0.6)' }}>
            <button
              type="button"
              className="btn-dq-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-dq-primary"
              disabled={submitting}
              style={{ padding: '0.85rem 1.75rem' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>explore</span>
              <span>{submitting ? 'Preserving...' : submitLabel}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Side Guidance Column: Field Guide Tips & Archival Context (4 cols) */}
      <aside className="dq-sidebar-guide">
        {/* Field Guide Box */}
        <div className="dq-guide-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--secondary)' }}>auto_stories</span>
            <h2 className="font-headline-sm" style={{ color: 'var(--primary)' }}>Field Guide Tips</h2>
          </div>

          <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
            Ambition flourishes when rooted in tactile, deliberate language. Apply these naturalist principles:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span className="font-headline-sm" style={{ color: 'var(--secondary)', lineHeight: 1 }}>1.</span>
              <div>
                <span className="font-title-md" style={{ color: 'var(--primary)' }}>Be sensory and specific</span>
                <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                  Instead of "Travel to Norway", envision "Kayaking emerald glacial fjords under crisp September dawn."
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span className="font-headline-sm" style={{ color: 'var(--secondary)', lineHeight: 1 }}>2.</span>
              <div>
                <span className="font-title-md" style={{ color: 'var(--primary)' }}>Attach emotional resonance</span>
                <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                  Identify the internal transformation. What virtue or inner milestone does this pursuit cultivate?
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span className="font-headline-sm" style={{ color: 'var(--secondary)', lineHeight: 1 }}>3.</span>
              <div>
                <span className="font-title-md" style={{ color: 'var(--primary)' }}>Commit to a realistic horizon</span>
                <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                  Milestones reduce intimidation. Even distant multi-year quests begin with an initial logistical step.
                </p>
              </div>
            </div>
          </div>

          {/* Micro Quote */}
          <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(216, 228, 220, 0.5)' }}>
            <blockquote className="font-headline-md" style={{ fontSize: '16px', fontStyle: 'italic', color: 'var(--primary)', lineHeight: 1.4 }}>
              “A goal without a timeline is just a wish.”
            </blockquote>
            <p className="font-label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.35rem', textAlign: 'right' }}>
              — Antoine de Saint-Exupéry
            </p>
          </div>
        </div>

        {/* Archival Status Indicator Card */}
        <div className="dq-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="font-label-md" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Cloud Vault Storage
            </span>
            <span className="font-label-sm" style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--surface-tint)' }} />
              Live Sync
            </span>
          </div>

          <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.75rem', backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '18px' }}>cloud_done</span>
            <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)', fontSize: '12px' }}>
              Your aspirations are encrypted and backed by AWS AppSync &amp; Amazon DynamoDB.
            </p>
          </div>
        </div>

        {/* Visual Atmosphere Card */}
        <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: '190px', boxShadow: 'var(--shadow-sm)' }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXHWXRa2TfVAZghteVR9kEc9jeVbdM2RUrAfiFSS8WRF5cUldPSNEOtzaYARcBrdNHw_CkBRbIezyuvCG3VmFVnTlkhAuaNiN34neWxqV27akWizI_WS4hpg3doxgthPi9C6ep03uwjidikLTDaDx53pBQlSqFfkzxNLU9uNAov6Lcrx9i-RiMKQWpsyr2aRQlAeQzgqOJHDzG2DSIaISjxIalkjWWu0Aj6FSPX1yoJeGyRDtPqDzH"
            alt="The Explorer's Journal"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3, 37, 29, 0.95) 0%, rgba(3, 37, 29, 0.35) 60%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1rem', color: '#fff' }}>
            <span className="font-label-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary-fixed)' }}>
              The Explorer's Journal
            </span>
            <p className="font-headline-sm" style={{ color: '#fff', fontSize: '18px', marginTop: '2px' }}>
              Written today. Embarked upon tomorrow.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}