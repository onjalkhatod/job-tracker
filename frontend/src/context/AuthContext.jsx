/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    return (!savedToken || savedToken === 'undefined') ? null : savedToken;
  });
  
  // Hardened user state initializer protected against stringified 'undefined' or malformed JSON
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser || savedUser === 'undefined') return null;
    
    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('user'); 
      return null;
    }
  });

  const login = (newToken, userData) => {
    if (!newToken || !userData) {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return;
    }
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    
    window.location.href = '/'; 
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be executed within an explicit AuthProvider wrap container.');
  }
  return context;
}