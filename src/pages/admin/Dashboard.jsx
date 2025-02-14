import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { notify } from "../../utils/toast";
import {
  UserCircleIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { StatCardSkeleton } from "../../components/Skeleton";

function Dashboard() {
  const [stats, setStats] = useState({
    totalAmount: 0,
    transactionsByType: [],
    recentTransactions: [],
    totalUsers: 0,
    failedTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  // Add state for API balance
  const [apiBalance, setApiBalance] = useState({
    balance: 0,
    formattedBalance: "₦0",
    lastChecked: null,
  });
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchApiBalance();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setStats(response.data);
    } catch (error) {
      notify.error("Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  // Add function to fetch API balance
  const fetchApiBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const response = await api.get("/admin/api-balance");
      setApiBalance(response.data);
    } catch (error) {
      notify.error("Failed to fetch API balance");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 transform transition-all duration-200 hover:scale-105">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
        {trend && (
          <div
            className={`flex items-center text-${
              trend > 0 ? "green" : "red"
            }-600`}
          >
            {trend > 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 mr-1" />
            )}
            <span className="text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          {typeof value === "number" && title.includes("Revenue") ? "₦" : ""}
          {value?.toLocaleString()}
        </p>
      </div>
    </div>
  );

  const RecentTransactionCard = ({ transaction }) => (
    <div className="p-4 hover:bg-gray-50 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-full ${
              transaction.type === "credit"
                ? "bg-green-100 text-green-600"
                : transaction.type === "debit"
                ? "bg-red-100 text-red-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            <CurrencyDollarIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {transaction.user.fullname}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(transaction.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`text-sm font-medium ${
              transaction.type === "credit"
                ? "text-green-600"
                : transaction.type === "debit"
                ? "text-red-600"
                : "text-gray-900"
            }`}
          >
            {transaction.type === "credit" ? "+" : "-"}₦
            {transaction.amount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/admin/transactions"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View All Transactions
          </Link>
        </div>
      </div>

      {/* API Balance Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">API Balance</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">
                {apiBalance.formattedBalance}
              </p>
            </div>
            {apiBalance.lastChecked && (
              <p className="mt-1 text-sm text-gray-500">
                Last checked:{" "}
                {new Date(apiBalance.lastChecked).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={fetchApiBalance}
            disabled={isLoadingBalance}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowPathIcon
              className={`w-5 h-5 text-gray-600 ${
                isLoadingBalance ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={stats.totalAmount}
          icon={CurrencyDollarIcon}
          trend={12}
          color="green"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={UsersIcon}
          trend={8}
          color="blue"
        />
        <StatCard
          title="Active Transactions"
          value={stats.transactionsByType?.length || 0}
          icon={ChartBarIcon}
          color="purple"
        />
        <StatCard
          title="Failed Transactions"
          value={stats.failedTransactions}
          icon={ExclamationCircleIcon}
          trend={-5}
          color="red"
        />
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Transactions
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentTransactions.map((transaction) => (
              <RecentTransactionCard
                key={transaction._id}
                transaction={transaction}
              />
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Link
              to="/admin/transactions"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all transactions →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Transaction Types
            </h3>
          </div>
          <div className="p-6">
            {stats.transactionsByType.map((type) => (
              <div key={type._id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {type._id}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {type.count} transactions
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(type.count / stats.totalTransactions) * 100}%`,
                    }}
                  ></div>
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
