import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../service/authService';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [authCheckTrigger, setAuthCheckTrigger] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        // Đọc dữ liệu user từ localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            // Cập nhật userDetails từ localStorage
            setUserDetails(parsedUserData);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Error parsing user data:', error);
            setIsAuthenticated(false);
            setUserDetails(null);
          }
        } else {
          setIsAuthenticated(false);
          setUserDetails(null);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
        setUserDetails(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [authCheckTrigger]);

  const triggerAuthCheck = () => {
    setAuthCheckTrigger((prev) => !prev);

  };

  // Kiểm tra xem người dùng có phải admin không
  const isAdmin = () => {
    return userDetails && (userDetails.role === 'ADMIN' || userDetails.role === 1);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userDetails, 
      triggerAuthCheck, 
      loading, 
      error,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};
