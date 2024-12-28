import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { notify } from "../utils/toast";
import { loginUser, selectors } from '../store/slices/authSlice';

function Login() {
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "",
    remember: true // Add remember me state
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, token } = useSelector(selectors.selectAuth);

  useEffect(() => {
    // Only redirect if token exists and we're not on the login page
    if (token && location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSuccess = () => {
    navigate("/dashboard", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await dispatch(loginUser({
      email: formData.email,
      password: formData.password,
      remember: formData.remember // Pass remember preference
    }));

    if (result.meta.requestStatus === 'fulfilled') {
      notify.success("Welcome back!");
      handleSuccess();
    } else if (result.payload) {
      notify.error(result.payload);
    }
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-heading-2 text-primary text-center mb-8">
          Welcome Back
        </h2>

        <div className="space-y-2">
          <label className="text-body-small font-medium text-gray-700">
            Email
          </label>
          <input
            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-body-small font-medium text-gray-700">
            Password
          </label>
          <input
            className={`input-field ${errors.password ? 'border-red-500' : ''}`}
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox text-primary"
              checked={formData.remember}
              onChange={(e) => setFormData({
                ...formData,
                remember: e.target.checked
              })}
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <Link to="/forgot-password" className="link-text">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </button>

        <div className="text-center">
          <Link to="/register" className="link-text">
            Don't have an account?{" "}
            <span className="font-semibold text-primary">Sign up</span>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
