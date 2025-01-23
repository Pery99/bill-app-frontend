import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectors } from "../store/slices/authSlice";
import {
  WalletIcon,
  ArrowUpIcon,
  ClockIcon,
  PhoneIcon,
  WifiIcon,
  TvIcon,
  BoltIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { walletService } from "../services/walletService";
import { notify } from "../utils/toast";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import WalletCard from "../components/WalletCard";

function Dashboard() {
  const { user } = useSelector(selectors.selectAuth);

  const [walletData, setWalletData] = useState({
    balance: 0,
    points: 0, // Add points to state
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
          points: balanceData.points,
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

  const handlePointsConverted = async (data) => {
    try {
      const balanceData = await walletService.getBalance();
      setWalletData((prev) => ({
        ...prev,
        balance: balanceData.balance,
        points: balanceData.points,
      }));
    } catch (error) {
      console.error("Failed to update balance after points conversion:", error);
    }
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
      name: "Airtime",
      href: "/dashboard/airtime",
      icon: PhoneIcon,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
      description: "Buy airtime for any network",
    },
    {
      id: 2,
      name: "Data",
      href: "/dashboard/data",
      icon: WifiIcon,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
      description: "Purchase data bundles",
    },
    {
      id: 3,
      name: "TV",
      href: "/dashboard/tv",
      icon: TvIcon,
      color: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
      description: "Pay TV subscriptions",
    },
    {
      id: 4,
      name: "Electricity",
      href: "/dashboard/electricity",
      icon: BoltIcon,
      color: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200",
      description: "Pay electricity bills",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            {user?.fullname.split(" ")[0] || "Hey"}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Welcome to your dashboard</p>
        </div>
        <Link to="/dashboard/fund-wallet" className="btn-primary !px-6 !w-auto">
          Fund Wallet
        </Link>
      </div>

      {/* Replace existing wallet card with new component */}
      <WalletCard
        balance={walletData.balance}
        points={walletData.points}
        lastFunded={walletData.lastFunded}
        loading={loading}
        formatDate={formatDate}
        onPointsConverted={handlePointsConverted}
      />

      {/* Replace only the Quick Links Section */}
      <div className="py-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.id}
              to={link.href}
              className={`group relative overflow-hidden rounded-xl border ${link.borderColor} transition-all duration-300 hover:shadow-lg`}
            >
              <div className={`p-4 ${link.color}`}>
                <div className="flex flex-col h-full">
                  <div className={`${link.iconColor} mb-3`}>
                    <link.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {link.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {link.description}
                  </p>
                  <div className={`mt-auto flex items-center text-sm font-medium ${link.iconColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <span>Get Started</span>
                    <ArrowRightIcon className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
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
              to="/dashboard/transactions"
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
                  {transaction?.amount?.toLocaleString()}
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
