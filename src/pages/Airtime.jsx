import { useState } from "react";
import api from "../utils/api";
import { notify } from "../utils/toast";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

function Airtime() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    network: "",
    phoneNumber: "",
    amount: "",
  });
  const [errors, setErrors] = useState({});

  const networks = [
    { id: "1", name: "MTN" },
    { id: "4", name: "Airtel" },
    { id: "2", name: "Glo" },
    { id: "3", name: "9Mobile" },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.network) {
      newErrors.network = "Please select a network";
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[0-9]{11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Enter a valid 11-digit phone number";
    }

    const amount = Number(formData.amount);
    if (!amount) {
      newErrors.amount = "Amount is required";
    } else if (amount < 100) {
      newErrors.amount = "Minimum amount is ₦100";
    } else if (amount > 50000) {
      newErrors.amount = "Maximum amount is ₦50,000";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post("/transactions/airtime", {
        phone: formData.phoneNumber,
        provider: formData.network,
        amount: Number(formData.amount),
      });

      if (response.data.Status === "completed") {
        notify.success("Airtime purchased successfully");
        // Clear form
        setFormData({ network: "", phoneNumber: "", amount: "" });
      }
    } catch (error) {
      notify.error(error.response?.data?.error || "Failed to purchase airtime");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buy Airtime</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Info Alert */}
        <div className="mb-6 flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Important Information</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>Minimum amount: ₦100</li>
              <li>Maximum amount: ₦50,000</li>
              <li>Instant delivery to all networks</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select Network
            </label>
            <select
              className={`input-field ${
                errors.network ? "border-red-500" : ""
              }`}
              name="network"
              value={formData.network}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a network</option>
              {networks.map((network) => (
                <option key={network.id} value={network.id}>
                  {network.name}
                </option>
              ))}
            </select>
            {errors.network && (
              <p className="text-red-500 text-xs mt-1">{errors.network}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              className={`input-field ${
                errors.phoneNumber ? "border-red-500" : ""
              }`}
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              name="amount"
              className={`input-field ${errors.amount ? "border-red-500" : ""}`}
              placeholder="Enter amount"
              value={formData.amount}
              onChange={handleInputChange}
              min="100"
              max="50000"
              required
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
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
                Processing...
              </span>
            ) : (
              "Buy Airtime"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Airtime;
