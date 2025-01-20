import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { Toaster } from "react-hot-toast";
import AuthInitializer from "./components/AuthInitializer";
import AppRoutes from "./routes";
import ErrorBoundary from "./components/ErrorBoundary";

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
          <AuthInitializer>
            <AppRoutes />
            <Toaster position="top-right" />
          </AuthInitializer>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
