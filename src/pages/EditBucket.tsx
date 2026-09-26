import BucketForm from '../components/BucketForm';
import type { BucketListItem, BucketPriority } from '../types/bucket';
import type { BucketItemUpdate } from '../hooks/useBucketList';

interface EditBucketProps {
  items: BucketListItem[];
  editId: string | null;
  onUpdateItem: (
    id: string,
    updatedFields: BucketItemUpdate
  ) => Promise<boolean>;
  setRoute: (route: string) => void;
}

function EditBucket({
  items,
  editId,
  onUpdateItem,
  setRoute,
}: EditBucketProps) {
  const item = items.find((currentItem) => currentItem.id === editId);

  if (!item) {
    return (
      <div className="page-container-centered fade-in" style={{ textAlign: 'center', paddingTop: '40px' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Bucket list item not found or has been removed.
        </p>

        <button
          type="button"
          onClick={() => setRoute('dashboard')}
          className="btn btn-primary"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleSubmit = async (
    title: string,
    description: string,
    category: string,
    priority: BucketPriority,
    targetDate: string,
    imageFile: File | null
  ) => {
    const success = await onUpdateItem(item.id, {
      title,
      description,
      category,
      priority,
      targetDate,
      imageFile,
    });

    if (success) {
      setRoute('dashboard');
    }
  };

  return (
    <div className="page-container-centered fade-in">
      <div className="back-btn-header">
        <button
          type="button"
          onClick={() => setRoute('dashboard')}
          className="btn btn-text back-btn"
        >
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
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <BucketForm
        initialData={item}
        onSubmit={handleSubmit}
        onCancel={() => setRoute('dashboard')}
        submitLabel="Save Changes"
      />
    </div>
  );
}

export default EditBucket;