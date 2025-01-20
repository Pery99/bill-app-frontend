import { useState, useRef, useEffect } from "react";
import api from "../utils/api";
import { notify } from "../utils/toast";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

function Airtime() {
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    network: "1", // Default to MTN
    phoneNumber: "",
    amount: "",
  });
  const [errors, setErrors] = useState({});

  const networks = [
    { id: "1", name: "MTN", logo: "/mtnlogo.svg" },
    { id: "4", name: "Airtel", logo: "/airtel.jfif" },
    { id: "2", name: "Glo", logo: "/glo-logo.png" },
    { id: "3", name: "9Mobile", logo: "/9mobile-logo.jpg" },
  ];

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

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
      // console.log('THIS IS ITTTTTT' ,response);
      if (response.data.Status === "successful") {
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

  const handleQuickAmountSelect = (amount) => {
    setFormData(prev => ({ ...prev, amount: amount.toString() }));
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: "" }));
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buy Airtime</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6 flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Quick Airtime Purchase</p>
            <p>Select network, enter phone number, and choose amount</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Update Network and Phone Number to be inline */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Network Dropdown - adjust width */}
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Select Network
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center space-x-3 p-2.5 rounded-lg border ${
                    errors.network ? 'border-red-500' : 'border-gray-300'
                  } bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {formData.network ? (
                    <>
                      <img
                        src={networks.find(n => n.id === formData.network)?.logo}
                        alt="Network Logo"
                        className="w-8 h-8"
                      />
                      <span className="flex-grow text-left">
                        {networks.find(n => n.id === formData.network)?.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-500">Select Network</span>
                  )}
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {networks.map((network) => (
                      <button
                        key={network.id}
                        type="button"
                        onClick={() => {
                          handleInputChange({
                            target: { name: "network", value: network.id }
                          });
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 p-3 hover:bg-gray-50 ${
                          formData.network === network.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <img
                          src={network.logo}
                          alt={network.name}
                          className="w-8 h-8"
                        />
                        <span className="flex-grow text-left">{network.name}</span>
                        {formData.network === network.id && (
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.network && (
                <p className="text-red-500 text-xs mt-1">{errors.network}</p>
              )}
            </div>

            {/* Phone Number Input - adjust width */}
            <div className="w-full md:w-2/3">
              <label className="text-sm font-medium text-gray-700 block mb-2">
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
          </div>

          {/* Quick Amounts */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Quick Amount
            </label>
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleQuickAmountSelect(amount)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.amount === amount.toString()
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-200"
                  }`}
                >
                  ₦{amount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input - Always visible */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Custom Amount
            </label>
            <input
              type="number"
              name="amount"
              className={`input-field ${errors.amount ? "border-red-500" : ""}`}
              placeholder="Enter amount (₦100 - ₦50,000)"
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
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Processing...
              </span>
            ) : (
              `Buy ₦${Number(formData.amount).toLocaleString() || '0'} Airtime`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Airtime;
