export type UserRole = 'admin' | 'operator' | 'viewer';

export interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
  language: string;
}

export interface User {
  id: string;
  email: string;
  password?: string; // Optionnel car ne doit pas être exposé après authentification
  name: string;
  role: UserRole;
  company: string;
  avatar?: string;
  createdAt: Date;
  settings: UserSettings;
}

export interface AuthState {
  user: Omit<User, 'password'> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
