export enum ClipType {
  LINK = 'LINK',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  TIKTOK = 'TIKTOK',
  INSTAGRAM = 'INSTAGRAM',
  OTHER = 'OTHER'
}

export type StorageProvider = 'DRIVE' | 'OMNICLOUD';

export interface Clip {
  id: string;
  url: string;
  title: string;
  note: string;
  category: string;
  createdAt: string; // ISO Date
  type: ClipType;
  storageProvider: StorageProvider;
  sizeBytes?: number; // Simulated size for quota calculation
  isDriveSynced?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  subscriptionExpiry: string | null; // Access subscription ($0.99/yr)
  
  // Storage Logic
  storageProvider: StorageProvider;
  omniCloudPlan: 'FREE' | '10GB' | '100GB'; // If using OmniCloud
  usedStorageBytes: number;
}

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  driveConnected: boolean;
}

export const detectType = (url: string): ClipType => {
  const lower = url.toLowerCase();
  if (lower.includes('tiktok.com')) return ClipType.TIKTOK;
  if (lower.includes('instagram.com')) return ClipType.INSTAGRAM;
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return ClipType.VIDEO;
  if (lower.match(/\.(jpeg|jpg|gif|png)$/) != null) return ClipType.IMAGE;
  return ClipType.LINK;
};