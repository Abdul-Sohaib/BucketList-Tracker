export type BucketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface BucketListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: BucketPriority;
  targetDate: string;
  imageKey?: string;
  completed: boolean;
  createdAt: string;
}

export type BucketItem = BucketListItem;

export interface User {
  email: string;
  username: string;
  preferred_username?: string;
  bio: string;
  joinedDate: string;
  avatarUrl: string;
}

export type CategoryTheme = {
  icon: string;
  color: string;
  bg: string;
};
