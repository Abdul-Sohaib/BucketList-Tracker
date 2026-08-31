import { useState, useEffect } from 'react';
import type { BucketItem, BucketPriority } from '../types/bucket';

const LOCAL_STORAGE_KEY = 'bucketlist_tracker_items';

const mockBuckets: BucketItem[] = [
  {
    id: "1",
    title: "Visit Japan",
    description: "Explore Tokyo and Kyoto",
    category: "Travel",
    priority: "HIGH",
    targetDate: "2027-06-10",
    completed: false,
    createdAt: "2026-08-30"
  },
];

export function useBucketList() {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load items from localStorage or fallback to mock data
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems(mockBuckets);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockBuckets));
      }
    } catch (e) {
      console.error('Error reading localStorage', e);
      setItems(mockBuckets);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync items to localStorage whenever they change
  const saveItems = (newItems: BucketItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Error writing to localStorage', e);
    }
  };

  const addBucketItem = (
    title: string,
    description: string,
    category: string,
    priority: BucketPriority,
    targetDate: string
  ): BucketItem => {
    const newItem: BucketItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      priority,
      targetDate,
      completed: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    saveItems([newItem, ...items]);
    return newItem;
  };

  const updateBucketItem = (
    id: string,
    updatedFields: Partial<Omit<BucketItem, 'id' | 'createdAt'>>
  ): boolean => {
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex === -1) return false;

    const newItems = [...items];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      ...updatedFields
    };
    saveItems(newItems);
    return true;
  };

  const deleteBucketItem = (id: string): boolean => {
    const newItems = items.filter(item => item.id !== id);
    if (newItems.length === items.length) return false;
    saveItems(newItems);
    return true;
  };

  const toggleComplete = (id: string): boolean => {
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex === -1) return false;

    const newItems = [...items];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      completed: !newItems[itemIndex].completed
    };
    saveItems(newItems);
    return true;
  };

  return {
    items,
    loading,
    addBucketItem,
    updateBucketItem,
    deleteBucketItem,
    toggleComplete
  };
}
