import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import { notify } from "../utils/toast";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      notify.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setSubmitted(true);
      notify.success("Password reset instructions sent to your email");
    } catch (error) {
      notify.error(error.message || "Failed to send reset instructions");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-gray-600 mb-8">
          We've sent password reset instructions to <span className="font-medium">{email}</span>
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => setSubmitted(false)}
            className="w-full px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Try another email
          </button>
          <Link
            to="/login"
            className="block text-center text-sm text-primary hover:text-primary-600 font-medium"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
      <p className="text-gray-600 mb-8">Enter your email to receive reset instructions</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Enter your email"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
