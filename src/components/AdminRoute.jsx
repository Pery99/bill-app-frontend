import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserData } from "../store/slices/authSlice";

const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const verifyAdminStatus = async () => {
      try {
        // If we don't have a role, fetch fresh user data
        if (isAuthenticated && !user?.role) {
          const result = await dispatch(fetchUserData()).unwrap();
          if (result.role !== "admin") {
            navigate("/dashboard", { replace: true });
          }
        }
      } catch (error) {
        console.error("Admin verification failed:", error);
        navigate("/dashboard", { replace: true });
      }
    };

    verifyAdminStatus();
  }, [isAuthenticated, user, dispatch, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const isAdmin =
    user?.role === "admin" || localStorage.getItem("userRole") === "admin";

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
