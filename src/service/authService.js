// Import methods from request.js
import { post, get } from '../utils/request.js';

// Authentication service for login and registration
class AuthService {
  // Login method
  async login(credentials) {
    try {
      const response = await post('auth/login', credentials);
      // Store user data or token if needed
      if (response && !response.error) {
        // You might want to store user data in localStorage or sessionStorage 
        localStorage.setItem('authToken',response.token);
        const user = await post('auth/me',{token:response.token});
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response;

    } catch (error) {
      return {
        data: null,
        error: error.message || 'Login failed'
      };
    }
  }

  // Registration method
  async register(userData) {
    try {
      const response = await post('auth/register', userData);
      console.log(response);
      return response;
    } catch (error) {
      return {
        data: null,
        error: error.message || 'Registration failed'
      };
    }
  }

  // Logout method
  async logout() {
    try {
      // const response = await post('auth/logout');
      // Clear user data from storage
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      
      return response;
    } catch (error) {
      return {
        data: null,
        error: error.message || 'Logout failed'
      };
    }
  }

  // Get current user information
  async getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch (error) {
      return null;
    }
  }

  // Check if user is logged in
  isLoggedIn() {
    const user = this.getCurrentUser();
    return !!user;
  }
}

// Export a singleton instance
export const authService = new AuthService();