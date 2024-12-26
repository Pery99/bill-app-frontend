import { useState } from "react";
import { useSelector } from "react-redux";
import { notify } from "../utils/toast";
import api from "../utils/api";
import PaystackPop from "@paystack/inline-js";
import { walletService } from "../services/walletService";
import { useNavigate } from "react-router-dom";

function FundWallet() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const presetAmounts = [1000, 2000, 5000, 10000, 20000];
  const navigate = useNavigate();
  const initializePayment = async (data) => {
    try {
      // console.log("Initializing payment with data:", data); // Debug log

      const response = await api.post("/transactions/initialize-payment", {
        amount: data.amount,
        email: data.email,
        metadata: data.metadata,
      });

      // console.log("Payment initialization response:", response.data); // Debug log

      // Check for correct response structure
      if (!response.data || !response.data.data) {
        throw new Error("Invalid response structure");
      }

      // Return the authorization URL and reference
      return {
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference,
      };
    } catch (error) {
      console.error("Payment initialization error:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(
        error.response?.data?.message || "Failed to initialize payment"
      );
    }
  };

  const verifyPayment = async (reference) => {
    try {
      // Changed to GET request and updated the endpoint URL
      const response = await api.get(
        `/transactions/verify-payment/${reference}`
      );
      // console.log("Verification response:", response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error("Payment verification error:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(
        error.response?.data?.message || "Failed to verify payment"
      );
    }
  };

  const handleAmountClick = (value) => {
    setAmount(value.toString());
  };

  const handlePaymentSuccess = async (verificationData) => {
    try {
      // Fetch updated balance
      const newBalance = await walletService.getBalance();
      notify.success("Payment successful! Your wallet has been credited.");
      navigate("/");
      setAmount("");
    } catch (error) {
      console.error("Error updating balance:", error);
      notify.success("Payment successful! Please refresh to see new balance.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || Number(amount) < 100) {
      notify.error("Please enter a valid amount (minimum ₦100)");
      return;
    }

    setLoading(true);

    try {
      // Prepare payment data
      const paymentData = {
        amount: Number(amount),
        email: user.email,
        metadata: {
          user_id: user._id,
          full_name: user.fullName || user.fullname,
        },
      };

      // Initialize payment
      const initData = await initializePayment(paymentData);

      if (!initData?.authorization_url) {
        throw new Error("Missing authorization URL");
      }

      const handler = PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: Number(amount) * 100,
        ref: initData.reference,
        metadata: paymentData.metadata,
        callback: async (response) => {
          try {
            // console.log("Payment callback response:", response); // Debug log
            const verificationData = await verifyPayment(response.reference);

            if (verificationData.status === "success") {
              await handlePaymentSuccess(verificationData);
            } else {
              notify.error(
                verificationData.message || "Transaction verification failed"
              );
            }
          } catch (error) {
            console.error("Verification error:", error);
            notify.error(error.message || "Failed to verify payment");
          } finally {
            setLoading(false);
          }
        },
        onClose: () => {
          setLoading(false);
          notify.info("Transaction cancelled");
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Payment error:", error);
      setLoading(false);
      notify.error(error.message || "Failed to process payment");
    }
  };

  const calculateFee = (amount) => {
    return (Number(amount) * 0.015).toFixed(2);
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Fund Wallet</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Info Alert - Updated with standard icon */}
        <div className="mb-6 flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
          <svg 
            className="w-5 h-5 text-blue-500 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Transaction Info</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>A free processing fee applies to all deposits</li>
              <li>Instant wallet credit upon successful payment</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Amount (₦)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              placeholder="Enter amount"
              min="100"
              disabled={loading}
            />
          </div>

          {/* Preset amounts */}
          <div className="grid grid-cols-3 gap-2">
            {presetAmounts.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleAmountClick(value)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                ₦{value.toLocaleString()}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !amount}
            className="btn-primary w-full"
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
              <span className="flex items-center justify-center">
                Pay ₦{Number(amount).toLocaleString() || "0"}
                <img
                  src="/paystack-badge.png"
                  alt="Secured by Paystack"
                  className="h-4 ml-2"
                />
              </span>
            )}
          </button>
        </form>

        {/* Note section - Updated with standard icon */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start space-x-3">
          <svg 
            className="w-5 h-5 text-blue-500 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm text-blue-600">
            <strong>Note:</strong> Minimum funding amount is ₦100. Your wallet
            will be credited immediately after successful payment.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FundWallet;
