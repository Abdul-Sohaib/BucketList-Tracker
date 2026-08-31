import type { BucketPriority } from '../types/bucket';
import BucketForm from '../components/BucketForm';

interface CreateBucketProps {
  onAddItem: (
    title: string,
    description: string,
    category: string,
    priority: BucketPriority,
    targetDate: string
  ) => void;
  setRoute: (route: string) => void;
}

export default function CreateBucket({ onAddItem, setRoute }: CreateBucketProps) {
  const handleSubmit = (data: {
    title: string;
    description: string;
    category: string;
    priority: BucketPriority;
    targetDate: string;
  }) => {
    onAddItem(data.title, data.description, data.category, data.priority, data.targetDate);
    setRoute('dashboard');
  };

  const handleCancel = () => {
    setRoute('dashboard');
  };

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
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitText="Add to Bucket List"
        formTitle="Conceive a New Dream"
      />
    </div>
  );
}
