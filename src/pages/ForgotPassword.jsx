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
      <div className="card max-w-md w-full mx-auto">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <EnvelopeIcon className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Check your email
          </h2>
          <p className="text-gray-600 mb-6">
            We've sent password reset instructions to <strong>{email}</strong>
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setSubmitted(false)}
              className="btn-secondary w-full"
            >
              Try another email
            </button>
            <Link to="/login" className="link-text block">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card max-w-md w-full mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
          <p className="mt-2 text-gray-600">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            className="input-field"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </span>
          ) : (
            "Send Reset Instructions"
          )}
        </button>

        <div className="text-center">
          <Link to="/login" className="link-text">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
