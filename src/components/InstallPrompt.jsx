import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { notify } from "../utils/toast";

function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallable(true);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setInstallable(false);
      localStorage.setItem("pwa-installed", "true");
      notify.success("App installed successfully!");
    };

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          type: "module",
        })
        .then((registration) => {
          console.log("SW registered:", registration.scope);
        })
        .catch((error) => {
          console.error("SW registration failed:", error);
        });
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.addEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setInstallable(false);
      }
    } catch (error) {
      console.error("Installation failed:", error);
      notify.error("Installation failed. Please try again.");
    }
  };

  if (!showPrompt || !installable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-50 animate-fade-up">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>

      <div className="flex items-center space-x-4">
        <img
          src="/icons/icon-192x192.png"
          alt="ShabanExpress"
          className="w-12 h-12 rounded-xl"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Install ShabanExpress</h3>
          <p className="text-sm text-gray-600">
            Install our app for a better experience
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          Install
        </button>
      </div>
    </div>
  );
}

export default InstallPrompt;
