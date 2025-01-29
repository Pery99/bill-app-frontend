import { useState, useRef, useEffect } from "react";
import api from "../utils/api";
import { notify } from "../utils/toast";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import { useSelector } from 'react-redux';
import { initializePaystack } from "../utils/paystackConfig";

function Data() {
  // Add user selector
  const user = useSelector((state) => state.auth.user);
  // Add networks constant at the top
  const networks = [
    { id: "1", name: "MTN", logo: "/mtnlogo.svg" },
    { id: "4", name: "Airtel", logo: "/airtel.jfif" },
    { id: "2", name: "Glo", logo: "/glo-logo.png" },
    { id: "3", name: "9Mobile", logo: "/9mobile-logo.jpg" },
  ];

  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("30"); // Changed from 'SME' to '30'
  const [dataPlans, setDataPlans] = useState(null);
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    network: "1",
    phoneNumber: "",
    planId: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("wallet");

  // Update function to extract validity period from plan name and duration
  const extractValidityPeriod = (plan) => {
    const validity = plan.month_validate.toLowerCase();
    
    // Handle special cases for monthly plans
    if (validity.includes('30') || validity.includes('month')) {
      return '30';
    }
    
    // Handle daily plans
    if (validity.includes('24 hrs') || validity.includes('24hrs') || validity.includes('1 day')) {
      return '1';
    }

    // Extract numeric value
    const match = validity.match(/^(\d+)/);
    if (!match) return '30'; // Default to 30 if no number found

    const days = match[1];
    // Normalize 48hrs to 2 days
    if (validity.includes('hrs') || validity.includes('hours')) {
      return Math.ceil(parseInt(days) / 24).toString();
    }

    return days;
  };

  // Update getValidityPeriods function to handle special cases
  const getValidityPeriods = () => {
    if (!dataPlans?.[0]) return [];
    const currentNetwork = formData.network;
    let planData;
    
    switch(currentNetwork) {
      case "1":
        planData = dataPlans[0].MTN_PLAN.ALL || [];
        break;
      case "2":
        planData = dataPlans[0].GLO_PLAN.ALL || [];
        break;
      case "3":
        planData = dataPlans[0]["9MOBILE_PLAN"].ALL || [];
        break;
      case "4":
        planData = dataPlans[0].AIRTEL_PLAN.ALL || [];
        break;
      default:
        planData = [];
    }

    // Get unique validity periods with proper parsing
    const periods = [...new Set(planData.map(plan => extractValidityPeriod(plan)))];

    // Sort periods numerically and filter out invalid ones
    return periods
      .filter(period => !isNaN(period))
      .sort((a, b) => Number(a) - Number(b));
  };

  // Update the network change handler in the dropdown
  const handleNetworkChange = (networkId) => {
    handleInputChange({
      target: { name: "network", value: networkId },
    });
    setIsDropdownOpen(false);
    setFormData((prev) => ({ ...prev, planId: "" }));

    // Try to keep monthly tab, fall back to first available
    const periods = getValidityPeriods();
    if (periods.includes("30")) {
      setActiveTab("30");
    } else {
      setActiveTab(periods[0] || "30");
    }
  };

  // Update getPlanTypes to handle non-MTN networks
  const getPlanTypes = () => {
    if (!dataPlans?.[0]) return [];
    const currentNetwork = formData.network;
    let planData;

    switch (currentNetwork) {
      case "1":
        planData = dataPlans[0].MTN_PLAN;
        // Filter out SME2 from plan types
        return Object.keys(planData).filter(
          (type) =>
            type !== "SME2" &&
            Array.isArray(planData[type]) &&
            planData[type].length > 0
        );
      default:
        // For other networks, only show 'ALL' tab
        return ["ALL"];
    }
  };

  // Update getCurrentPlans to use new validity period extraction
  const getCurrentPlans = () => {
    if (!dataPlans?.[0]) return [];
    
    const currentNetwork = formData.network;
    let planData;
    
    switch(currentNetwork) {
      case "1":
        planData = dataPlans[0].MTN_PLAN.ALL;
        break;
      case "2":
        planData = dataPlans[0].GLO_PLAN.ALL;
        break;
      case "3":
        planData = dataPlans[0]["9MOBILE_PLAN"].ALL;
        break;
      case "4":
        planData = dataPlans[0].AIRTEL_PLAN.ALL;
        break;
      default:
        planData = dataPlans[0].MTN_PLAN.ALL;
    }

    // Filter plans by selected validity period
    return planData?.filter(plan => {
      const planValidity = extractValidityPeriod(plan);
      return planValidity === activeTab;
    }) || [];
  };

  // Update formatValidity function to better handle special cases
  const formatValidity = (validity) => {
    if (!validity) return '';
    
    const lowerValidity = validity.toLowerCase();
    
    // Handle monthly cases
    if (lowerValidity.includes('30') || lowerValidity.includes('month')) {
      return 'Monthly';
    }
    
    // Handle hour cases
    if (lowerValidity.includes('hrs') || lowerValidity.includes('hours')) {
      const hours = parseInt(lowerValidity);
      if (isNaN(hours)) return validity;
      if (hours === 24) return 'Daily';
      return `${Math.ceil(hours / 24)} Days`;
    }

    // Extract the number of days
    const daysMatch = lowerValidity.match(/^(\d+)/);
    if (!daysMatch) return validity;

    const days = parseInt(daysMatch[1]);
    
    // Handle special cases
    if (days === 1) return 'Daily';
    if (days === 7) return 'Weekly';
    if (days === 14) return '2 Weeks';
    if (days === 30) return 'Monthly';
    if (days === 90) return '3 Months';
    if (days === 120) return '4 Months';
    if (days === 365) return 'Annual';

    return `${days} Days`;
  };

  // Update formatPlanType for better display
  const formatPlanType = (type) => {
    const typeMap = {
      'CORPORATE GIFTING': 'Corporate',
      'DATA SHARE': 'Sharing',
      'AWOOF DATA': 'Awoof',
      'SME': 'SME',
      'SME2': 'SME Plus'
    };
    return typeMap[type] || type;
  };

  // Load data plans when component mounts or network changes
  useEffect(() => {
    const fetchDataPlans = async () => {
      setIsLoadingPlans(true);
      try {
        const response = await api.get("/transactions/data-plans");
        if (response.data && Array.isArray(response.data) && response.data[0]) {
          setDataPlans(response.data);
          // Set monthly tab as default
          const periods = getValidityPeriods();
          if (!periods.includes("30")) {
            // If no monthly plans, set to first available period
            setActiveTab(periods[0] || "30");
          }
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (error) {
        console.error("Data plans fetch error:", error);
        notify.error("Failed to load data plans");
      } finally {
        setIsLoadingPlans(false);
      }
    };

    if (formData.network) {
      fetchDataPlans();
    }
  }, [formData.network]);

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

  // Update validateForm function
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

    if (!formData.planId) {
      newErrors.planId = "Please select a data plan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  // Add direct payment handler
  const handleDirectPayment = async (selectedPlan) => {
    
    try {
      const response = await api.post("/transactions/initialize-direct-payment", {
        amount: Number(selectedPlan.plan_amount),
        type: "data",
        email: user.email,
        serviceDetails: {
          phone: formData.phoneNumber,
          provider: formData.network,
          network: formData.network,          
          planId: selectedPlan.dataplan_id,   
          plan: selectedPlan.dataplan_id,   
          amount: selectedPlan.plan_amount
        }
      });

      if (response.data.data) {
        try {
          const result = await initializePaystack({
            email: user.email,
            amount: selectedPlan.plan_amount,
            reference: response.data.data.reference,
          });
          
          if (result.status === 'success') {
            // Verify payment and process transaction
            const verifyResponse = await api.get(
              `/transactions/verify-payment/${result.reference}?type=data`
            );

            if (verifyResponse.data.status === "success") {
              notify.success("Data bundle purchased successfully");
              setFormData({ network: "1", phoneNumber: "", planId: "" });
            } else {
              notify.error("Transaction failed");
            }
          }
        } catch (error) {
          if (error.message === 'Payment cancelled') {
            notify.info("Payment cancelled");
          } else {
            throw error;
          }
        }
      } else {
        notify.error("Failed to initialize payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      notify.error(error.response?.data?.message || "Failed to process payment");
    }
  };

  // Update handleSubmit function with correct field names
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedPlan = getCurrentPlans().find(
      (p) => p.dataplan_id === formData.planId
    );
    if (!selectedPlan) {
      notify.error("Please select a valid data plan");
      return;
    }

    setLoading(true);
    try {
      if (paymentMethod === "direct") {
        await handleDirectPayment(selectedPlan);
        return;
      }

      // Updated request body to use IDs
      const response = await api.post("/transactions/data", {
        mobile_number: formData.phoneNumber,   
        network: formData.network,             
        plan: selectedPlan.dataplan_id,        
        amount: Number(selectedPlan.plan_amount)
      });

      if (response.data.Status === "successful") {
        notify.success("Data bundle purchased successfully");
        setFormData({ network: "1", phoneNumber: "", planId: "" });
      }
    } catch (error) {
      console.error("Error details:", error.response?.data);
      notify.error(
        error.response?.data?.error || "Failed to purchase data bundle"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const getSelectedPlanDetails = () => {
    for (const category of Object.values(networkDataPlans[formData.network])) {
      const plan = category.find((p) => p.id === formData.planId);
      if (plan) return plan;
    }
    return null;
  };

  // Get current network's data plans
  const getCurrentNetworkPlans = () => {
    if (!dataPlans) return [];
    return activeTab === "CORPORATE"
      ? dataPlans.CORPORATE
      : dataPlans[activeTab] || [];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buy Data Bundle</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6 flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Data Bundle Purchase</p>
            <p>
              Select network, enter phone number, and choose your preferred data
              plan
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Update Network and Phone Number Section to be inline */}
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
                    errors.network ? "border-red-500" : "border-gray-300"
                  } bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {formData.network ? (
                    <>
                      <img
                        src={
                          networks.find((n) => n.id === formData.network)?.logo
                        }
                        alt="Network Logo"
                        className="w-8 h-8"
                      />
                      <span className="flex-grow text-left">
                        {networks.find((n) => n.id === formData.network)?.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-500">Select Network</span>
                  )}
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {networks.map((network) => (
                      <button
                        key={network.id}
                        type="button"
                        onClick={() => handleNetworkChange(network.id)}
                        className={`w-full flex items-center space-x-3 p-3 hover:bg-gray-50 ${
                          formData.network === network.id ? "bg-blue-50" : ""
                        }`}
                      >
                        <img
                          src={network.logo}
                          alt={network.name}
                          className="w-8 h-8"
                        />
                        <span className="flex-grow text-left">
                          {network.name}
                        </span>
                        {formData.network === network.id && (
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
          </div>

          {/* Plan Type Tabs */}
          {isLoadingPlans ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading data plans...</p>
            </div>
          ) : (
            <>
              {/* Validity Period Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 overflow-x-auto">
                  {getValidityPeriods().map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => {
                        setActiveTab(period);
                        setFormData(prev => ({ ...prev, planId: "" }));
                      }}
                      className={`
                        whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm
                        ${activeTab === period
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                      `}
                    >
                      {period === "1" ? "Daily" : 
                       period === "7" ? "Weekly" :
                       period === "14" ? "2 Weeks" :
                       period === "30" ? "Monthly" :
                       period === "120" ? "4 Months" :
                       period === "365" ? "Annual" :
                       `${period} Days`}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Data Plans Grid - Updated to conditionally show labels */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-3 mt-4">
                {getCurrentPlans().length > 0 ? (
                  getCurrentPlans().map((plan) => (
                    <button
                      key={plan.dataplan_id}
                      type="button"
                      onClick={() => handleInputChange({
                        target: { name: "planId", value: plan.dataplan_id }
                      })}
                      className={`p-3 rounded-lg border-2 text-left transition-all h-full flex flex-col ${
                        formData.planId === plan.dataplan_id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-200"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-base">{plan.plan}</div>
                        <span className="px-2 py-0.5 text-[10px] leading-4 font-medium rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                          {formatPlanType(plan.plan_type)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{formatValidity(plan.month_validate)}</span>
                      </div>
                      <div className="text-base font-bold mt-auto pt-2">
                        ₦{Number(plan.plan_amount).toLocaleString()}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No data plans available for this category
                  </div>
                )}
              </div>
            </>
          )}

          {errors.planId && (
            <p className="text-red-500 text-xs mt-1">{errors.planId}</p>
          )}

          {/* Add Payment Method Selector */}
          {formData.network && formData.planId && formData.phoneNumber && (
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelect={setPaymentMethod}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                  />
                </svg>
                Processing...
              </span>
            ) : (
              `Pay ${paymentMethod === "wallet" ? "with Wallet" : "with Card"}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Data;
