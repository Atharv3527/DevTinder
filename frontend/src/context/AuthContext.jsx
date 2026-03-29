import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Load from local storage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('devTinderAuth');
    if (storedAuth) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedAuth));
    }
  }, []);

  const login = (email) => {
    // Mock login credentials check
    const mockUser = { email, name: 'Jane Developer' };
    setIsAuthenticated(true);
    setUser(mockUser);
    localStorage.setItem('devTinderAuth', JSON.stringify(mockUser));
  };

  const signup = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('devTinderAuth', JSON.stringify(userData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('devTinderAuth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
