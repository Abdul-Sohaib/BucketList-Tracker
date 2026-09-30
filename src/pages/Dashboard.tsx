import { useState } from 'react';
import type { User, BucketItem, BucketPriority } from '../types/bucket';
import ProgressCard from '../components/ProgressCard';
import BucketCard from '../components/BucketCard';

interface DashboardProps {
  user?: User | null;
  items: BucketItem[];
  onToggleComplete: (id: string) => Promise<boolean> | void;
  onDelete: (id: string) => Promise<boolean> | void;
  onEdit: (id: string) => void;
  setRoute: (route: string) => void;
}

const CATEGORIES = [
  'All Categories',
  'Travel',
  'Adventure',
  'Learning & Career',
  'Health & Fitness',
  'Creative & Art',
  'Finance & Wealth',
  'Personal & Life',
];

export default function Dashboard({
  user,
  items,
  onToggleComplete,
  onDelete,
  onEdit,
  setRoute,
}: DashboardProps) {
  const activeDataset = items;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'achieved'>('all');
  const [selectedSort, setSelectedSort] = useState<string>('target_nearest');

  const totalCount = activeDataset.length;
  const achievedCount = activeDataset.filter((i) => i.completed).length;
  const activeCount = totalCount - achievedCount;

  const displayName = user?.preferred_username || user?.username || (user?.email ? user.email.split('@')[0] : 'Explorer');

  // Priority weight for sorting
  const priorityWeight = (p?: BucketPriority | string) => {
    switch ((p || '').toUpperCase()) {
      case 'HIGH': return 3;
      case 'MEDIUM': return 2;
      case 'LOW': return 1;
      default: return 0;
    }
  };

  // Filter items
  const filteredItems = activeDataset.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Categories' || item.category === selectedCategory;

    const matchesPriority =
      selectedPriority === 'all' ||
      (item.priority || '').toLowerCase() === selectedPriority.toLowerCase();

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'achieved' && item.completed) ||
      (selectedStatus === 'active' && !item.completed);

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (selectedSort === 'target_nearest') {
      if (!a.targetDate) return 1;
      if (!b.targetDate) return -1;
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    }
    if (selectedSort === 'target_latest') {
      if (!a.targetDate) return 1;
      if (!b.targetDate) return -1;
      return new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime();
    }
    if (selectedSort === 'priority') {
      return priorityWeight(b.priority) - priorityWeight(a.priority);
    }
    if (selectedSort === 'alpha') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="page-wrapper fade-in">
      {/* Hero / Greeting Section */}
      <section className="dq-card dq-card-hero">
        <div className="dq-ambient-aura" />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '42rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', color: 'var(--primary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>explore</span>
            <span className="font-label-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--primary)' }}>
              Field Journal • Naturalist Ledger
            </span>
          </div>

          <h1 className="font-headline-lg" style={{ color: 'var(--primary)', letterSpacing: '-0.015em' }}>
            Good day, {displayName}. Your horizons are waiting.
          </h1>

          <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
            <span>{totalCount} aspirations cataloged</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{activeCount} active milestones</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{achievedCount} dreams realized</span>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-dq-primary"
            onClick={() => setRoute('create')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
            <span>Conceive New Dream</span>
          </button>
        </div>
      </section>

      {/* Quest Analytics & Progress Card */}
      <ProgressCard items={activeDataset} />

      {/* Interactive Filtering & Sorting Bar */}
      <section className="dq-filter-section">
        {/* Search and Dropdowns Row */}
        <div className="dq-filter-top-row">
          {/* Search Field */}
          <div className="dq-search-wrapper">
            <span className="material-symbols-outlined dq-search-icon" style={{ fontSize: '20px' }}>
              search
            </span>
            <input
              type="text"
              className="dq-search-input"
              placeholder="Search across aspirations, locations, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Controls: Status Tabs, Priority, Sort */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            {/* Status Tabs */}
            <div className="dq-status-tabs">
              <button
                type="button"
                className={`dq-status-tab ${selectedStatus === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('all')}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                className={`dq-status-tab ${selectedStatus === 'active' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('active')}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                className={`dq-status-tab ${selectedStatus === 'achieved' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('achieved')}
              >
                Achieved ({achievedCount})
              </button>
            </div>

            {/* Priority Select */}
            <div className="dq-select-wrapper">
              <select
                className="dq-select"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <option value="all">Priority: All</option>
                <option value="high">Priority: High</option>
                <option value="medium">Priority: Medium</option>
                <option value="low">Priority: Low</option>
              </select>
              <span className="material-symbols-outlined dq-select-icon" style={{ fontSize: '18px' }}>
                expand_more
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="dq-select-wrapper">
              <select
                className="dq-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="target_nearest">Sort: Target Date (Nearest)</option>
                <option value="target_latest">Sort: Target Date (Furthest)</option>
                <option value="priority">Sort: Priority Rank</option>
                <option value="alpha">Sort: Monograph Title (A-Z)</option>
              </select>
              <span className="material-symbols-outlined dq-select-icon" style={{ fontSize: '18px' }}>
                swap_vert
              </span>
            </div>
          </div>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="dq-category-pills-bar no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`dq-category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Bucket Cards Grid or Empty State */}
      {items.length === 0 ? (
        <section className="dq-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--primary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
              explore
            </span>
          </div>
          <h3 className="font-headline-sm" style={{ color: 'var(--primary)' }}>
            Your Life Ledger is Pristine
          </h3>
          <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '440px', margin: '0.5rem auto 1.5rem', lineHeight: 1.6 }}>
            You haven't added any goals to your vault yet. Begin your journey by recording your first personal aspiration or grand expedition.
          </p>
          <button
            type="button"
            className="btn-dq-primary"
            onClick={() => setRoute('create')}
            style={{ margin: '0 auto', padding: '0.85rem 1.75rem' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
            <span>Conceive Your First Dream</span>
          </button>
        </section>
      ) : sortedItems.length > 0 ? (
        <section className="dq-grid-cards">
          {sortedItems.map((item) => (
            <BucketCard
              key={item.id}
              item={item}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </section>
      ) : (
        <section className="dq-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline)', marginBottom: '0.75rem' }}>
            filter_alt_off
          </span>
          <h3 className="font-headline-sm" style={{ color: 'var(--primary)' }}>
            No journal records match this filter
          </h3>
          <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '0.35rem', maxWidth: '400px', margin: '0.35rem auto 1.5rem' }}>
            Broaden your category or search query to review your cataloged aspirations.
          </p>
          <button
            type="button"
            className="btn-dq-secondary"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All Categories');
              setSelectedPriority('all');
              setSelectedStatus('all');
            }}
          >
            Reset Ledger Filters
          </button>
        </section>
      )}

      {/* Action Strip */}
      <section
        style={{
          backgroundColor: 'var(--surface-container-low)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem 2rem',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          border: '1px solid rgba(216, 228, 220, 0.7)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-fixed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              bookmark_heart
            </span>
          </div>
          <div>
            <h4 className="font-title-lg" style={{ color: 'var(--primary)' }}>
              Contemplating another life milestone?
            </h4>
            <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)' }}>
              Your ledger is boundless. Catalog your next expedition before motivation fades.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn-dq-primary"
          onClick={() => setRoute('create')}
        >
          <span>Conceive Aspirations</span>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            arrow_forward
          </span>
        </button>
      </section>
    </div>
  );
}
