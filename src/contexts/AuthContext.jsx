import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

/**
 * Provides authentication state and user details to the application.
 * @namespace AuthProvider
 * @component
 */
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  /**
   * Simulates authentication state changes.
   */
  const triggerAuthCheck = () => {
    setIsAuthenticated((prev) => !prev);
    setUserDetails((prev) =>
      prev ? null : { name: 'Guest User', email: 'guest@example.com' }
    );
    console.log('Auth state changed (simulated)');
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userDetails, triggerAuthCheck }}
    >
      {children}
    </AuthContext.Provider>
  );
};
