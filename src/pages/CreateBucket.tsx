import BucketForm from '../components/BucketForm';
import type { BucketPriority } from '../types/bucket';

interface CreateBucketProps {
  onAddItem: (
    title: string,
    description: string,
    category: string,
    priority: BucketPriority,
    targetDate: string,
    imageFile: File | null
  ) => Promise<unknown>;
  setRoute: (route: string) => void;
}

function CreateBucket({ onAddItem, setRoute }: CreateBucketProps) {
  const handleSubmit = async (
    title: string,
    description: string,
    category: string,
    priority: BucketPriority,
    targetDate: string,
    imageFile: File | null
  ) => {
    const result = await onAddItem(
      title,
      description,
      category,
      priority,
      targetDate,
      imageFile
    );

    if (result) {
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
        onSubmit={handleSubmit}
        onCancel={() => setRoute('dashboard')}
        submitLabel="Add to Bucket List"
      />
    </div>
  );
}

export default CreateBucket;