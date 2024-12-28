const TOKEN_KEY = "auth_token";
const TOKEN_EXPIRY_KEY = "token_expiry";
const REFRESH_TOKEN_KEY = "refresh_token";

// Token validity duration in hours
const TOKEN_DURATION = 24;

export const authUtils = {
  setToken: (token, remember = true) => {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + (remember ? TOKEN_DURATION : 1));
    
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toISOString());
  },

  getToken: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) return null;
    
    // Check if token has expired
    if (new Date(expiry) < new Date()) {
      authUtils.clearAuthData();
      return null;
    }
    
    return token;
  },

  setRefreshToken: (token) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  clearAuthData: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    authUtils.refreshTokenMethods.clearRefreshTimer();
  },

  isAuthenticated: () => {
    const token = authUtils.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },

  refreshTokenMethods: {
    startRefreshTimer: (expiresIn) => {
      // Clear any existing timer
      if (window.refreshTimer) {
        clearTimeout(window.refreshTimer);
      }
      
      // Set new timer to refresh 1 minute before expiry
      const timeoutId = setTimeout(
        authUtils.refreshTokenMethods.refreshToken,
        (expiresIn - 60) * 1000
      );
      
      window.refreshTimer = timeoutId;
    },

    clearRefreshTimer: () => {
      if (window.refreshTimer) {
        clearTimeout(window.refreshTimer);
      }
    },

    refreshToken: async () => {
      try {
        const refreshToken = authUtils.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await fetch('/api/auth/refresh-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) throw new Error('Token refresh failed');

        const data = await response.json();
        authUtils.setToken(data.token);
        authUtils.setRefreshToken(data.refreshToken);

        // Start new refresh timer
        if (data.expiresIn) {
          authUtils.refreshTokenMethods.startRefreshTimer(data.expiresIn);
        }

        return data.token;
      } catch (error) {
        authUtils.clearAuthData();
        authUtils.refreshTokenMethods.clearRefreshTimer();
        throw new Error('Session expired');
      }
    },

    setupRefreshToken: (expiresIn) => {
      if (expiresIn) {
        authUtils.refreshTokenMethods.startRefreshTimer(expiresIn);
      }
    }
  },
};
