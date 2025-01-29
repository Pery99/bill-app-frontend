import { Outlet, Link } from "react-router-dom";
import { WalletIcon } from "@heroicons/react/24/outline";

function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left Section - Brand & Info */}
      <div className="hidden lg:flex lg:flex-1 bg-primary p-8 text-white justify-center items-center relative overflow-hidden">
        <div className="relative z-10 max-w-xl mx-auto">
          <Link to="/" className="flex items-center space-x-2 mb-12">
            <WalletIcon className="w-8 h-8" />
            <span className="text-2xl font-bold">ShabanExpress</span>
          </Link>

          <h1 className="text-4xl font-bold mb-6">
            Your One-Stop Solution for Bill Payments
          </h1>
          <p className="text-lg text-white/90 mb-8">
            Pay bills, buy airtime, and manage your transactions all in one
            place. Fast, secure, and reliable.
          </p>

          {/* Features List */}
          <div className="space-y-4">
            {[
              "Instant Airtime & Data Recharge",
              "Secure Payment System",
              "24/7 Customer Support",
              "Earn Reward Points",
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 2px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
      </div>

      {/* Right Section - Auth Forms */}
      <div className="w-full lg:w-[580px] flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <WalletIcon className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-gray-900">
              ShabanExpress
            </span>
          </Link>
        </div>

        {/* Auth Content */}
        <div className="flex-1 flex flex-col justify-center p-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md mx-auto">
            <Outlet />
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p className="mt-4">
              &copy; {new Date().getFullYear()} ShabanExpress. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
