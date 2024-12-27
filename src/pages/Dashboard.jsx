import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserData } from "../store/slices/authSlice";
import {
  WalletIcon,
  ArrowUpIcon,
  ClockIcon,
  PhoneIcon,
  WifiIcon,
} from "@heroicons/react/24/outline";
import { walletService } from "../services/walletService";
import { notify } from "../utils/toast";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import WalletCard from "../components/WalletCard";

function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [walletData, setWalletData] = useState({
    balance: 0,
    lastFunded: null,
    recentTransactions: [],
  });
  const [fundingHistory, setFundingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const [balanceData, fundingData] = await Promise.all([
          walletService.getBalance(),
          walletService.getFundingHistory(),
        ]);

        setWalletData({
          balance: balanceData.balance,
          lastFunded: balanceData.lastFunded,
          recentTransactions: balanceData.recentTransactions,
        });
        setFundingHistory(fundingData);
      } catch (error) {
        // notify.error("Failed to fetch wallet data");
        console.error("Wallet data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  // Format date helper
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const updates = [
    {
      id: 1,
      title: "Data Plans Now Available",
      description:
        "Get the best data plans for all networks at the best prices.",
      date: new Date(),
    },
    {
      id: 2,
      title: "Wallet Balance Updates",
      description:
        "Real-time balance updates and transaction history now available.",
      date: new Date(),
    },
  ];

  const quickLinks = [
    {
      id: 1,
      name: "Buy Airtime",
      href: "/airtime",
      icon: PhoneIcon,
      color: "bg-purple-100 text-purple-600",
      description: "Purchase airtime for any network",
    },
    {
      id: 2,
      name: "Buy Data",
      href: "/data",
      icon: WifiIcon,
      color: "bg-blue-100 text-blue-600",
      description: "Get internet data bundles",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
          {user?.fullname.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Welcome to your dashboard</p>
        </div>
        <Link to="/fund-wallet" className="btn-primary !px-6 !w-auto">
          Fund Wallet
        </Link>
      </div>

      {/* Replace existing wallet card with new component */}
      <WalletCard
        balance={walletData.balance}
        lastFunded={walletData.lastFunded}
        loading={loading}
        formatDate={formatDate}
      />

      {/* Quick Links Section */}
      <div className="py-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.id}
              to={link.href}
              className="group bg-white rounded-xl p-4 hover:shadow-md transition-all duration-200 border border-gray-100"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${link.color}`}>
                  <link.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary">
                    {link.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {link.description}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Buy Now</span>
                    <ArrowUpIcon className="w-4 h-4 ml-1 rotate-45" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Transactions and Updates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h2>
            <Link
              to="/transactions"
              className="text-sm text-primary hover:text-primary-600"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {walletData.recentTransactions.slice(0, 3).map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {transaction.status === "completed" ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : transaction.status === "pending" ? (
                    <ClockIcon className="w-5 h-5 text-yellow-500" />
                  ) : transaction.status === "failed" ? (
                    <XCircleIcon className="w-5 h-5 text-red-500" />
                  ) : null}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.type === "funding"
                        ? "Wallet Funding"
                        : transaction.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-medium ${
                    transaction.transaction_type === "credit"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.transaction_type === "credit" ? "+" : "-"}₦
                  {transaction.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Updates and News */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Updates & News
          </h2>
          <div className="space-y-4">
            {updates.map((update) => (
              <div
                key={update.id}
                className="border-l-4 border-primary pl-4 py-2"
              >
                <h3 className="font-medium text-gray-900">{update.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {update.description}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-400">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {formatDate(update.date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
