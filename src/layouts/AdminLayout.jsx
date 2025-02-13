import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import {
  HomeIcon,
  UsersIcon,
  CubeIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline";

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: HomeIcon },
    { name: "Users", href: "/admin/users", icon: UsersIcon },
    { name: "Data Plans", href: "/admin/data-plans", icon: CubeIcon },
    {
      name: "Transactions",
      href: "/admin/transactions",
      icon: ClipboardDocumentListIcon,
    },
    {
      name: "Home",
      href: "/dashboard",
      icon: BriefcaseIcon,
    },

  ];

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  // Close sidebar on navigation and window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity lg:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-300 ease-in-out lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b bg-blue-600">
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 p-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-150 ${
                  location.pathname === item.href
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  {user?.fullname?.[0] || "A"}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullname}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors duration-150"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className={`lg:pl-64 min-h-screen transition-all duration-300`}>
        {/* Top navbar for mobile */}
        <div className="sticky top-0 z-10 lg:hidden">
          <div className="flex items-center justify-between p-4 bg-white shadow-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <div className="w-6" />
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
