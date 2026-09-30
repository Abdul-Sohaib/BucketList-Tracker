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

export default function EditBucket({
  items,
  editId,
  onUpdateItem,
  setRoute,
}: EditBucketProps) {
  const item = items.find((currentItem) => currentItem.id === editId);

  if (!item) {
    return (
      <div className="page-wrapper fade-in" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <h2 className="font-headline-md" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
          Horizon Entry Not Found
        </h2>
        <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>
          The requested bucket list item could not be retrieved from your active ledger.
        </p>
        <button
          type="button"
          onClick={() => setRoute('dashboard')}
          className="btn-dq-primary"
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
    <div className="page-wrapper fade-in">
      {/* Top Editorial Header & Breadcrumb */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)' }} className="font-label-md">
          <a
            href="#dashboard"
            onClick={(e) => { e.preventDefault(); setRoute('dashboard'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'inherit', textDecoration: 'none' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>west</span>
            <span>Dashboard</span>
          </a>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>Edit Goal Monograph</span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--secondary)' }} />
              <span className="font-label-sm" style={{ color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Refining Archival Entry
              </span>
            </div>
            <h1 className="font-headline-lg" style={{ color: 'var(--primary)', letterSpacing: '-0.015em' }}>
              Edit Goal Monograph
            </h1>
            <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: '42rem', marginTop: '0.25rem' }}>
              Modify target parameters, update milestone waypoints, or adjust inspiration assets.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--surface-container-low)', padding: '0.4rem 1rem', borderRadius: '9999px', border: '1px solid rgba(216, 228, 220, 0.7)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--surface-tint)' }}>history_edu</span>
            <span className="font-label-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>
              Naturalist Ledger System
            </span>
          </div>
        </div>
      </section>

      <BucketForm
        initialData={item}
        onSubmit={handleSubmit}
        onCancel={() => setRoute('dashboard')}
        submitLabel="Update Ledger Entry"
        isEdit={true}
      />
    </div>
  );
}