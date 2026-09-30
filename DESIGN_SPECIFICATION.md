# DreamQuest (BucketList Tracker Web) — Master UI/UX & Technical Design Specification

> **Document Version:** 2.0.0  
> **Target Audience:** Frontend Engineers, UI/UX Designers, AI Code Generators  
> **Purpose:** Serves as the single source of truth for the visual design system, component hierarchy, CSS class naming conventions, state contracts, and TypeScript interfaces. Any implementation following this specification will integrate seamlessly with 0% mismatch.

---

## 1. Technical Stack & Architectural Constraints

* **Core Framework:** React 18+ with TypeScript (`.tsx`)
* **Styling Engine:** Pure Vanilla CSS utilizing Native CSS Custom Properties (`:root` variables) in `src/index.css`. **No Tailwind CSS or third-party CSS utility libraries.**
* **Routing Paradigm:** Hash-based client router (`window.location.hash`).
  * `#login` — Unauthenticated Authentication / Registration Screen
  * `#dashboard` — Main Quest Hub & Analytics
  * `#create` — Add New Bucket List Goal
  * `#edit/:id` — Edit Existing Bucket List Goal (where `:id` is the item UUID)
  * `#profile` — User Profile, Avatar Customization & Quest Analytics
* **Typography:** Google Fonts loaded via `<link>` in `index.html`:
  * `'Plus Jakarta Sans'` (Weights: 300, 400, 500, 600, 700, 800)
  * `'Space Grotesk'` (Weights: 500, 600, 700)
  * `'Outfit'` (Weights: 400, 500, 600, 700, 800)
* **Backend Contract (AWS Amplify Gen 2):**
  * **Auth:** AWS Cognito (`aws-amplify/auth` — `signIn`, `signUp`, `confirmSignUp`, `fetchUserAttributes`, `updateUserAttributes`, `signOut`, `getCurrentUser`).
  * **API/Database:** AWS AppSync / DynamoDB GraphQL Client (`aws-amplify/data`).
  * **Storage:** AWS S3 via `@aws-amplify/storage` (`getUrl`, `uploadData`, `remove`).

---

## 2. Global Design Tokens (Exact CSS Variables Contract)

All CSS properties **must** use these exact variable tokens defined in `:root`:

```css
:root {
  /* Surface & Background Canvas */
  --bg-primary: #0b0f19;                         /* Base page background */
  --bg-secondary: #111726;                       /* Secondary surface / control panels */
  --bg-tertiary: #192237;                        /* Elevated surfaces / dropdowns */
  --bg-surface: #141b2d;                         /* Card base background */
  --bg-elevated: #1a233a;                        /* Modal / floating item background */
  --bg-card: rgba(17, 23, 38, 0.75);             /* Semi-transparent glass card */
  --bg-card-hover: rgba(22, 30, 50, 0.85);       /* Hovered glass card state */
  --bg-inset: rgba(7, 10, 18, 0.6);              /* Inputs, textareas, wells */

  /* Glassmorphism & Border Strokes */
  --glass-bg: rgba(17, 23, 38, 0.72);
  --glass-border: rgba(255, 255, 255, 0.08);     /* Default subtle stroke */
  --glass-border-hover: rgba(255, 255, 255, 0.16);
  --glass-border-focus: rgba(99, 102, 241, 0.45);
  --glass-glow: rgba(99, 102, 241, 0.15);

  /* Curated Color Palette */
  --color-primary: #6366f1;                      /* Electric Indigo (Brand Primary) */
  --color-primary-hover: #4f46e5;
  --color-primary-light: #818cf8;
  --color-secondary: #a855f7;                    /* Royal Orchid */
  --color-accent: #f43f5e;                       /* Coral Crimson (High Priority & Danger) */
  --color-accent-warm: #f59e0b;                  /* Sunset Amber (Medium Priority & Milestones) */
  --color-success: #10b981;                      /* Emerald Mint (Completed & Success) */
  --color-warning: #f59e0b;                      /* Warning / Alerts */
  --color-info: #0ea5e9;                         /* Sky Blue (Low Priority & Metadata) */

  /* Text Colors */
  --text-primary: #f8fafc;                       /* High-emphasis text */
  --text-secondary: #94a3b8;                     /* Medium-emphasis body text */
  --text-muted: #64748b;                         /* Low-emphasis captions, placeholders */
  --text-faint: #475569;                         /* Disabled / subtle text */

  /* Typography */
  --font-display: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-accent: 'Space Grotesk', 'Outfit', sans-serif;

  /* Corner Radii */
  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 18px;
  --radius-xl: 26px;
  --radius-pill: 9999px;

  /* Elevation Shadows */
  --shadow-sm: 0 2px 8px -1px rgba(0, 0, 0, 0.3), 0 1px 3px -1px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 10px 30px -4px rgba(0, 0, 0, 0.4), 0 4px 12px -2px rgba(0, 0, 0, 0.25);
  --shadow-lg: 0 20px 48px -8px rgba(0, 0, 0, 0.55), 0 8px 24px -4px rgba(0, 0, 0, 0.35);
  --shadow-glow: 0 0 28px rgba(99, 102, 241, 0.22);
  --shadow-glow-amber: 0 0 28px rgba(245, 158, 11, 0.2);

  /* Gradients */
  --gradient-brand: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  --gradient-brand-subtle: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.12) 100%);
  --gradient-amber: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  --gradient-emerald: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --gradient-dark: linear-gradient(180deg, #111726 0%, #0b0f19 100%);
}
```

---

## 3. Data Models & TypeScript Interfaces Contract

These exact interfaces are located in `src/types/bucket.ts`:

```typescript
export type BucketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface BucketListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: BucketPriority;
  targetDate: string;              // Format: YYYY-MM-DD
  imageKey?: string | null;        // S3 object key
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Alias for backwards compatibility
export type BucketItem = BucketListItem;

export interface User {
  username: string;                // Display name or Cognito username
  email: string;
  preferred_username?: string;     // Friendly user nickname
  avatarUrl?: string;              // Presigned or direct image URL
  bio?: string;
  joinedDate?: string;             // Format: YYYY-MM-DD
}

export type CategoryOption =
  | 'Travel'
  | 'Adventure'
  | 'Learning & Career'
  | 'Health & Fitness'
  | 'Creative & Art'
  | 'Finance & Wealth'
  | 'Personal & Life';
```

---

## 4. Component Hierarchy & DOM Structure Specifications

### 4.1. `LoadingSpinner` Component (`src/components/LoadingSpinner.tsx`)

#### Props Interface:
```typescript
interface LoadingSpinnerProps {
  fullScreen?: boolean;   // If true, applies .loader-fullscreen (min-height: 80vh)
  message?: string;       // Custom primary message override
  submessage?: string;    // Custom subtext override
  compact?: boolean;      // If true, renders inline mini spinner (.dynamic-loader-compact)
}
```

#### Dynamic Message Rotation Pool:
```typescript
const DYNAMIC_MESSAGES = [
  'Gathering your life aspirations...',
  'Connecting to your personal dream vault...',
  'Curating milestones and moments...',
  'Aligning horizons and adventures...',
  'Polishing your life journey roadmap...',
  'Almost ready to make it happen...',
];
```

#### DOM Hierarchy (Full Mode):
```html
<div class="dynamic-loader-wrapper loader-fullscreen|loader-inline" role="status">
  <div class="loader-ambient-glow"></div>
  
  <div class="loader-stage-container">
    <div class="loader-orbit loader-orbit-outer">
      <div class="loader-orbiter orbiter-1"></div>
    </div>
    <div class="loader-orbit loader-orbit-middle">
      <div class="loader-orbiter orbiter-2"></div>
    </div>
    <div class="loader-orbit loader-orbit-inner">
      <div class="loader-orbiter orbiter-3"></div>
    </div>
    
    <div class="loader-central-badge">
      <div class="loader-central-pulse"></div>
      <svg class="loader-central-icon" width="24" height="24" viewBox="0 0 24 24">
        <!-- 5-point star compass icon -->
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    </div>
  </div>

  <div class="loader-text-area">
    <div class="loader-status-pill">
      <span class="loader-status-dot"></span>
      <span class="loader-status-tag">Synchronizing</span>
    </div>
    
    <h3 class="loader-title fade-enter|fade-exit">{activeMessage}</h3>
    <p class="loader-subcaption">{submessage || 'Every great chapter begins with a bold vision.'}</p>
    
    <div class="loader-track-bar">
      <div class="loader-track-indicator"></div>
    </div>
  </div>
</div>
```

#### DOM Hierarchy (Compact Mode):
```html
<div class="dynamic-loader-compact" role="status">
  <div class="loader-compact-ring">
    <div class="loader-compact-dot"></div>
  </div>
  <span class="loader-compact-text">{activeMessage}</span>
</div>
```

---

### 4.2. `Navbar` Component (`src/components/Navbar.tsx`)

#### Props Interface:
```typescript
interface NavbarProps {
  currentRoute: string;               // 'dashboard' | 'create' | 'profile' | 'login'
  setRoute: (route: string) => void;
  user: User | null;
  onLogout: () => void;
}
```

#### DOM Hierarchy:
```html
<nav class="navbar glass-panel">
  <div class="navbar-container">
    <!-- Brand Logo -->
    <div class="navbar-brand" onclick="navigate('dashboard')">
      <div class="navbar-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
      </div>
      <span class="navbar-brand-text">DreamQuest</span>
    </div>

    <!-- Center Links -->
    <div class="navbar-links {isMenuOpen ? 'navbar-links-open' : ''}">
      <a href="#dashboard" class="navbar-link {currentRoute === 'dashboard' ? 'navbar-link-active' : ''}">
        <svg><!-- Grid icon --></svg>
        Dashboard
      </a>
      <a href="#create" class="navbar-link {currentRoute === 'create' ? 'navbar-link-active' : ''}">
        <svg><!-- Plus icon --></svg>
        Add Dream
      </a>
      <a href="#profile" class="navbar-link {currentRoute === 'profile' ? 'navbar-link-active' : ''}">
        <svg><!-- User icon --></svg>
        Profile
      </a>
    </div>

    <!-- User Profile & Actions -->
    <div class="navbar-user-section">
      <div class="navbar-user-info" onclick="navigate('profile')">
        <img class="navbar-avatar" src="{user.avatarUrl}" alt="{displayName}" />
        <span class="navbar-username">{displayName}</span>
      </div>

      <button class="btn btn-secondary navbar-logout-btn" onclick="onLogout" title="Log out">
        <svg><!-- Logout icon --></svg>
        <span>Exit</span>
      </button>

      <!-- Hamburger Trigger for Mobile Viewports -->
      <button class="navbar-hamburger" onclick="toggleMenu">
        <svg><!-- Hamburger / Close icon --></svg>
      </button>
    </div>
  </div>
</nav>
```

---

### 4.3. `ProgressCard` Component (`src/components/ProgressCard.tsx`)

#### Props Interface:
```typescript
interface ProgressCardProps {
  items: BucketItem[];
}
```

#### Calculations:
* `total = items.length`
* `completed = items.filter(i => i.completed).length`
* `pending = total - completed`
* `completionRate = total > 0 ? Math.round((completed / total) * 100) : 0`
* `highPriority = items.filter(i => i.priority === 'HIGH' && !i.completed).length`

#### DOM Hierarchy:
```html
<div class="glass-panel progress-container">
  <h3 class="progress-header">Quest Analytics</h3>

  <div class="progress-section">
    <div class="progress-label">
      <span>Overall Accomplishment</span>
      <span class="progress-percent">{completionRate}%</span>
    </div>
    
    <div class="progress-bar-bg">
      <div class="progress-bar-fill" style="width: {completionRate}%"></div>
    </div>
  </div>

  <div class="progress-stats-grid">
    <div class="progress-stat-box">
      <span class="progress-stat-val">{total}</span>
      <span class="progress-stat-label">Total Dreams</span>
    </div>

    <div class="progress-stat-box" style="border-color: rgba(16, 185, 129, 0.25)">
      <span class="progress-stat-val" style="color: var(--color-success)">{completed}</span>
      <span class="progress-stat-label">Achieved</span>
    </div>

    <div class="progress-stat-box" style="border-color: rgba(14, 165, 233, 0.25)">
      <span class="progress-stat-val" style="color: var(--color-info)">{pending}</span>
      <span class="progress-stat-label">In Progress</span>
    </div>

    <div class="progress-stat-box" style="border-color: {highPriority > 0 ? 'rgba(244, 63, 94, 0.35)' : undefined}">
      <span class="progress-stat-val" style="color: {highPriority > 0 ? 'var(--color-accent)' : 'var(--text-primary)'}">
        {highPriority}
      </span>
      <span class="progress-stat-label">High Priority Urgent</span>
    </div>
  </div>
</div>
```

---

### 4.4. `BucketCard` Component (`src/components/BucketCard.tsx`)

#### Props Interface:
```typescript
interface BucketCardProps {
  item: BucketListItem;
  onToggleComplete: (id: string) => Promise<boolean> | void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<boolean> | void;
}
```

#### DOM Hierarchy:
```html
<article class="card-container {item.completed ? 'card-completed-border' : ''}">
  <!-- Cover Media -->
  <div class="card-media-wrap">
    {imageLoading ? (
      <div class="card-media-placeholder">
        <svg class="loader-spinner" style="width: 24px; height: 24px;"></svg>
      </div>
    ) : imageUrl ? (
      <img class="card-media-img" src="{imageUrl}" alt="{item.title}" />
    ) : (
      <div class="card-media-placeholder">
        <svg><!-- Compass / Goal placeholder icon --></svg>
      </div>
    )}

    <!-- Priority Badge Pill -->
    <div class="card-priority-badge">
      <span class="badge badge-{item.priority.toLowerCase()}">
        {item.priority}
      </span>
    </div>
  </div>

  <!-- Card Body -->
  <div class="card-body">
    <span class="card-category-badge">{item.category}</span>
    <h4 class="card-title">{item.title}</h4>
    <p class="card-desc">{item.description}</p>

    <!-- Meta Details & Actions -->
    <div class="card-meta">
      <div class="card-date-info">
        <svg><!-- Calendar icon --></svg>
        <span class="card-date-badge">{formattedDate || 'No date'}</span>
      </div>

      <div class="card-actions">
        <!-- Toggle Complete Checkbox Button -->
        <button class="card-toggle-btn {item.completed ? 'card-completed-text' : ''}" onclick="handleToggle">
          <svg><!-- Check icon --></svg>
          <span>{item.completed ? 'Achieved' : 'Mark Done'}</span>
        </button>

        <!-- Edit Action -->
        <button class="btn btn-secondary card-btn-action" onclick="onEdit(item.id)" title="Edit">
          <svg><!-- Edit Pencil icon --></svg>
        </button>

        <!-- Delete Action -->
        <button class="btn btn-danger card-btn-action" onclick="handleDelete" title="Delete">
          <svg><!-- Trash icon --></svg>
        </button>
      </div>
    </div>
  </div>
</article>
```

---

### 4.5. `BucketForm` Component (`src/components/BucketForm.tsx`)

#### Props Interface:
```typescript
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
  submitLabel?: string;   // Default: 'Save Goal' or 'Add to Bucket List'
}
```

#### Category Presets:
```typescript
const CATEGORY_SUGGESTIONS = [
  'Travel',
  'Adventure',
  'Learning & Career',
  'Health & Fitness',
  'Creative & Art',
  'Finance & Wealth',
  'Personal & Life',
];
```

---

### 4.6. `EmptyState` Component (`src/components/EmptyState.tsx`)

#### Props Interface:
```typescript
interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onActionClick: () => void;
  showAction?: boolean;
}
```

---

## 5. Page Layouts & Workflows

### 5.1. `Login` Page (`src/pages/Login.tsx`)
* **States:**
  * `isLoginTab`: Boolean switching between Sign In & Register views.
  * `needsConfirmation`: Boolean triggering the OTP confirmation state.
* **Cognito Username Rule:** During registration, `email` is used as the Cognito auth username, and user-entered username is written to `preferred_username` user attribute.

### 5.2. `Dashboard` Page (`src/pages/Dashboard.tsx`)
* **Filtering Logic:**
  * Search matches `title` OR `description` (case-insensitive).
  * Category matches exact string or bypasses on `'All Categories'`.
  * Priority matches `'ALL'` or `'HIGH'` / `'MEDIUM'` / `'LOW'`.
  * Status matches `'ALL'`, `'ACTIVE'` (`completed === false`), or `'COMPLETED'` (`completed === true`).
* **Sorting Logic:**
  * `date_asc`: Nearest target date first.
  * `date_desc`: Furthest target date first.
  * `priority_desc`: HIGH (3) > MEDIUM (2) > LOW (1).
  * `title_asc`: Alphabetical A-Z.

### 5.3. `Profile` Page (`src/pages/Profile.tsx`)
* **Display Name Fallback Rule:**
  1. `user.preferred_username` (if non-empty)
  2. `user.username` (only if not a 36-char Cognito UUID)
  3. `user.email.split('@')[0]`
  4. Fallback: `'Explorer'`
* **Preset Avatars Array:**
  ```typescript
  const AVATAR_OPTIONS = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
  ];
  ```

---

## 6. Keyframe Animations Specification

All animations must match these exact timing functions in CSS:

```css
/* Ambient glow breathing */
@keyframes ambientPulse {
  0% { transform: scale(0.88); opacity: 0.55; }
  100% { transform: scale(1.15); opacity: 0.95; }
}

/* Orbital Rotations */
@keyframes spinClockwise {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spinCounterClockwise {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

/* Central Badge Shockwave */
@keyframes centralRipples {
  0% { transform: scale(0.85); opacity: 1; }
  100% { transform: scale(1.4); opacity: 0; }
}

/* Central Star Breathing */
@keyframes starBreathe {
  0% { transform: scale(0.9) rotate(0deg); }
  100% { transform: scale(1.1) rotate(15deg); }
}

/* Live Status Indicator Pulse */
@keyframes statusBlink {
  0% { opacity: 0.4; }
  100% { opacity: 1; transform: scale(1.2); }
}

/* Shimmer Progress Track */
@keyframes shimmerMove {
  0% { left: 0%; transform: scaleX(0.7); }
  100% { left: 55%; transform: scaleX(1.1); }
}

/* Smooth Element Entrance */
@keyframes smoothFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 7. Responsive Media Query Rules

```css
/* Tablet Breakpoint */
@media (max-width: 992px) {
  .profile-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

/* Mobile Breakpoint */
@media (max-width: 768px) {
  .navbar {
    width: calc(100% - 20px);
    margin: 8px auto 20px auto;
  }
  .navbar-container { padding: 10px 14px; }
  .navbar-hamburger { display: block; }
  .navbar-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 10px;
    background: rgba(11, 15, 25, 0.96);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
    gap: 6px;
    display: none;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
  }
  .navbar-links-open { display: flex !important; }
  .navbar-username { display: none; }
  .navbar-logout-btn span { display: none; }
  .progress-stats-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-grid { grid-template-columns: 1fr; }
}

/* Small Screen Breakpoint */
@media (max-width: 640px) {
  .dashboard-row { flex-direction: column; align-items: stretch; gap: 10px; }
  .progress-container { padding: 18px 16px; }
  .progress-stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .form-card { padding: 22px 18px; }
  .priority-selector-grid { grid-template-columns: 1fr; }
  .profile-analytics-grid { grid-template-columns: 1fr; }
}
```
