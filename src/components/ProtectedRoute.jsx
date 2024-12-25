import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData, resetAuth } from "../store/slices/authSlice";
import { authUtils } from "../utils/auth";
import AuthInitializer from "./AuthInitializer";

function ProtectedRoute() {
  return (
    <AuthInitializer>
      <ProtectedRouteContent />
    </AuthInitializer>
  );
}

function ProtectedRouteContent() {
  const dispatch = useDispatch();
  const { user, loading, userFetched, token } = useSelector(
    (state) => state.auth
  );

  const validateAndFetchUser = useCallback(async () => {
    if (!authUtils.isAuthenticated()) {
      dispatch(resetAuth());
      return false;
    }

    if (!user && !userFetched && token) {
      try {
        await dispatch(fetchUserData()).unwrap();
      } catch (error) {
        console.error("Auth validation failed:", error);
        dispatch(resetAuth());
        return false;
      }
    }
    return true;
  }, [dispatch, user, userFetched, token]);

  useEffect(() => {
    validateAndFetchUser();
  }, [validateAndFetchUser]);

  if (!authUtils.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
