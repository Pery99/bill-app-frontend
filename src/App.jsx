import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { Toaster } from "react-hot-toast";

// Import components
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
import CustomerCare from "./pages/CustomerCare";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Create a separate component for routes
const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/fund-wallet" element={<FundWallet />} />
          <Route path="/airtime" element={<Airtime />} />
          <Route path="/data" element={<Data />} />
          <Route path="/tv" element={<TV />} />
          <Route path="/electricity" element={<Electricity />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/customer-care" element={<CustomerCare />} />
        </Route>
      </Route>
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
