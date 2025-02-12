import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Debug logs
  console.log("Auth State:", { isAuthenticated, userRole: user?.role });
  console.log("Stored User:", storedUser);

  // Simplified check
  if (user?.role === "admin" || storedUser?.role === "admin") {
    return children;
  }

  return <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
