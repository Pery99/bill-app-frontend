import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserData } from '../store/slices/authSlice';
import {
  WalletIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { walletService } from "../services/walletService";
import { notify } from "../utils/toast";

function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [walletData, setWalletData] = useState({
    balance: 0,
    lastFunded: null,
    recentTransactions: []
  });
  const [fundingHistory, setFundingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const [balanceData, fundingData] = await Promise.all([
          walletService.getBalance(),
          walletService.getFundingHistory()
        ]);

        setWalletData({
          balance: balanceData.balance,
          lastFunded: balanceData.lastFunded,
          recentTransactions: balanceData.recentTransactions
        });
        setFundingHistory(fundingData);
      } catch (error) {
        notify.error("Failed to fetch wallet data");
        console.error("Wallet data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  // Format date helper
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const updates = [
    {
      id: 1,
      title: "New Features Added",
      description: "You can now schedule bill payments and track your spending.",
      date: new Date(),
    },
    {
      id: 2,
      title: "Wallet Balance Updates",
      description: "Real-time balance updates and transaction history now available.",
      date: new Date(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hello, {user?.fullname?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Welcome to your dashboard</p>
        </div>
        <Link to="/fund-wallet" className="btn-primary !px-6 !w-auto">
          Fund Wallet
        </Link>
      </div>

      {/* Wallet Card */}
      <div className="bg-primary rounded-2xl p-6">
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
            `₦${walletData.balance.toLocaleString()}`
          )}
        </p>
        <div className="flex space-x-4">
          <span className="text-sm text-white/80">
            {walletData.lastFunded 
              ? `Last funded: ${formatDate(walletData.lastFunded)}`
              : 'No recent funding'}
          </span>
        </div>
      </div>

      {/* Recent Transactions */}
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
                  {transaction.transaction_type === "credit" ? (
                    <ArrowDownIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ArrowUpIcon className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.type === 'funding' ? 'Wallet Funding' : transaction.type}
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
