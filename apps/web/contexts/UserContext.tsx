'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
  permissions: {
    disciplines: string[];
    authorizedClients: string[];
    canGenerateNotes: boolean;
    canExecuteWorkflows: boolean;
    canViewAnalytics: boolean;
    canManageTickets: boolean;
  };
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user data for demo
const DEMO_USER: User = {
  id: 'cole.mains',
  name: 'Cole Mains',
  email: 'cole.mains@ai-ctrl.com',
  role: 'AI CTRL Engineer',
  department: 'Service Management Center (SMC)',
  joinDate: 'January 15, 2024',
  permissions: {
    disciplines: ['SMC', 'NOC', 'Security'],
    authorizedClients: [
      'Alpha Manufacturing',
      'Beta Tech Solutions',
      'Gamma Logistics',
      'Delta Financial Services',
    ],
    canGenerateNotes: true,
    canExecuteWorkflows: true,
    canViewAnalytics: true,
    canManageTickets: true,
  },
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Auto-login for demo mode
  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('ai-ctrl-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      // Auto-login for demo
      setUser(DEMO_USER);
      setIsAuthenticated(true);
      localStorage.setItem('ai-ctrl-user', JSON.stringify(DEMO_USER));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Replace with real API call
    console.log('Login attempt:', email);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock authentication
    if (email === 'cole.mains@ai-ctrl.com') {
      setUser(DEMO_USER);
      setIsAuthenticated(true);
      localStorage.setItem('ai-ctrl-user', JSON.stringify(DEMO_USER));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('ai-ctrl-user');
    sessionStorage.clear();
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('ai-ctrl-user', JSON.stringify(updatedUser));
    }
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
