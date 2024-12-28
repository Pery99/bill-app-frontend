import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData, selectors, resetAuth } from "../store/slices/authSlice";
import { authUtils } from "../utils/auth";

function ProtectedRoute() {
  const dispatch = useDispatch();
  const { user, loading, token } = useSelector(selectors.selectAuth);

  useEffect(() => {
    const checkAuth = async () => {
      if (token && !user && !loading && authUtils.isAuthenticated()) {
        try {
          await dispatch(fetchUserData()).unwrap();
        } catch (error) {
          dispatch(resetAuth());
        }
      }
    };

    checkAuth();
  }, [dispatch, token, user, loading]);

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
