import { WalletIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

function WalletCard({ balance, lastFunded, loading, formatDate }) {
  return (
    <div className="bg-primary rounded-2xl p-6 relative group">
      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-xs text-white/90">
          <InformationCircleIcon className="w-4 h-4 inline-block mr-1" />
          Active
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <WalletIcon className="w-8 h-8 text-white/80" />
          <h2 className="text-xl text-white font-semibold">Wallet Balance</h2>
        </div>
      </div>

      <p className="text-4xl font-bold text-white mb-4">
        {loading ? (
          <span className="text-2xl">Loading...</span>
        ) : (
          `₦${balance.toLocaleString()}`
        )}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-sm text-white/80">
          {lastFunded
            ? `Last funded: ${formatDate(lastFunded)}`
            : "No recent funding"}
        </span>
      </div>
    </div>
  );
}

export default WalletCard;
