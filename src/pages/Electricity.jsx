import { useState, useRef } from "react";
import api from "../utils/api";
import { notify } from "../utils/toast";
import {
  InformationCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import { useSelector } from "react-redux";
import { initializePaystack } from "../utils/paystackConfig";

function Electricity() {
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [selectedDisco, setSelectedDisco] = useState(null);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    disco: "",
    meterNumber: "",
    amount: "",
    meter_type: "1", // Default to PREPAID
  });

  const discos = [
    { id: "aba-electric", name: "Aba Electric" },
    { id: "abuja-electric", name: "Abuja Electric" },
    { id: "benin-electric", name: "Benin Electric" },
    { id: "eko-electric", name: "Eko Electric" },
    { id: "enugu-electric", name: "Enugu Electric" },
    { id: "ibadan-electric", name: "Ibadan Electric" },
    { id: "ikeja-electric", name: "Ikeja Electric" },
    { id: "jos-electric", name: "Jos Electric" },
    { id: "kaduna-electric", name: "Kaduna Electric" },
    { id: "kano-electric", name: "Kano Electric" },
    { id: "portharcourt-electric", name: "Port Harcourt Electric" },
    { id: "yola-electric", name: "Yola Electric" },
  ];

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const selectDisco = (disco) => {
    setSelectedDisco(disco);
    setFormData((prev) => ({ ...prev, disco: disco.id }));
    setIsDropdownOpen(false);
    setIsVerified(false);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, amount: value }));
  };

  const validateAmount = () => {
    if (Number(formData.amount) < 500) {
      notify.error("Minimum amount is ₦500");
      return false;
    }
    return true;
  };

  const handleVerifyMeter = async () => {
    if (!formData.disco || !formData.meterNumber || !formData.amount) {
      notify.error("Please fill all required fields");
      return;
    }

    if (!validateAmount()) {
      return;
    }

    setIsVerifying(true);
    try {
      const response = await api.get("/transactions/verify-electricity", {
        params: {
          disco_name: formData.disco,
          meter_number: formData.meterNumber,
          amount: formData.amount,
          MeterType: formData.meter_type,
        },
      });

      if (response.data.invalid === false) {
        setCustomerName(response.data.name || response.data.customer_name);
        setIsVerified(true);
        notify.success("Meter verified successfully");
      } else {
        notify.error("Invalid meter number");
        setIsVerified(false);
      }
    } catch (error) {
      console.error(error);
      notify.error(error.response?.data?.message || "Failed to verify meter");
      setIsVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDirectPayment = async () => {
    try {
      const response = await api.post(
        "/transactions/initialize-direct-payment",
        {
          amount: Number(formData.amount),
          type: "electricity",
          email: user.email,
          serviceDetails: {
            meter_number: formData.meterNumber,
            disco_name: formData.disco,
            meter_type: formData.meterType,
            amount: formData.amount,
          },
        }
      );

      if (response.data.data) {
        const result = await initializePaystack({
          email: user.email,
          amount: formData.amount,
          reference: response.data.data.reference,
        });

        if (result.status === "success") {
          const verifyResponse = await api.get(
            `/transactions/verify-payment/${result.reference}?type=electricity`
          );

          if (verifyResponse.data.status === "success") {
            notify.success("Payment successful");
            resetForm();
          } else {
            notify.error("Transaction verification failed");
          }
        }
      }
    } catch (error) {
      if (error.message === "Payment cancelled") {
        notify.info("Payment cancelled");
      } else {
        notify.error(error.response?.data?.message || "Payment failed");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      notify.error("Please verify your meter first");
      return;
    }

    setLoading(true);
    try {
      if (paymentMethod === "direct") {
        await handleDirectPayment();
      } else {
        // Wallet payment
        const response = await api.post("/transactions/electricity", {
          meter_number: formData.meterNumber,
          disco_name: formData.disco,
          meter_type: formData.meter_type,
          amount: Number(formData.amount),
        });

        if (response.data.status === "success") {
          notify.success("Payment successful");
          resetForm();
        }
      }
    } catch (error) {
      console.log(error);

      notify.error(error.response?.data?.error || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      disco: "",
      meterNumber: "",
      amount: "",
      meterType: "1",
    });
    setIsVerified(false);
    setCustomerName("");
  };

  // ...rest of the component (UI rendering)
  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Electricity Bill Payment
      </h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Disco Dropdown */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Select Electricity Distribution Company
            </label>
            <button
              type="button"
              onClick={toggleDropdown}
              className="w-full flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-gray-50"
            >
              <span
                className={selectedDisco ? "text-gray-900" : "text-gray-500"}
              >
                {selectedDisco ? selectedDisco.name : "Select Disco"}
              </span>
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                {discos.map((disco) => (
                  <button
                    key={disco.id}
                    type="button"
                    onClick={() => selectDisco(disco)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    {disco.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Meter Type Selection */}
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="1"
                checked={formData.meterType === "1"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    meterType: e.target.value,
                  }))
                }
                className="mr-2"
              />
              Prepaid
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="2"
                checked={formData.meterType === "2"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    meterType: e.target.value,
                  }))
                }
                className="mr-2"
              />
              Postpaid
            </label>
          </div>

          {/* Meter Number and Amount */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Meter Number
              </label>
              <input
                type="text"
                value={formData.meterNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    meterNumber: e.target.value,
                  }))
                }
                className="input-field"
                placeholder="Enter meter number"
                disabled={isVerified}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Amount
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={handleAmountChange}
                className="input-field"
                placeholder="Minimum amount: ₦500"
                disabled={isVerified}
                min="500"
              />
              {formData.amount && Number(formData.amount) < 500 && (
                <p className="text-sm text-red-500 mt-1">
                  Minimum amount is ₦500
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleVerifyMeter}
              disabled={
                isVerifying ||
                isVerified ||
                !formData.meterNumber ||
                !formData.amount
              }
              className="btn-secondary w-full"
            >
              {isVerifying
                ? "Verifying..."
                : isVerified
                ? "✓ Verified"
                : "Verify Meter"}
            </button>

            {isVerified && customerName && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Customer Name:</span>{" "}
                  {customerName}
                </p>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          {isVerified && (
            <div className="space-y-4">
              <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onSelect={setPaymentMethod}
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
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
                  `Pay ${
                    paymentMethod === "wallet" ? "with Wallet" : "with Card"
                  }`
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Electricity;
