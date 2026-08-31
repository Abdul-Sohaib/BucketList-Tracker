import type { BucketPriority } from '../types/bucket';

export interface BucketFormErrors {
  title?: string;
  description?: string;
  category?: string;
  targetDate?: string;
  priority?: string;
}

export function validateBucket(data: {
  title: string;
  description: string;
  category: string;
  priority: BucketPriority;
  targetDate: string;
}): BucketFormErrors {
  const errors: BucketFormErrors = {};

  // Title validation
  if (!data.title.trim()) {
    errors.title = 'Title is required.';
  } else if (data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters.';
  } else if (data.title.trim().length > 80) {
    errors.title = 'Title must be less than 80 characters.';
  }

  // Description validation
  if (!data.description.trim()) {
    errors.description = 'Description is required.';
  } else if (data.description.trim().length < 5) {
    errors.description = 'Description must be at least 5 characters.';
  }

  // Category validation
  if (!data.category.trim()) {
    errors.category = 'Category is required.';
  }

  // Target Date validation
  if (!data.targetDate) {
    errors.targetDate = 'Target date is required.';
  } else {
    const selectedDate = new Date(data.targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // ignore hours to compare days
    
    if (isNaN(selectedDate.getTime())) {
      errors.targetDate = 'Please select a valid date.';
    } else if (selectedDate < today) {
      errors.targetDate = 'Target date cannot be in the past.';
    }
  }

  return errors;
}
