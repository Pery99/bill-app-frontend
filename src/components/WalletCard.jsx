import { useState } from "react";
import {
  WalletIcon,
  GiftIcon,
  ArrowPathRoundedSquareIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import ConvertPointsModal from "./ConvertPointsModal";

function WalletCard({
  balance,
  lastFunded,
  points,
  loading,
  formatDate,
  onPointsConverted,
}) {
  const [showConvertModal, setShowConvertModal] = useState(false);

  const handleConvertSuccess = (data) => {
    if (onPointsConverted) {
      onPointsConverted(data);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Balance Section */}
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <WalletIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Balance</p>
              {loading ? (
                <div className="h-8 bg-gray-200 animate-pulse rounded w-32 mt-1"></div>
              ) : (
                <h3 className="text-2xl font-bold text-gray-900">
                  {balance.full}
                </h3>
              )}
              {lastFunded && (
                <p className="text-xs text-gray-500 mt-1">
                  Last funded: {formatDate(lastFunded)}
                </p>
              )}
            </div>
          </div>

          {/* Points Section with Icon Button */}
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <GiftIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reward Points</p>
                  {loading ? (
                    <div className="h-8 bg-gray-200 animate-pulse rounded w-32 mt-1"></div>
                  ) : (
                    <h3 className="text-2xl font-bold text-yellow-600">
                      {points?.toLocaleString() || "0"} pts
                    </h3>
                  )}
                </div>
                {points > 0 && (
                  <button
                    onClick={() => setShowConvertModal(true)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Convert Points to Cash"
                  >
                    <ArrowPathRoundedSquareIcon className="w-6 h-6" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Earn points with every transaction
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConvertPointsModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        points={points}
        onSuccess={handleConvertSuccess}
      />
    </>
  );
}

export default WalletCard;
