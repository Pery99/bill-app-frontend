import { useState, useRef, useEffect } from "react";
import api from "../utils/api";
import { notify } from "../utils/toast";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import { useSelector } from "react-redux";
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

  // Add new ref for data plans dropdown
  const dataPlansDropdownRef = useRef(null);
  const [isDataPlansDropdownOpen, setIsDataPlansDropdownOpen] = useState(false);

  // Add useEffect for data plans dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dataPlansDropdownRef.current &&
        !dataPlansDropdownRef.current.contains(event.target)
      ) {
        setIsDataPlansDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simplified getCurrentPlans function
  const getCurrentPlans = () => {
    if (!dataPlans) return [];

    const currentNetwork = formData.network;
    switch (currentNetwork) {
      case "1": // MTN
        switch (activeCategory) {
          case "CORPORATE":
            return dataPlans.MTN_PLAN?.CORPORATE || [];
          case "SME":
            return dataPlans.MTN_PLAN?.SME || [];
          case "ALL":
            // Filter out SME and CORPORATE GIFTING plans from ALL category
            const allPlans = dataPlans.MTN_PLAN?.ALL || [];
            return allPlans.filter(
              plan => 
                !["SME", "CORPORATE GIFTING"].includes(plan.plan_type)
            );
          default:
            return [];
        }
      case "2": // GLO
        return dataPlans.GLO_PLAN?.ALL || [];
      case "3": // 9MOBILE
        return dataPlans["9MOBILE_PLAN"]?.ALL || [];
      case "4": // AIRTEL
        return dataPlans.AIRTEL_PLAN?.ALL || [];
      default:
        return [];
    }
  };

  // Simple formatPlanType function
  const formatPlanType = (type) => {
    if (!type) return '';
    return type;
  };

  // Simplified network change handler
  const handleNetworkChange = (networkId) => {
    setFormData((prev) => ({ ...prev, network: networkId, planId: "" }));
    setIsDropdownOpen(false);
    setActiveCategory("ALL");
  };

  // Remove unused functions:
  // - extractValidityPeriod
  // - getValidityPeriods
  // - getPlanTypes
  // - formatValidity
  // - getSelectedPlanDetails
  // - getCurrentNetworkPlans

  // Load data plans when component mounts or network changes
  useEffect(() => {
    const fetchDataPlans = async () => {
      setIsLoadingPlans(true);
      try {
        const response = await api.get("/transactions/data-plans");
        if (response.data) {
          setDataPlans(response.data);
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
      const response = await api.post(
        "/transactions/initialize-direct-payment",
        {
          amount: Number(selectedPlan.plan_amount),
          type: "data",
          email: user.email,
          serviceDetails: {
            phone: formData.phoneNumber,
            provider: formData.network,
            network: formData.network,
            planId: selectedPlan.dataplan_id,
            plan: selectedPlan.dataplan_id,
            amount: selectedPlan.plan_amount,
          },
        }
      );

      if (response.data.data) {
        try {
          const result = await initializePaystack({
            email: user.email,
            amount: selectedPlan.plan_amount,
            reference: response.data.data.reference,
          });

          if (result.status === "success") {
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
          if (error.message === "Payment cancelled") {
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
      notify.error(
        error.response?.data?.message || "Failed to process payment"
      );
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
        amount: Number(selectedPlan.plan_amount),
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

  // Add state for plan category tabs
  const [activeCategory, setActiveCategory] = useState("SME");

  // Add category tabs component for MTN
  const renderMTNCategoryTabs = () => {
    if (formData.network !== "1") return null;

    return (
      <div className="flex space-x-2 mb-4">
        {["SME", "CORPORATE"].map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeCategory === category
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buy Data Bundle</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6 flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Data Bundle Purchase</p>
            <p>Enter phone number and select your preferred data plan</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone Number Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              className={`w-full input-field ${
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

          {/* Network Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Select Network
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between space-x-3 p-2.5 rounded-lg border ${
                  errors.network ? "border-red-500" : "border-gray-300"
                } bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {formData.network ? (
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        networks.find((n) => n.id === formData.network)?.logo
                      }
                      alt="Network Logo"
                      className="w-8 h-8"
                    />
                    <span>
                      {networks.find((n) => n.id === formData.network)?.name}
                    </span>
                  </div>
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

          {/* Add category tabs after network selection */}
          {formData.network === "1" && renderMTNCategoryTabs()}

          {/* Data Plans Selection */}
          {isLoadingPlans ? (
            <div className="py-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading data plans...</p>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Select Data Plan
              </label>
              <div className="relative" ref={dataPlansDropdownRef}>
                <button
                  type="button"
                  onClick={() =>
                    setIsDataPlansDropdownOpen(!isDataPlansDropdownOpen)
                  }
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border ${
                    errors.planId ? "border-red-500" : "border-gray-300"
                  } bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {formData.planId ? (
                    <div className="flex justify-between w-full">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {
                            getCurrentPlans().find(
                              (p) => p.dataplan_id === formData.planId
                            )?.plan
                          }
                        </span>
                        <div className="text-sm text-gray-500">
                          {
                            getCurrentPlans().find(
                              (p) => p.dataplan_id === formData.planId
                            )?.month_validate
                          }{" "}
                          •
                          {formatPlanType(
                            getCurrentPlans().find(
                              (p) => p.dataplan_id === formData.planId
                            )?.plan_type
                          )}
                        </div>
                      </div>
                      <span className="font-bold">
                        ₦
                        {Number(
                          getCurrentPlans().find(
                            (p) => p.dataplan_id === formData.planId
                          )?.plan_amount
                        ).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Select Data Plan</span>
                  )}
                  <svg
                    className={`w-5 h-5 ml-2 transition-transform ${
                      isDataPlansDropdownOpen ? "rotate-180" : ""
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

                {isDataPlansDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {getCurrentPlans().length > 0 ? (
                      getCurrentPlans().map((plan) => (
                        <button
                          key={plan.dataplan_id}
                          type="button"
                          onClick={() => {
                            handleInputChange({
                              target: {
                                name: "planId",
                                value: plan.dataplan_id,
                              },
                            });
                            setIsDataPlansDropdownOpen(false);
                          }}
                          className={`w-full p-4 text-left hover:bg-gray-50 ${
                            formData.planId === plan.dataplan_id
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{plan.plan}</div>
                              <div className="text-sm text-gray-500">
                                {plan.month_validate} •{" "}
                                {formatPlanType(plan.plan_type)}
                              </div>
                            </div>
                            <div className="font-bold">
                              ₦{Number(plan.plan_amount).toLocaleString()}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No data plans available
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.planId && (
                <p className="text-red-500 text-xs mt-1">{errors.planId}</p>
              )}
            </div>
          )}

          {/* Payment Method and Submit Button */}
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
