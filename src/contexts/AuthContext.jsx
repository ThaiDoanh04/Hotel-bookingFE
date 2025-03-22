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
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;            
            if (decodedToken.exp && decodedToken.exp < currentTime) {
              console.log('Token expired');
              await AsyncStorage.removeItem('authToken');
              setIsAuthenticated(false);
              setUserDetails(null);
            } else {
              // Use authService instead of networkAdapter
              const response = await authService.getCurrentUser();              
              if (response) {
                setIsAuthenticated(true);
                console.log(response);
                setUserDetails(response);

                console.log(userDetails);
              } else {
                await AsyncStorage.removeItem('authToken');
                setIsAuthenticated(false);
                setUserDetails(null);
              }
            }
          } catch (decodeError) {
            console.error('Invalid token:', decodeError);
            await AsyncStorage.removeItem('authToken');
            setIsAuthenticated(false);
            setUserDetails(null);
          }
        } else {
          setIsAuthenticated(false);
          setUserDetails(null);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setError(err.message || 'Authentication check failed');
        await AsyncStorage.removeItem('authToken');
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, userDetails, triggerAuthCheck, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
