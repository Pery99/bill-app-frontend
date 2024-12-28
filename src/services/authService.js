import api from "../utils/api";
import { authUtils } from "../utils/auth";

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const { token, user } = response.data;
      if (!token || !user) throw new Error("Invalid response from server");
      authUtils.setToken(token);
      return { token, user };
    } catch (error) {
      throw error.response?.data?.message || error.message || "Login failed";
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = authUtils.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token");

      const response = await api.post("/auth/refresh-token", { refreshToken });
      const { token } = response.data;

      authUtils.setToken(token);
      return token;
    } catch (error) {
      authUtils.clearAuthData();
      throw new Error("Session expired");
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await authService.refreshToken();
          const retryResponse = await api.get("/auth/me");
          return retryResponse.data;
        } catch (refreshError) {
          throw new Error("Session expired");
        }
      }
      throw error;
    }
  },

  // ...existing auth methods...

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to process request" };
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password,
      });
      return response.data;
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw { message: "Invalid or expired reset token" };
      }
      throw error.response?.data || { message: "Failed to reset password" };
    }
  },

  // Helper method to validate reset token
  validateResetToken: async (token) => {
    try {
      const response = await api.get(`/auth/validate-reset-token/${token}`);
      return response.data;
    } catch (error) {
      throw { message: "Invalid or expired reset token" };
    }
  },
};
