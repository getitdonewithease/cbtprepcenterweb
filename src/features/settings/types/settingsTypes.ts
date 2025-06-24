export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  selectedSubjects: string[];
  avatar: string;
}

export interface ApplicationSettings {
  theme: 'light' | 'dark';
  profileVisibility: boolean;
  emailNotifications: boolean;
  joinLeaderboard: boolean;
}

export interface PasswordState {
  current: string;
  new: string;
  confirm: string;
}

export interface Subject {
  value: string;
  label: string;
} 