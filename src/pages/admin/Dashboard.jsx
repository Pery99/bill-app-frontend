import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { notify } from "../../utils/toast";
import {
  UserCircleIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import Card from "../../components/ui/Card";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/stats");
      setStats(response.data);
    } catch (error) {
      notify.error("Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalUsers || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{(stats?.totalBalance || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Average Balance
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{Math.round(stats?.avgBalance || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/users">
          <Card className="hover:shadow-md transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Manage Users
            </h2>
            <p className="text-gray-600">
              View and manage user accounts, roles, and permissions
            </p>
          </Card>
        </Link>

        <Link to="/admin/data-plans">
          <Card className="hover:shadow-md transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              Data Plans
            </h2>
            <p className="text-gray-600">
              Configure and manage data plans across all networks
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
