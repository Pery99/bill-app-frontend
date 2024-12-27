import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  WalletIcon,
  PhoneIcon,
  WifiIcon,
  TvIcon,
  LightBulbIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { logout, fetchUserData } from "../store/slices/authSlice"; // Add fetchUserData import
import toast from "react-hot-toast";
import { notify } from "../utils/toast";
import { walletService } from "../services/walletService";
import { authUtils } from "../utils/auth";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const [walletData, setWalletData] = useState({
    balance: 0,
    loading: true,
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fix: Define navigation array
  const navigation = [
    { name: "Dashboard", href: "/", icon: WalletIcon },
    { name: "Fund Wallet", href: "/fund-wallet", icon: WalletIcon },
    { name: "Buy Airtime", href: "/airtime", icon: PhoneIcon },
    { name: "Buy Data", href: "/data", icon: WifiIcon },
    { name: "TV Subscription", href: "/tv", icon: TvIcon },
    { name: "Buy Electricity", href: "/electricity", icon: LightBulbIcon },
    { name: "Transactions", href: "/transactions", icon: ClockIcon },
  ];

  // Update selector to include userFetched flag
  const { user, token, userFetched } = useSelector((state) => state.auth);

  // Simplify display name logic
  const displayName =
    user?.firstName || user?.fullName?.split(" ")[0] || "User";

  // Single useEffect for user data
  useEffect(() => {
    const init = async () => {
      if (token && !user && !userFetched) {
        try {
          await dispatch(fetchUserData()).unwrap();
        } catch (error) {
          console.error("Failed to fetch user:", error);
          // Only logout if token is invalid
          if (error?.response?.status === 401) {
            handleLogout();
          }
        }
      }
    };

    init();
  }, [token, user, userFetched]);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await walletService.getBalance();
        setWalletData({
          balance: data.balance,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setWalletData((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchBalance(); // Initial fetch

    // Set up interval for periodic refresh
    const intervalId = setInterval(fetchBalance, 30000);

    // Refresh on route change
    const unsubscribe = location.pathname;

    return () => {
      clearInterval(intervalId);
    };
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      authUtils.clearAuthData(); // Add this line
      navigate("/login", { replace: true });
    } catch (error) {
      notify.error("Failed to logout");
      // Force logout on error
      authUtils.clearAuthData();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Backdrop - only show on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-800/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-2xl font-bold text-primary">Quick Bills</h1>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Wallet Balance Card */}
          <div className="p-4">
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="text-sm text-gray-600">Wallet Balance</p>
              <p className="text-2xl font-bold text-primary">
                {walletData.loading ? (
                  <span className="text-lg">Loading...</span>
                ) : (
                  `₦${walletData.balance.toLocaleString()}`
                )}
              </p>
              <Link
                to="/fund-wallet"
                className="mt-3 text-sm text-primary font-medium hover:text-primary-600 inline-flex items-center"
              >
                Fund Wallet
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-xl
                  transition-colors duration-200
                  ${
                    location.pathname === item.href
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t">
            <Link
              to="/profile"
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              <UserCircleIcon className="w-5 h-5 mr-3" />
              Profile & Settings
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 mr-4"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              {/* User Greeting */}
              <div className="flex items-center space-x-3">
                {/* <div className="hidden sm:block">
                  <p className="text-sm text-gray-500">
                    Welcome back,{" "}
                    <span className="text-base font-semibold text-gray-900">
                      {displayName}
                    </span>
                  </p>
                </div> */}
                <div className="flex items-center sm:hidden">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {displayName[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side actions */}
            <div className="ml-auto flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3zm7 4a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
