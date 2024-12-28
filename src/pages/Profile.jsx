import { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { notify } from "../utils/toast";
import api from "../utils/api";
import { selectors, fetchUserData } from '../store/slices/authSlice';
import {
  UserCircleIcon,
  ShieldCheckIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector(selectors.selectAuth);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Initialize profile data from user state
  const [profileData, setProfileData] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const tabs = [
    { id: "profile", name: "Profile", icon: UserCircleIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
  ];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put("/auth/update-profile", profileData);
      notify.success("Profile updated successfully, kindly reload");
      // Refresh user data after update
      dispatch(fetchUserData());
    } catch (error) {
      notify.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notify.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await api.put("/user/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      notify.success("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      notify.error(
        error.response?.data?.message || "Failed to update password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Profile & Settings
      </h1>

      {/* Updated Tabs for better mobile responsiveness */}
      <div className="bg-white rounded-xl shadow-sm mb-6 overflow-x-auto">
        <div className="border-b min-w-full">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center px-4 sm:px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <tab.icon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content - Add padding for mobile */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        {activeTab === "profile" && (
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                className="input-field"
                value={profileData.fullname}
                onChange={(e) =>
                  setProfileData({ ...profileData, fullname: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="input-field"
                value={profileData.email}
                disabled
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                className="input-field"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}

        {activeTab === "security" && (
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                className="input-field"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                className="input-field"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                className="input-field"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Coming Soon</h3>
            <p className="text-gray-500">
              Notification preferences will be available in a future update.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
