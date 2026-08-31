import type { BucketItem, BucketPriority } from '../types/bucket';
import BucketForm from '../components/BucketForm';

interface EditBucketProps {
  editId: string | null;
  items: BucketItem[];
  onUpdateItem: (id: string, data: Partial<Omit<BucketItem, 'id' | 'createdAt'>>) => void;
  setRoute: (route: string) => void;
}

export default function EditBucket({ editId, items, onUpdateItem, setRoute }: EditBucketProps) {
  const itemToEdit = items.find((item) => item.id === editId);

  const handleSubmit = (data: {
    title: string;
    description: string;
    category: string;
    priority: BucketPriority;
    targetDate: string;
  }) => {
    if (editId) {
      onUpdateItem(editId, data);
    }
    setRoute('dashboard');
  };

  const handleCancel = () => {
    setRoute('dashboard');
  };

  if (!itemToEdit) {
    return (
      <div className="page-container-centered fade-in">
        <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', maxWidth: '400px', margin: '40px auto' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3 style={{ fontSize: '1.5rem', color: '#f3f4f6', fontFamily: 'var(--font-display)' }}>Dream Not Found</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '8px' }}>We couldn't locate the item you are trying to edit.</p>
          <button className="btn btn-primary" onClick={handleCancel}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container-centered fade-in">
      <div className="back-btn-header">
        <button className="btn btn-text back-btn" onClick={handleCancel}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <BucketForm
        initialData={{
          title: itemToEdit.title,
          description: itemToEdit.description,
          category: itemToEdit.category,
          priority: itemToEdit.priority,
          targetDate: itemToEdit.targetDate,
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitText="Save Changes"
        formTitle="Refine Your Dream"
      />
    </div>
  );
}
