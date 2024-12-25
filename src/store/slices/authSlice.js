import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { authUtils } from "../../utils/auth";

const initialState = {
  user: null,
  token: authUtils.getToken(), // This will now validate the token
  loading: false,
  error: null,
  userFetched: false,
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password, remember = true }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      if (token && user) {
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
      const response = await api.get("/auth/me");
      if (!response.data) {
        throw new Error("No user data received");
      }
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw error; // Network or other errors
      }
      return rejectWithValue({
        status: error.response.status,
        message: error.response.data?.message || "Failed to fetch user data",
      });
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
      // console.log('Sending registration data:', userData);

      const response = await api.post("/auth/register", {
        fullname: userData.fullname,
        email: userData.email,
        password: userData.password,
      });

      // console.log('Registration response:', response.data);
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
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      state.userFetched = false;
      // Clear stored token
      authUtils.removeToken();
    },
    initAuth: (state) => {
      state.token = authUtils.getToken();
      state.userFetched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
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
        console.log("Updated user state:", action.payload); // Debug log
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

export const { resetAuth, initAuth } = authSlice.actions;
export default authSlice.reducer;
