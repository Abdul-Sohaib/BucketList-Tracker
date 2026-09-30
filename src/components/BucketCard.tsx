import { useEffect, useState } from 'react';
import type { BucketListItem } from '../types/bucket';
import { getBucketImageUrl } from '../utils/storage';

interface BucketCardProps {
  item: BucketListItem;
  onToggleComplete: (id: string) => Promise<boolean> | void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<boolean> | void;
}

// Curated authentic documentary photography covers from the Stitch design system
const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  Travel: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQcawQRvrWkrRO6I38dNmSAeNwiPBcMY5-x9m9gf6P_FCx85E_7GY4v5TnxERFrHGH9EG3dqXjjaXo-X-_iKchPMjWOVwpTRwQKMkJewhTusZrTMZkf4UNPklS69dOH8IUP21Pxi21zvo9TJ54nnldFRzasr3xgsUDPjbphAk2HOMki-H6pcP1OdjigW049nxz4YfKlNLicBX0_l_vMxjGlm4vRrGFTPQtLhwDdfDs39D18iHLDOGC',
  Adventure: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5CWTmjtnQv7G-28qwVIpvGWlS86UnnLhEffnln4rWMgvOapDLKVy2PsI2EyxC6hwREe-NA9sEsF3A0XqkcpuGpkeh17SOkvsQEtkJE0oEcPXv23x6UBsTOZChk6gPKUhoKinajiKYe4stlBilvyYptdP9y2sMt4Wmd2yX1bCnE0zoYiDawrM5VL8S1K_BNtp8u4TqwuWWOJeHtp7z3p27Mij4sL_qW2J8zepIBKtofZMiMwJKhYE7',
  'Creative & Art': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpkDZ3pkW3Lmo484oz0VDBmrh2ma7pEgMNy2UjTqYy2A8B69F8J40tAvviZRodVbc3McbgQ7N28UScilw0ZP0i8zeIujdYIiHXjH2Q0wjTbSR2ztOznnktjNR2AP4aWviq8HCBFXXEdPMqUXoHeTz_iBAgc8h1EVJoFjZaCKzDtQBspj9zdh55BfXXQuWb9IzuR_Msgw8fvGiaeUTegaXqhkonQzGfK1n9Z4acy8_8yYQHKAJ2V1Jj',
  'Health & Fitness': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCM0JqMZfNVmlomaM01FmFipBrIfv93GPCGXhmV42Pi--BeDfvEelsfLbrM-7YVqvXo_3uIBqudcRwi9zPyY6aO0nblqBaBPT1DlHfHwoHuCJyE75Mps7PR3qpVm_onJRiHnLlezfb32xhkk8fvLKgapsr10IVqp5um2HntreW-zpGOPWpwcLIdnznfHHBnwGgDvT-gE57YJsSQHLeY1lehVRsZGlZhJfrcPlA-RzsbzkX7o6a2EMvP',
  'Learning & Career': 'https://lh3.googleusercontent.com/aida-public/AB6AXuASi82CQZEADihUXqee26PP4IBKAPENsAZWfoTjYjB4pdkm8DnUsXqTRYWAM6rfjMgoSIMfLEF6FuW4V4eOHkF_na148T00S9cUeSlx30TjOdiK9joQLq1PhmnhH-PjgrqSPGazul3PZeZyfVDkfbKYqUvw00aBbEj9igBWAawOn4_v8qYqShxmH5g550ob5V-gT8rTaKh7E_YvsEFP__IC_rPCFJPaVRHFDGGLmNAGvBz0DXChWrtg',
  'Finance & Wealth': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGkSk5UfknxsfNL3iJW9CQItVkkaG9mM-t-7ALfbfd3CzSt0887aYjFlIMMM4jru5Ww-GenlA9GGVar6hvclTJW0tWcGjhsroe0qzU8rwMRcJMJ68TFz_S3HNI0JN8XMFwcJE2S_wWhxqqxRHqs2f-f2hTzRIxDhfUyQRHxLLHxC7GWQGlELyO6cy8kmUBYprQBUdQ3TMcY66Oh2SwGJJ_u16E27o7_NkhYYRbhQEcxt8OYdw3jU6q',
  'Personal & Life': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXHWXRa2TfVAZghteVR9kEc9jeVbdM2RUrAfiFSS8WRF5cUldPSNEOtzaYARcBrdNHw_CkBRbIezyuvCG3VmFVnTlkhAuaNiN34neWxqV27akWizI_WS4hpg3doxgthPi9C6ep03uwjidikLTDaDx53pBQlSqFfkzxNLU9uNAov6Lcrx9i-RiMKQWpsyr2aRQlAeQzgqOJHDzG2DSIaISjxIalkjWWu0Aj6FSPX1yoJeGyRDtPqDzH',
};

// Naturalist phase descriptors
const getPhaseStatus = (item: BucketListItem) => {
  if (item.completed) return 'Archived in Vault';
  const p = (item.priority || '').toUpperCase();
  if (p === 'HIGH') return 'Active Milestone Focus';
  if (p === 'MEDIUM') return 'Logistical Formulation';
  return 'Calm Horizon';
};

const getLocationHint = (item: BucketListItem) => {
  const cat = item.category || '';
  if (cat.includes('Travel')) return { icon: 'location_on', label: 'Field Expedition' };
  if (cat.includes('Adventure')) return { icon: 'explore', label: 'Wilderness Route' };
  if (cat.includes('Creative')) return { icon: 'menu_book', label: 'Archival Portfolio' };
  if (cat.includes('Health')) return { icon: 'military_tech', label: 'Endurance Milestone' };
  if (cat.includes('Learning')) return { icon: 'school', label: 'Knowledge Pursuit' };
  if (cat.includes('Finance')) return { icon: 'cottage', label: 'Asset Foundation' };
  return { icon: 'bookmark', label: 'Personal Monograph' };
};

export default function BucketCard({
  item,
  onToggleComplete,
  onEdit,
  onDelete,
}: BucketCardProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const resolveImage = async () => {
      if (!item.imageKey) {
        setImageUrl(DEFAULT_CATEGORY_IMAGES[item.category] || DEFAULT_CATEGORY_IMAGES['Travel']);
        return;
      }

      // If imageKey is already a direct URL
      if (item.imageKey.startsWith('http://') || item.imageKey.startsWith('https://')) {
        setImageUrl(item.imageKey);
        return;
      }

      try {
        const url = await getBucketImageUrl(item.imageKey);
        if (!cancelled && url) {
          setImageUrl(url);
        } else if (!cancelled) {
          setImageUrl(DEFAULT_CATEGORY_IMAGES[item.category] || DEFAULT_CATEGORY_IMAGES['Travel']);
        }
      } catch {
        if (!cancelled) {
          setImageUrl(DEFAULT_CATEGORY_IMAGES[item.category] || DEFAULT_CATEGORY_IMAGES['Travel']);
        }
      }
    };

    resolveImage();
    return () => {
      cancelled = true;
    };
  }, [item.imageKey, item.category]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (toggling) return;
    try {
      setToggling(true);
      await onToggleComplete(item.id);
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Archive & remove "${item.title}" from your field ledger?`);
    if (confirmed) {
      onDelete(item.id);
    }
  };

  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return 'Flexible Timeline';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const dateObj = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        );
        return dateObj.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatDisplayDate(item.targetDate);
  const locationMeta = getLocationHint(item);
  const phaseText = getPhaseStatus(item);
  const priority = (item.priority || 'MEDIUM').toUpperCase();

  return (
    <article className={`dq-bucket-card group ${item.completed ? 'achieved' : ''}`}>
      <div>
        {/* Cover Media Frame */}
        <div className="dq-card-media">
          <img
            src={imageUrl || DEFAULT_CATEGORY_IMAGES['Travel']}
            alt={item.title}
            className="dq-card-img"
            loading="lazy"
          />
          <div className="dq-card-media-overlay" />

          {/* Top Badges */}
          <div className="dq-card-badges-top">
            <span className="dq-badge-category">{item.category || 'General'}</span>
            {item.completed ? (
              <span className="dq-badge-achieved">
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>check_circle</span>
                Achieved
              </span>
            ) : priority === 'HIGH' ? (
              <span className="dq-badge-priority-high">High</span>
            ) : priority === 'MEDIUM' ? (
              <span className="dq-badge-priority-medium">Medium</span>
            ) : (
              <span className="dq-badge-priority-low">Low</span>
            )}
          </div>

          {/* Bottom Location / Nature Tag */}
          <div className="dq-card-tag-bottom">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{locationMeta.icon}</span>
            <span>{locationMeta.label}</span>
          </div>
        </div>

        {/* Narrative & Monograph Body */}
        <div className="dq-card-body">
          {item.completed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem', color: 'var(--primary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
              <span className="font-label-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                Ledger Completed
              </span>
            </div>
          )}

          <h3 className="dq-card-title">
            {item.title}
          </h3>

          <p className="dq-card-desc">
            {item.description || 'No extended field observations recorded for this horizon.'}
          </p>
        </div>
      </div>

      {/* Footer Metrics & Actions */}
      <div className="dq-card-footer">
        <div className="dq-card-meta-row">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>calendar_today</span>
            <span>{formattedDate}</span>
          </span>
          <span style={{ color: item.completed ? 'var(--primary)' : priority === 'HIGH' ? 'var(--secondary)' : 'var(--on-surface-variant)', fontWeight: 600 }}>
            {phaseText}
          </span>
        </div>

        <div className="dq-card-actions-row">
          {/* Mark Done Toggle Button */}
          <button
            type="button"
            className={`dq-btn-mark-done ${item.completed ? 'is-done' : ''}`}
            onClick={handleToggle}
            disabled={toggling}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
              {item.completed ? 'check_box' : 'radio_button_unchecked'}
            </span>
            <span>{item.completed ? 'Achieved' : 'Mark Done'}</span>
          </button>

          {/* Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button
              type="button"
              className="dq-icon-btn"
              onClick={() => onEdit(item.id)}
              title="Edit Quest Record"
              aria-label="Edit"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
            </button>
            <button
              type="button"
              className="dq-icon-btn delete"
              onClick={handleDelete}
              title="Archive from Ledger"
              aria-label="Delete"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}