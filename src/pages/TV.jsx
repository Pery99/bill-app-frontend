import { useState, useEffect } from "react";
import { cableService } from "../services/cableService";
import api from "../utils/api";
import { notify } from "../utils/toast";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

function Tv() {
  const [loading, setLoading] = useState(false);
  const [providers] = useState([
    { id: "GOTV", name: "GOtv", logo: "/gotv.webp" },
    { id: "DSTV", name: "DStv", logo: "/dstv.png" },
    { id: "STARTIMES", name: "StarTimes", logo: "/startime.jpg" },
  ]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [plans, setPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [formData, setFormData] = useState({
    smartCardNumber: "",
    planId: "",
  });
  const [errors, setErrors] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // Fetch plans when provider changes
  useEffect(() => {
    const fetchPlans = async () => {
      if (!selectedProvider) return;

      setIsLoadingPlans(true);
      try {
        const data = await cableService.getProviderPlans(selectedProvider);
        if (!Array.isArray(data)) {
          console.error("Invalid data format:", data);
          notify.error("Invalid data format received");
          return;
        }
        setPlans(data);
      } catch (error) {
        console.error("Failed to fetch plans:", error.response?.data || error);
        notify.error("Failed to load cable plans");
        setPlans([]);
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [selectedProvider]);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedProvider) {
      newErrors.provider = "Please select a TV provider";
    }

    if (!formData.smartCardNumber) {
      newErrors.smartCardNumber = "SmartCard number is required";
    }

    if (!formData.planId) {
      newErrors.planId = "Please select a subscription plan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyCard = async () => {
    if (!selectedProvider || !formData.smartCardNumber) {
      notify.error("Please select provider and enter smartcard number");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await api.get(
        `/transactions/verify-tv-card?smartCardNumber=${formData.smartCardNumber}&cablename=${selectedProvider}`
      );

      // console.log(response.data);

      if (response.data.invalid === false) {
        setCustomerName(response.data.name);
        setIsVerified(true);
        notify.success("Card verified successfully");
      } else {
        notify.error("Invalid smartcard number");
      }
    } catch (error) {
      console.log(error);

      notify.error(error.response?.data?.message || "Failed to verify card");
      setIsVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!isVerified) {
      notify.error("Please verify your smartcard first");
      return;
    }

    const selectedPlan = plans.find((p) => p._id === formData.planId);
    if (!selectedPlan) {
      notify.error("Please select a valid plan");
      return;
    }

    setLoading(true);
    try {
      // Update the request body to match exactly what backend expects
      const response = await api.post("/transactions/tv", {
        smartCardNumber: formData.smartCardNumber,
        provider: selectedProvider,
        plan: selectedPlan.cableplan_id,
        amount: Number(selectedPlan.plan_amount)
      });

      console.log('Submitting data:', {
        smart_card_number: formData.smartCardNumber,
        cablename: selectedProvider,
        cableplan: selectedPlan.cableplan_id,
        amount: Number(selectedPlan.plan_amount)
      });

      if (response.data.status === "success") {
        notify.success("Subscription successful");
        // Reset form
        setFormData({ smartCardNumber: "", planId: "" });
        setSelectedProvider("");
        setIsVerified(false);
        setCustomerName("");
      } else {
        throw new Error(response.data.message || "Transaction failed");
      }
    } catch (error) {
      console.error('Submission error:', error);
      notify.error(
        error.response?.data?.error || "Failed to process subscription"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPrice = (plan) => {
    const amount = plan.plan_amount || 0;
    const numericAmount = Number(amount);

    if (isNaN(numericAmount)) {
      console.error("Invalid price for plan:", plan);
      return "₦0";
    }

    return `₦${numericAmount.toLocaleString()}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">TV Subscription</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6 flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Cable TV Subscription</p>
            <p>Select your TV provider and choose a subscription plan</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Provider Selection */}
          <div className="grid grid-cols-3 gap-4">
            {providers.map((provider) => (
              <button
                type="button"
                key={provider.id}
                onClick={() => {
                  setSelectedProvider(provider.id);
                  setFormData((prev) => ({ ...prev, planId: "", smartCardNumber: "" }));
                  setIsVerified(false); // Reset verification state
                  setCustomerName(""); // Reset customer name
                }}
                className={`p-4 rounded-lg border-2 transition-all
                  ${
                    selectedProvider === provider.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-200"
                  }`}
              >
                <img
                  src={provider.logo}
                  alt={provider.name}
                  className="w-full h-12 object-contain mb-2"
                />
                <p className="text-sm font-medium text-center">
                  {provider.name}
                </p>
              </button>
            ))}
          </div>
          {errors.provider && (
            <p className="text-red-500 text-xs mt-1">{errors.provider}</p>
          )}

          {/* SmartCard Number Input with Verification */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  SmartCard Number
                </label>
                <input
                  type="text"
                  value={formData.smartCardNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      smartCardNumber: e.target.value,
                    }))
                  }
                  className={`w-full p-3 rounded-lg border ${
                    errors.smartCardNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your SmartCard number"
                  disabled={isVerified}
                />
              </div>
              <button
                type="button"
                onClick={handleVerifyCard}
                disabled={
                  isVerifying || isVerified || !formData.smartCardNumber
                }
                className="self-end px-4 py-3 text-sm font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
              >
                {isVerifying ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Verifying...</span>
                  </span>
                ) : isVerified ? (
                  <span className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-green-500"
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
                    <span>Verified</span>
                  </span>
                ) : (
                  "Verify Card"
                )}
              </button>
            </div>

            {/* Customer Name Display */}
            {isVerified && customerName && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Customer Name:</span>{" "}
                  {customerName}
                </p>
              </div>
            )}

            {errors.smartCardNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.smartCardNumber}
              </p>
            )}
          </div>

          {/* Show plans only after verification */}
          {isLoadingPlans ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading plans...</p>
            </div>
          ) : selectedProvider ? (
            <div className="grid grid-cols-2 gap-6">
              {plans.map((plan) => (
                <button
                  type="button"
                  key={plan._id}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, planId: plan._id }))
                  }
                  className={`relative overflow-hidden group w-full p-6 rounded-xl transition-all duration-200 ${
                    formData.planId === plan._id
                      ? "bg-blue-50 border-2 border-blue-500 shadow-md"
                      : "bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg"
                  }`}
                >
                  {/* Selected Indicator */}
                  {formData.planId === plan._id && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
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
                      </div>
                    </div>
                  )}

                  {/* Price Tag */}
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {renderPrice(plan)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      One-time payment
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {plan.package}
                    </h3>
                  </div>

                  {/* Bottom Border Highlight */}
                  <div
                    className={`absolute bottom-0 left-0 w-full h-1 transition-all duration-200 ${
                      formData.planId === plan._id
                        ? "bg-blue-500"
                        : "bg-transparent group-hover:bg-blue-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          ) : null}

          {errors.planId && (
            <p className="text-red-500 text-xs mt-1">{errors.planId}</p>
          )}

          <button
            type="submit"
            disabled={loading || !isVerified}
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
                  ></path>
                </svg>
                Processing...
              </span>
            ) : !isVerified ? (
              "Verify Card to Continue"
            ) : (
              `Pay ${renderPrice(plans.find((p) => p._id === formData.planId) || { plan_amount: 0 })}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Tv;
