import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#1E3A8A] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Bill Pay</h1>
          <p className="text-white/80">Manage your bills with ease</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
