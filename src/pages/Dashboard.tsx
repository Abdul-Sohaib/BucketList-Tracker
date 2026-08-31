import { useState } from 'react';
import type { BucketItem, BucketPriority } from '../types/bucket';
import ProgressCard from '../components/ProgressCard';
import BucketCard from '../components/BucketCard';
import EmptyState from '../components/EmptyState';

interface DashboardProps {
  items: BucketItem[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  setRoute: (route: string) => void;
}

type SortOption = 'date_asc' | 'date_desc' | 'priority_desc' | 'title_asc';
type StatusFilter = 'ALL' | 'ACTIVE' | 'COMPLETED';

const CATEGORIES = [
  'All Categories',
  'Travel',
  'Adventure',
  'Learning & Career',
  'Health & Fitness',
  'Creative & Art',
  'Finance & Wealth',
  'Personal & Life'
];

export default function Dashboard({
  items,
  onToggleComplete,
  onDelete,
  onEdit,
  setRoute
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');
  const [selectedSort, setSelectedSort] = useState<SortOption>('date_asc');

  // Priority mapping weights for sorting
  const priorityWeight = (p: BucketPriority) => {
    switch (p) {
      case 'HIGH': return 3;
      case 'MEDIUM': return 2;
      case 'LOW': return 1;
      default: return 0;
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Categories' || item.category === selectedCategory;

    const matchesPriority =
      selectedPriority === 'ALL' || item.priority === selectedPriority;

    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'COMPLETED' && item.completed) ||
      (selectedStatus === 'ACTIVE' && !item.completed);

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (selectedSort === 'date_asc') {
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    }
    if (selectedSort === 'date_desc') {
      return new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime();
    }
    if (selectedSort === 'priority_desc') {
      return priorityWeight(b.priority) - priorityWeight(a.priority);
    }
    if (selectedSort === 'title_asc') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedPriority('ALL');
    setSelectedStatus('ALL');
    setSelectedSort('date_asc');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'All Categories' ||
    selectedPriority !== 'ALL' ||
    selectedStatus !== 'ALL';

  return (
    <div className="dashboard-container fade-in">

      {/* Stats Summary Panel */}
      <ProgressCard items={items} />

      {/* Control Panel (Search, Filters, Sort) */}
      <div className="glass-panel dashboard-filter-card">

        {/* Row 1: Search & Sort */}
        <div className="dashboard-row">
          <div style={{ flex: '2 1' }} className="form-group dashboard-flex-item">
            <div className="dashboard-search-wrapper">
              <svg className="dashboard-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="form-input dashboard-search-input"
                placeholder="Search dreams by title or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ flex: '1 1' }} className="form-group dashboard-flex-item">
            <select
              className="form-input dashboard-select"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as SortOption)}
            >
              <option value="date_asc">Target Date (Nearest)</option>
              <option value="date_desc">Target Date (Furthest)</option>
              <option value="priority_desc">Priority (High to Low)</option>
              <option value="title_asc">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Filtering Controls */}
        <div className="dashboard-row">
          <div className="form-group dashboard-flex-item">
            <label className="dashboard-filter-label">Category</label>
            <select
              className="form-input dashboard-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group dashboard-flex-item">
            <label className="dashboard-filter-label">Priority</label>
            <select
              className="form-input dashboard-select"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="form-group dashboard-flex-item">
            <label className="dashboard-filter-label">Status</label>
            <select
              className="form-input dashboard-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">In Progress</option>
              <option value="COMPLETED">Achieved</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              className="btn btn-secondary dashboard-clear-btn"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      {sortedItems.length > 0 ? (
        <div className="dashboard-grid">
          {sortedItems.map((item) => (
            <div key={item.id} className="fade-in">
              <BucketCard
                item={item}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={hasActiveFilters ? "No matches found" : "No dreams tracked yet"}
          message={
            hasActiveFilters
              ? "Try adjusting your search keywords or filter terms to find your item."
              : "Welcome to your dream vault! Add your first bucket list experience to begin."
          }
          actionText={hasActiveFilters ? "Reset filters" : "Create a Dream"}
          onActionClick={hasActiveFilters ? handleClearFilters : () => setRoute('create')}
        />
      )}
    </div>
  );
}
