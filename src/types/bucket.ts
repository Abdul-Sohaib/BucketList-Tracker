export type BucketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface BucketItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: BucketPriority;
  targetDate: string;
  completed: boolean;
  createdAt: string;
}

export interface User {
  email: string;
  username: string;
  bio: string;
  joinedDate: string;
  avatarUrl: string;
}

export type CategoryTheme = {
  icon: string;
  color: string;
  bg: string;
};
