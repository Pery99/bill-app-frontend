import { useState, useEffect } from "react";
import { cableService } from "../services/cableService";
import api from "../utils/api";
import { notify } from "../utils/toast";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import { initializePaystack } from "../utils/paystackConfig";
import { useSelector } from 'react-redux';

function Tv() {
  const user = useSelector((state) => state.auth.user);
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
  const [paymentMethod, setPaymentMethod] = useState("wallet");

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

      console.log(response.data);

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

  const handleDirectPayment = async (selectedPlan) => {
    try {
      const response = await api.post("/transactions/initialize-direct-payment", {
        amount: Number(selectedPlan.plan_amount),
        type: "tv",
        email: user.email,
        serviceDetails: {
          smartCardNumber: formData.smartCardNumber,
          provider: selectedProvider,
          providerId: selectedProvider,
          plan: selectedPlan.package,
          planId: selectedPlan.id,
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
              `/transactions/verify-payment/${result.reference}?type=tv`
            );

            if (verifyResponse.data.status === "success") {
              notify.success("TV Subscription successful");
              setFormData({ smartCardNumber: "", planId: "" });
              setSelectedProvider("");
              setIsVerified(false);
              setCustomerName("");
            } else {
              notify.error("Transaction verification failed");
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
      if (paymentMethod === "direct") {
        await handleDirectPayment(selectedPlan);
        return;
      }

      // Existing wallet payment logic
      const response = await api.post("/transactions/tv", {
        smartCardNumber: formData.smartCardNumber,
        provider: selectedProvider,
        providerId: selectedProvider,
        plan: selectedPlan.package,
        planId: selectedPlan.id,
        amount: Number(selectedPlan.plan_amount),
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
      console.error(error);
      notify.error(error.response?.data?.error || "Failed to process subscription");
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

  const handleProviderChange = (providerId) => {
    setSelectedProvider(providerId);
    setFormData({ smartCardNumber: "", planId: "" });
    setIsVerified(false);
    setCustomerName("");
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">TV Subscription</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Provider Selection */}
          <div className="grid grid-cols-3 gap-4">
            {providers.map((provider) => (
              <button
                type="button"
                key={provider.id}
                onClick={() => handleProviderChange(provider.id)}
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

          {/* SmartCard Verification Section */}
          {selectedProvider && (
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
                    className="w-full p-3 rounded-lg border border-gray-300"
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
                  {isVerifying
                    ? "Verifying..."
                    : isVerified
                    ? "✓ Verified"
                    : "Verify Card"}
                </button>
              </div>

              {isVerified && customerName && (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Customer Name:</span>{" "}
                    {customerName}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Plans Section - Enhanced Design */}
          {selectedProvider && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">
                Select Subscription Plan
              </h2>
              {isLoadingPlans ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan._id}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, planId: plan._id }))
                      }
                      className={`group relative overflow-hidden rounded-xl transition-all duration-200 cursor-pointer
                        ${
                          formData.planId === plan._id
                            ? "ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-md"
                            : "border border-gray-200 hover:border-blue-200 hover:shadow-lg"
                        }`}
                    >
                      {/* Selected Badge */}
                      {formData.planId === plan._id && (
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                          Selected
                        </div>
                      )}

                      <div className="p-4">
                        {/* Price Section */}
                        <div className="text-center mb-3">
                          <div className="text-2xl font-bold text-gray-900">
                            {renderPrice(plan)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {plan.duration || "Monthly"}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-3"></div>

                        {/* Package Details */}
                        <div className="space-y-2">
                          <h3 className="text-center font-medium text-gray-900">
                            {plan.package}
                          </h3>

                          {/* Features List - if available */}
                          {plan.features && (
                            <ul className="mt-2 space-y-1">
                              {plan.features.map((feature, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center text-sm text-gray-600"
                                >
                                  <svg
                                    className="w-4 h-4 mr-2 text-blue-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        <div className="mt-3 flex justify-center">
                          <div
                            className={`w-4 h-4 rounded-full transition-all duration-200 flex items-center justify-center
                            ${
                              formData.planId === plan._id
                                ? "bg-blue-500"
                                : "border-2 border-gray-300 group-hover:border-blue-300"
                            }`}
                          >
                            {formData.planId === plan._id && (
                              <svg
                                className="w-3 h-3 text-white"
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
                          </div>
                        </div>
                      </div>

                      {/* Bottom Highlight */}
                      <div
                        className={`absolute bottom-0 left-0 w-full h-1 transition-transform duration-200
                        ${
                          formData.planId === plan._id
                            ? "bg-blue-500"
                            : "bg-transparent group-hover:bg-blue-100"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Payment Method Selector */}
          {selectedProvider && formData.planId && (
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelect={setPaymentMethod}
            />
          )}

          <button
            type="submit"
            disabled={loading || !isVerified || !formData.planId}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
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

export default Tv;
