import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { Toaster } from "react-hot-toast";

// Import components
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FundWallet from "./pages/FundWallet";
import Airtime from "./pages/Airtime";
import Data from "./pages/Data";
import TV from "./pages/TV";
import Electricity from "./pages/Electricity";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Create a separate component for routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      
      {/* Auth routes with layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected dashboard routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/fund-wallet" element={<FundWallet />} />
          <Route path="/dashboard/airtime" element={<Airtime />} />
          <Route path="/dashboard/data" element={<Data />} />
          <Route path="/dashboard/tv" element={<TV />} />
          <Route path="/dashboard/electricity" element={<Electricity />} />
          <Route path="/dashboard/transactions" element={<Transactions />} />
          <Route path="/dashboard/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* 404 route - must be last */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App component
function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }
        persistor={persistor}
      >
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
