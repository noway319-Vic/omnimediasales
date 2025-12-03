export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  username: string;
  password?: string; // Only used for initial creation/updates, not stored in plain text ideally (mocking here)
  role: UserRole;
  compTimeBalance: number; // In hours
}

export enum RequestType {
  OVERTIME = 'OVERTIME',
  LEAVE = 'LEAVE',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface WorkRequest {
  id: string;
  userId: string;
  username: string; // Denormalized for easier display
  type: RequestType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  hours: number; // Input hours
  calculatedHours: number; // Actual hours to credit (e.g. weekend rule)
  reason: string;
  status: RequestStatus;
  createdAt: string;
}

export interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}