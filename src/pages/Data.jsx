import { useState, useRef, useEffect } from "react";
import api from "../utils/api";
import { notify } from "../utils/toast";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

function Data() {
  // Add networks constant at the top
  const networks = [
    { id: "1", name: "MTN", logo: "/mtnlogo.svg" },
    { id: "4", name: "Airtel", logo: "/airtel.jfif" },
    { id: "2", name: "Glo", logo: "/glo-logo.png" },
    { id: "3", name: "9Mobile", logo: "/9mobile-logo.jpg" },
  ];

  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("SME");
  const [dataPlans, setDataPlans] = useState(null);
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    network: "1",
    phoneNumber: "",
    planId: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  // Update the network change handler in the dropdown
  const handleNetworkChange = (networkId) => {
    handleInputChange({
      target: { name: "network", value: networkId },
    });
    setIsDropdownOpen(false);
    setFormData((prev) => ({ ...prev, planId: "" }));

    // Switch to 'ALL' tab for non-MTN networks
    if (networkId !== "1") {
      setActiveTab("ALL");
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

  // Get current plans based on active tab
  const getCurrentPlans = () => {
    if (!dataPlans?.[0]) return [];

    const currentNetwork = formData.network;
    let planData;

    switch (currentNetwork) {
      case "1":
        planData = dataPlans[0].MTN_PLAN;
        break;
      case "2":
        planData = dataPlans[0].GLO_PLAN;
        break;
      case "3":
        planData = dataPlans[0]["9MOBILE_PLAN"];
        break;
      case "4":
        planData = dataPlans[0].AIRTEL_PLAN;
        break;
      default:
        planData = dataPlans[0].MTN_PLAN;
    }

    const plans = planData?.[activeTab] || [];
    // Filter out SME2 plans for MTN ALL tab
    return currentNetwork === "1" && activeTab === "ALL"
      ? plans.filter((plan) => plan.plan_type !== "SME2")
      : plans;
  };

  // Format validity period
  const formatValidity = (validity) => {
    return validity
      .toLowerCase()
      .replace("-days", " Days")
      .replace("(cg)", "")
      .trim();
  };

  // Update formatPlanType function to better handle CORPORATE GIFTING
  const formatPlanType = (type) => {
    if (type === "CORPORATE GIFTING") return "Corporate";
    return type
      .split("_")
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Load data plans when component mounts or network changes
  useEffect(() => {
    const fetchDataPlans = async () => {
      setIsLoadingPlans(true);
      try {
        const response = await api.get("/transactions/data-plans");
        console.log("Data plans response:", response.data); // Debug log
        if (response.data && Array.isArray(response.data) && response.data[0]) {
          setDataPlans(response.data);
          // Set initial active tab only if not already set
          if (!activeTab && response.data[0]) {
            const firstAvailableType = ["SME", "CORPORATE", "ALL"].find(
              (type) => response.data[0][type]?.length > 0
            );
            setActiveTab(firstAvailableType || "SME");
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

  // Update handleSubmit function to include plan amount
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
      const response = await api.post("/transactions/data", {
        mobile_number: formData.phoneNumber,
        network: formData.network,
        plan: selectedPlan.dataplan_id,
        // plan_type: selectedPlan.plan_type,
        amount: Number(selectedPlan.plan_amount), // Add plan amount to request
      });

      if (response.data.Status === "successful") {
        notify.success("Data bundle purchased successfully");
        setFormData({ network: "1", phoneNumber: "", planId: "" });
      }
    } catch (error) {
      console.log(error);

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
              {/* Plan Type Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 overflow-x-auto">
                  {getPlanTypes().map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setActiveTab(type);
                        setFormData((prev) => ({ ...prev, planId: "" }));
                      }}
                      className={`
                        whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm
                        ${
                          activeTab === type
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }
                      `}
                    >
                      {type === "ALL" ? "All Plans" : type}
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
                        {activeTab === 'ALL' && (
                          <span className="px-2 py-0.5 text-[10px] leading-4 font-medium rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                            {formatPlanType(plan.plan_type)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatValidity(plan.month_validate)}
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
              `Buy ${
                getCurrentPlans().find((p) => p.dataplan_id === formData.planId)
                  ?.plan || "Data Bundle"
              } - 
               ₦${
                 getCurrentPlans()
                   .find((p) => p.dataplan_id === formData.planId)
                   ?.plan_amount?.toLocaleString() || "0"
               }`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Data;
