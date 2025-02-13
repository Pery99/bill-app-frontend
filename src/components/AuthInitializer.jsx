import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchUserData } from "../store/slices/authSlice";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      if (localStorage.getItem("token")) {
        try {
          const result = await dispatch(fetchUserData()).unwrap();

          // Ensure we store the role properly
          if (result && result.role) {
            localStorage.setItem("userRole", result.role);
          }

          // Get stored user data
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          if (storedUser && storedUser.role) {
            localStorage.setItem("userRole", storedUser.role);
          }

          // Handle routing
          if (result?.role === "admin" || storedUser?.role === "admin") {
            if (!location.pathname.startsWith("/admin")) {
              navigate("/admin", { replace: true });
            }
          } else {
            if (location.pathname.startsWith("/admin")) {
              navigate("/dashboard", { replace: true });
            }
          }
        } catch (error) {
          console.error("Auth initialization failed:", error);
          localStorage.removeItem("userRole");
          navigate("/login", { replace: true });
        }
      }
    };

    initAuth();
  }, [dispatch]);

  // Don't render children while initial auth check is happening
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return children;
};

export default AuthInitializer;
