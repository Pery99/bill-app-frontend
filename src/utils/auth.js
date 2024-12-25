const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const authUtils = {
  getToken: () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return null;
    
    try {
      // Add basic token validation
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      if (tokenData.exp * 1000 < Date.now()) {
        authUtils.removeToken();
        return null;
      }
      return token;
    } catch (error) {
      console.error('Token validation error:', error);
      authUtils.removeToken();
      return null;
    }
  },

  setToken: (token, remember = true) => {
    if (!token) return false;
    try {
      if (remember) {
        localStorage.setItem('token', token);
        sessionStorage.removeItem('token');
      } else {
        sessionStorage.setItem('token', token);
        localStorage.removeItem('token');
      }
      return true;
    } catch (error) {
      console.error('Error storing token:', error);
      return false;
    }
  },

  removeToken: () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  },

  isAuthenticated: () => {
    return !!authUtils.getToken();
  },

  clearAuthData: () => {
    authUtils.removeToken();
    // Don't reload the page, let React handle navigation
  }
};
