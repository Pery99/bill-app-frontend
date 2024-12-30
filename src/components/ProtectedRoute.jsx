import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData, selectors, resetAuth } from "../store/slices/authSlice";
import { authUtils } from "../utils/auth";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import OfflineAlert from "./OfflineAlert";

function ProtectedRoute() {
  const dispatch = useDispatch();
  const { user, loading, token } = useSelector(selectors.selectAuth);
  const { isOnline, retryCount, retry } = useNetworkStatus();
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isOnline) return;
      
      if (token && !user && !loading && authUtils.isAuthenticated()) {
        try {
          setError(null);
          await dispatch(fetchUserData()).unwrap();
        } catch (error) {
          setError(error.message);
          if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
            return; // Don't reset auth on network errors
          }
          dispatch(resetAuth());
        }
      }
    };

    checkAuth();
  }, [dispatch, token, user, loading, isOnline, retryCount]);

  if (!authUtils.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isOnline) {
    return (
      <>
        <Outlet />
        <OfflineAlert onRetry={retry} />
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={retry} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
