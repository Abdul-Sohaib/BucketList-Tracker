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

export default function CreateBucket({ onAddItem, setRoute }: CreateBucketProps) {
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
          <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>Conceive a New Dream</span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem' }}>
          <div>
            <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: '42rem', marginTop: '0.25rem' }}>
              Define your life aspiration with clarity, milestones, and vivid visual intention.
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
        onSubmit={handleSubmit}
        onCancel={() => setRoute('dashboard')}
        submitLabel="Preserve into Vault"
      />
    </div>
  );
}