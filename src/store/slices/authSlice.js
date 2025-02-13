import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { authUtils } from "../../utils/auth";
import { TOKEN_KEY } from "../../utils/constants";
import api from "../../utils/api";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  userFetched: false,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password, remember = true }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      if (token && user) {
        // Ensure we have the role from the response
        const userWithRole = {
          ...user,
          role: user.role || (await fetchUserRole(token)), // Fallback to fetching role
        };

        // Store everything properly
        authUtils.setToken(token, remember);
        localStorage.setItem("user", JSON.stringify(userWithRole));
        localStorage.setItem("userRole", userWithRole.role);

        return { user: userWithRole, token };
      }
      return rejectWithValue("Invalid credentials");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// Add helper function to fetch user role if needed
const fetchUserRole = async (token) => {
  try {
    const response = await api.get("/auth/me");
    return response.data.role;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};

export const fetchUserData = createAsyncThunk(
  "auth/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");
      // Ensure we store the role immediately when we get it
      if (response.data.role) {
        localStorage.setItem("userRole", response.data.role);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch user data");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all auth data
      authUtils.clearAuthData();
      dispatch(resetAuth());
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", {
        fullname: userData.fullname,
        email: userData.email,
        password: userData.password,
      });

      if (!response.data) {
        throw new Error("No response data received");
      }
      const { token, user } = response.data;

      if (!token) {
        throw new Error("No token received");
      }

      authUtils.setToken(token);
      return {
        user: user || response.data,
        token,
      };
    } catch (error) {
      console.error("Registration error details:", {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message,
      });

      if (error.response?.status === 409) {
        return rejectWithValue("Email already registered");
      }

      return rejectWithValue(
        error.response?.data?.message || error.message || "Registration failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Remove token clearing from resetAuth unless explicitly logging out
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      state.userFetched = false;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
    initAuth: (state) => {
      state.token = authUtils.getToken();
      state.userFetched = false;
    },
    setAuth: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      // Store complete user data including role in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token);
    },
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      // Clear user data from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem(TOKEN_KEY);
      // Clear role when logging out
      localStorage.removeItem("userRole");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase("persist/REHYDRATE", (state, action) => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          state.token = storedToken;
          state.userFetched = false;
        } else {
          state.token = null;
          state.user = null;
          state.userFetched = false;
        }
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        // Ensure role is set in state
        if (action.payload.user.role) {
          localStorage.setItem("userRole", action.payload.user.role);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.userFetched = true; // Set the flag when user is fetched
        state.isAuthenticated = true;
        // Update both user data and role in localStorage
        localStorage.setItem("user", JSON.stringify(action.payload));
        if (action.payload?.role) {
          localStorage.setItem("userRole", action.payload.role);
        }
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.userFetched = true; // Set the flag even on error
        state.isAuthenticated = false;
        // Clear data on fetch failure
        localStorage.removeItem("user");
        localStorage.removeItem(TOKEN_KEY);
        if (action.payload?.status === 401) {
          state.token = null;
          state.user = null;
        }
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.userFetched = false;
        // Ensure token is removed
        authUtils.removeToken();
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      });
  },
});

// Single consolidated export section
export const { resetAuth, setAuthError, initAuth, setAuth } = authSlice.actions;

// Selectors
export const selectors = {
  selectAuth: (state) => state.auth,
  selectUser: (state) => state.auth.user,
  selectIsAuthenticated: (state) => Boolean(state.auth.token),
  selectAuthLoading: (state) => state.auth.loading,
  selectAuthError: (state) => state.auth.error,
};

export default authSlice.reducer;
