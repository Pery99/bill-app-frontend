import { Routes, Route } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";

// Public pages
import Home from "../pages/Home";

// Auth pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

// Dashboard pages
import Dashboard from "../pages/Dashboard";
import FundWallet from "../pages/FundWallet";
import Airtime from "../pages/Airtime";
import Data from "../pages/Data";
import Tv from "../pages/Tv";
// import Electricity from "../pages/Electricity";
import Transactions from "../pages/Transactions";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import Support from "../pages/Support";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />

      {/* Auth routes with AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* Protected dashboard routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/fund-wallet" element={<FundWallet />} />
          <Route path="/dashboard/airtime" element={<Airtime />} />
          <Route path="/dashboard/data" element={<Data />} />
          <Route path="/dashboard/tv" element={<Tv />} />
          {/* <Route path="/dashboard/electricity" element={<Electricity />} /> */}
          <Route path="/dashboard/transactions" element={<Transactions />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/support" element={<Support />} />
        </Route>
      </Route>

      {/* 404 route - must be last */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
