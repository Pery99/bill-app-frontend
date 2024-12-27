import api from '../utils/api';
import { authUtils } from '../utils/auth';

export const authService = {
  // ...existing auth methods...

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to process request' };
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { 
        password 
      });
      return response.data;
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw { message: 'Invalid or expired reset token' };
      }
      throw error.response?.data || { message: 'Failed to reset password' };
    }
  },

  // Helper method to validate reset token
  validateResetToken: async (token) => {
    try {
      const response = await api.get(`/auth/validate-reset-token/${token}`);
      return response.data;
    } catch (error) {
      throw { message: 'Invalid or expired reset token' };
    }
  }
};
