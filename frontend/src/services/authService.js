import axios from 'axios';
import { ref } from 'vue';
import { offlineStorage } from './offlineStorage';
import { notificationService } from './notificationService';

const API_URL = import.meta.env.VITE_API_URL;

class AuthService {
  constructor() {
    this.user = ref(null);
    this.token = ref(null);
    this.isAuthenticated = ref(false);
    this.isLoading = ref(false);
    this.initializeAuth();
  }

  async initializeAuth() {
    try {
      // Check for stored token
      const storedToken = await offlineStorage.getSetting('auth_token');
      if (storedToken) {
        this.token.value = storedToken;
        this.isAuthenticated.value = true;

        // Try to get user data
        if (navigator.onLine) {
          await this.getUserData();
        } else {
          // Get stored user data
          const storedUser = await offlineStorage.getSetting('user_data');
          if (storedUser) {
            this.user.value = storedUser;
          }
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      await this.logout();
    }
  }

  async login(credentials) {
    try {
      this.isLoading.value = true;
      notificationService.info('Logging in...');

      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      const { token, user } = response.data;

      // Store token and user data
      await offlineStorage.setSetting('auth_token', token);
      await offlineStorage.setSetting('user_data', user);

      // Update state
      this.token.value = token;
      this.user.value = user;
      this.isAuthenticated.value = true;

      // Set auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      notificationService.success('Login successful');
      return user;
    } catch (error) {
      console.error('Error logging in:', error);
      notificationService.error('Login failed');
      throw error;
    } finally {
      this.isLoading.value = false;
    }
  }

  async logout() {
    try {
      this.isLoading.value = true;
      notificationService.info('Logging out...');

      // Clear stored data
      await offlineStorage.setSetting('auth_token', null);
      await offlineStorage.setSetting('user_data', null);

      // Clear state
      this.token.value = null;
      this.user.value = null;
      this.isAuthenticated.value = false;

      // Remove auth header
      delete axios.defaults.headers.common['Authorization'];

      notificationService.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      notificationService.error('Logout failed');
      throw error;
    } finally {
      this.isLoading.value = false;
    }
  }

  async getUserData() {
    try {
      if (!this.token.value) return null;

      const response = await axios.get(`${API_URL}/auth/me`);
      const user = response.data;

      // Update stored user data
      await offlineStorage.setSetting('user_data', user);
      this.user.value = user;

      return user;
    } catch (error) {
      console.error('Error getting user data:', error);
      await this.logout();
      throw error;
    }
  }

  async refreshToken() {
    try {
      if (!this.token.value) return null;

      const response = await axios.post(`${API_URL}/auth/refresh`, {
        token: this.token.value
      });
      const { token } = response.data;

      // Update stored token
      await offlineStorage.setSetting('auth_token', token);
      this.token.value = token;

      // Update auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      await this.logout();
      throw error;
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      this.isLoading.value = true;
      notificationService.info('Changing password...');

      await axios.post(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword
      });

      notificationService.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      notificationService.error('Failed to change password');
      throw error;
    } finally {
      this.isLoading.value = false;
    }
  }

  async resetPassword(email) {
    try {
      this.isLoading.value = true;
      notificationService.info('Sending password reset email...');

      await axios.post(`${API_URL}/auth/reset-password`, { email });

      notificationService.success('Password reset email sent');
    } catch (error) {
      console.error('Error resetting password:', error);
      notificationService.error('Failed to send password reset email');
      throw error;
    } finally {
      this.isLoading.value = false;
    }
  }

  getAuthState() {
    return {
      user: this.user.value,
      isAuthenticated: this.isAuthenticated.value,
      isLoading: this.isLoading.value
    };
  }

  getToken() {
    return this.token.value;
  }

  getUser() {
    return this.user.value;
  }

  getLoadingStatus() {
    return this.isLoading.value;
  }
}

export const authService = new AuthService(); 