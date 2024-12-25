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

function Dashboard() {
  const dispatch = useDispatch();
  const { user, loading, userFetched } = useSelector(state => state.auth);
  
  useEffect(() => {
    if (!user && !userFetched) {
      dispatch(fetchUserData());
    }
  }, [dispatch, user, userFetched]);

  const [walletBalance, setWalletBalance] = useState(0);
  const [recentTransactions] = useState([
    {
      id: 1,
      type: "credit",
      amount: 5000,
      description: "Wallet Funding",
      date: "2024-01-20",
    },
    {
      id: 2,
      type: "debit",
      amount: 1000,
      description: "Airtime Purchase",
      date: "2024-01-19",
    },
  ]);

  const quickStats = [
    {
      id: 1,
      title: "Total Spent",
      amount: "₦45,000",
      trend: "-12%",
      color: "text-red-600",
    },
    {
      id: 2,
      title: "Total Funded",
      amount: "₦120,000",
      trend: "+23%",
      color: "text-green-600",
    },
    {
      id: 3,
      title: "Active Bills",
      amount: "3",
      trend: "0%",
      color: "text-blue-600",
    },
  ];

  const updates = [
    {
      id: 1,
      title: "New Features Added",
      description: "You can now schedule bill payments",
      date: "2024-01-20",
    },
    {
      id: 2,
      title: "System Maintenance",
      description: "Scheduled maintenance on Jan 25",
      date: "2024-01-19",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {loading ? (
              'Loading...'
            ) : (
              `Hello, there! 👋`
            )}
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
          ₦{walletBalance.toLocaleString()}
        </p>
        <div className="flex space-x-4">
          <span className="text-sm text-white/80">Last funded: 2 days ago</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm text-gray-500 mb-2">{stat.title}</h3>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold">{stat.amount}</p>
              <span className={`flex items-center ${stat.color}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions and Updates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Transactions
          </h2>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {transaction.type === "credit" ? (
                      <ArrowDownIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <ArrowUpIcon className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-medium ${
                      transaction.type === "credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}₦
                    {transaction.amount}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No recent transactions
              </p>
            )}
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
                  {update.date}
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
