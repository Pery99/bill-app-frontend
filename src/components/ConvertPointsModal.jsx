import { useState } from "react";
import api from "../utils/api";
import { notify } from "../utils/toast";
import {
  InformationCircleIcon,
  XMarkIcon,
  ArrowPathRoundedSquareIcon, // Added for convert icon
  CheckCircleIcon, // Added for success icon
} from "@heroicons/react/24/outline";

function ConvertPointsModal({ isOpen, onClose, points, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [conversionResult, setConversionResult] = useState(null);


  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const response = await api.post("/transactions/convert-points", {
        points,
      });

      setConversionResult({
        pointsConverted: points,
        amountReceived: points * 2,
        newBalance: response.data.newBalance,
        remainingPoints: response.data.remainingPoints,
      });

      notify.success("Points converted successfully!");
      onSuccess(response.data);
    } catch (error) {
      console.log(error);
      notify.error(error.response?.data?.error || "Failed to convert points");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Convert Points to Cash
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Available points: {points.toLocaleString()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mt-1">
                You will receive: ₦{Number(points * 2 || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-3">
              <InformationCircleIcon className="w-5 h-5 text-yellow-700 mt-0.5" />
              <p className="text-sm text-yellow-700">
                - You need a minimum of 100 points
              </p>
              <p className="text-sm text-yellow-700">
                - Converted points will be added to your wallet balance
                immediately.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-600 rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <ArrowPathRoundedSquareIcon className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <ArrowPathRoundedSquareIcon className="w-5 h-5 mr-2" />
                )}
                {loading ? "Converting..." : "Convert Points"}
              </button>
            </div>
          </form>

          {/* Conversion Result */}
          {conversionResult && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-green-900">
                    Conversion Successful!
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-green-700">
                    <p>
                      Points Converted:{" "}
                      {conversionResult.pointsConverted.toLocaleString()}
                    </p>
                    <p>
                      Amount Received: ₦
                      {conversionResult.amountReceived.toLocaleString()}
                    </p>
                    <p>
                      New Balance: ₦
                      {conversionResult.newBalance.toLocaleString()}
                    </p>
                    <p>
                      Remaining Points:{" "}
                      {conversionResult.remainingPoints.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConvertPointsModal;
