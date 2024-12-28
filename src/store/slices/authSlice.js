import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { authUtils } from "../../utils/auth";

const initialState = {
  user: null,
  token: null, // Don't get token here, let persist handle it
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
        // Pass remember preference to setToken
        authUtils.setToken(token, remember);
        return { user, token };
      }
      return rejectWithValue("Invalid credentials");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const fetchUserData = createAsyncThunk(
  "auth/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getCurrentUser();
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
  },
  extraReducers: (builder) => {
    builder
      .addCase("persist/REHYDRATE", (state, action) => {
        // Restore persisted state but validate token
        if (action.payload?.auth?.token) {
          const isValid = authUtils.isAuthenticated();
          if (!isValid) {
            state.token = null;
            state.user = null;
          }
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
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.userFetched = true; // Set the flag even on error
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
export const { resetAuth, setAuthError, initAuth } = authSlice.actions;

// Selectors
export const selectors = {
  selectAuth: (state) => state.auth,
  selectUser: (state) => state.auth.user,
  selectIsAuthenticated: (state) => Boolean(state.auth.token),
  selectAuthLoading: (state) => state.auth.loading,
  selectAuthError: (state) => state.auth.error,
};

export default authSlice.reducer;
