import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { Toaster } from "react-hot-toast";
import AuthInitializer from "./components/AuthInitializer";
import AppRoutes from "./routes";
import ErrorBoundary from "./components/ErrorBoundary";
import AdminRoute from "./components/AdminRoute";
import AdminDataPlans from "./pages/admin/DataPlans";
import { Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminLayout from "./components/layouts/AdminLayout";
import AdminTransactions from "./pages/admin/Transactions";

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate
          loading={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          }
          persistor={persistor}
        >
          <Routes>
            {/* Add new admin routes */}
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/users" element={<AdminUsers />} />
                      <Route path="/data-plans" element={<AdminDataPlans />} />
                      <Route
                        path="/transactions"
                        element={<AdminTransactions />}
                      />
                    </Routes>
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
          <Toaster position="top-right" />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
