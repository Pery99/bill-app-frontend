import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../store/slices/authSlice";
import { notify } from "../utils/toast";

function Register() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullname?.trim()) {
      newErrors.fullname = "Full name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formattedData = {
        fullname: formData.fullname.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      const result = await dispatch(register(formattedData)).unwrap();
      
      if (result?.token) {
        notify.success("Registration successful!");
        navigate("/", { replace: true });
      } else {
        throw new Error('Invalid registration response');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle email already exists error
      if (typeof error === 'string' && (
        error.toLowerCase().includes('already') || 
        error.toLowerCase().includes('exists') ||
        error.toLowerCase().includes('duplicate')
      )) {
        setErrors(prev => ({
          ...prev,
          email: "This email is already registered. Please login instead."
        }));
        return;
      }

      // Handle other errors
      notify.error(
        typeof error === 'string' 
          ? error 
          : "Registration failed. Please try again."
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-heading-2 text-primary text-center mb-8">
          Create Account
        </h2>

        {/* Replace first name and last name with full name */}
        <div className="space-y-2">
          <label className="text-body-small font-medium text-gray-700">
            Full Name
          </label>
          <input
            className={`input-field ${errors.fullname ? "border-red-500" : ""}`}
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleInputChange}
            placeholder="Enter your full name"
          />
          {errors.fullname && (
            <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-body-small font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            className={`input-field ${errors.email ? "border-red-500" : ""}`}
            placeholder="Enter your email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={loading}
            required
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
            type="password"
            className={`input-field ${errors.password ? "border-red-500" : ""}`}
            placeholder="Create a password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={loading}
            required
          />
          <p className="text-xs text-gray-500">Must be at least 6 characters</p>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-body-small font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            className={`input-field ${
              errors.confirmPassword ? "border-red-500" : ""
            }`}
            placeholder="Confirm your password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={loading}
            required
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
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
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>

        <div className="text-center">
          <Link to="/login" className="link-text">
            Already have an account?{" "}
            <span className="font-semibold text-primary">Sign in</span>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Register;
