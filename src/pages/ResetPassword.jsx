import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authService } from "../services/authService";
import { notify } from "../utils/toast";

function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      await authService.validateResetToken(token);
    } catch (error) {
      setValidToken(false);
      notify.error("Invalid or expired reset link");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      notify.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, formData.password);
      notify.success("Password reset successful!");
      navigate("/login");
    } catch (error) {
      notify.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Invalid Link</h2>
        <p className="text-gray-600 mb-8">This password reset link is invalid or has expired.</p>
        
        <Link
          to="/forgot-password"
          className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors text-center block"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h2>
      <p className="text-gray-600 mb-8">Enter your new password below</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Enter new password"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Confirm new password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <p className="text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-primary hover:text-primary-600 font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default ResetPassword;
