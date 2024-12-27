import { useState, useEffect, useMemo } from "react";
import { notify } from "../utils/toast";
import api from "../utils/api";

function Data() {
  const [loading, setLoading] = useState(false);
  const [dataPlans, setDataPlans] = useState([]);
  const [selectedPlanType, setSelectedPlanType] = useState("");
  const [formData, setFormData] = useState({
    mobile_number: "",
    network: "",
    plan: "",
    amount: 0,
  });

  const networks = [
    { id: "1", name: "MTN" },
    { id: "4", name: "Airtel" },
    { id: "2", name: "Glo" },
    { id: "3", name: "9mobile" },
  ];

  // Get data plans for selected network
  const getNetworkPlans = useMemo(() => {
    if (!dataPlans?.[0]) return {};

    const networkMap = {
      1: "MTN_PLAN",
      2: "GLO_PLAN",
      3: "9MOBILE_PLAN",
      4: "AIRTEL_PLAN",
    };

    const networkKey = networkMap[formData.network];
    if (!networkKey || !dataPlans[0][networkKey]) return {};

    const selectedNetworkPlans = dataPlans[0][networkKey];

    // For MTN, return all plan types
    if (formData.network === "1") {
      return {
        CORPORATE: selectedNetworkPlans.CORPORATE || [],
        SME: selectedNetworkPlans.SME || [],
        GIFTING: selectedNetworkPlans.GIFTING || [],
        ALL: selectedNetworkPlans.ALL || [],
      };
    }

    // For other networks, just return ALL plans
    return {
      ALL: selectedNetworkPlans.ALL || [],
    };
  }, [dataPlans, formData.network]);

  // Get available plan types for selected network
  const availablePlanTypes = useMemo(() => {
    const types = Object.keys(getNetworkPlans).filter(
      (type) =>
        Array.isArray(getNetworkPlans[type]) && getNetworkPlans[type].length > 0
    );
    return types;
  }, [getNetworkPlans]);

  useEffect(() => {
    fetchDataPlans();
  }, []);

  const fetchDataPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get("/transactions/data-plans");

      if (!Array.isArray(response.data)) {
        setDataPlans([response.data]); // Wrap object in array if not already an array
      } else {
        setDataPlans(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch data plans:", error);
      notify.error(
        error.response?.data?.error || "Failed to fetch data plans"
      );
      setDataPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNetworkChange = (e) => {
    const network = e.target.value;
    setFormData((prev) => ({
      ...prev,
      network,
      plan: "", // Reset plan when network changes
    }));
    setSelectedPlanType(""); // Reset plan type
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Form data:", formData);

    if (!validateForm()) return;
    try {
      const response = await api.post("/transactions/data", formData);
      console.log(response);
      if (response.data.Status === "successful") {
        notify.success("Data purchase successful");
        setFormData({ network: "", mobile_number: "", plan: "", amount: 0 });
        setSelectedPlanType("");
      }
    } catch (error) {
      notify.error(error.response?.data?.error || "Failed to purchase data");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.network) {
      notify.error("Please select a network");
      return false;
    }
    if (
      !formData.mobile_number ||
      !/^[0-9]{11}$/.test(formData.mobile_number)
    ) {
      notify.error("Please enter a valid phone number");
      return false;
    }
    if (!formData.plan) {
      notify.error("Please select a data plan");
      return false;
    }
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buy Data Bundle</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-opacity-75"></div>
            <span className="text-primary text-lg font-semibold">
              Fetching data plans...
            </span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Network Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select Network
            </label>
            <select
              className="input-field"
              value={formData.network}
              onChange={handleNetworkChange}
              required
              disabled={loading}
            >
              <option value="">Select a network</option>
              {networks.map((network) => (
                <option key={network.id} value={network.id}>
                  {network.name}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              className="input-field"
              placeholder="Enter phone number"
              value={formData.mobile_number}
              onChange={(e) =>
                setFormData({ ...formData, mobile_number: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>

          {/* Plan Type Selection - Only show if network is selected */}
          {formData.network && availablePlanTypes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Select Plan Type
              </label>
              <select
                className="input-field"
                value={selectedPlanType}
                onChange={(e) => setSelectedPlanType(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">Select plan type</option>
                {availablePlanTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "ALL"
                      ? "Regular"
                      : type.charAt(0) + type.slice(1).toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Data Plan Selection - Only show if plan type is selected */}
          {selectedPlanType &&
            getNetworkPlans[selectedPlanType]?.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Data Plan
                </label>
                <select
                  className="input-field"
                  value={formData.plan}
                  onChange={(e) => {
                    const selectedOption = e.target.selectedOptions[0];
                    const selectedPrice =
                      selectedOption.getAttribute("data-price");
                    setFormData({
                      ...formData,
                      plan: e.target.value,
                      amount: selectedPrice,
                    });
                  }}
                  required
                  disabled={loading}
                >
                  <option value="">Select a plan</option>
                  {getNetworkPlans[selectedPlanType].map((plan) => (
                    <option
                      key={plan.id}
                      value={plan.id}
                      data-price={Number(plan.plan_amount) + 65}
                    >
                      {plan.month_validate}-{plan.plan} - ₦
                      {(Number(plan.plan_amount) + 65)?.toLocaleString() ||
                        "N/A"}
                    </option>
                  ))}
                </select>
              </div>
            )}

          <button
            type="submit"
            disabled={loading || !formData.plan}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : "Buy Data Bundle"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Data;
