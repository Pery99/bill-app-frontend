import { useState, useEffect } from "react";
import api from "../../utils/api";
import { notify } from "../../utils/toast";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { TableSkeleton } from "../../components/Skeleton";
import Modal from "../../components/ui/Modal";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch (error) {
      notify.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setEditingUser(response.data);
    } catch (error) {
      notify.error("Failed to fetch user details");
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/admin/users/${editingUser._id}`, editingUser);
      notify.success("User updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      notify.error("Failed to update user");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      notify.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      notify.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderEditModal = () => (
    <Modal
      isOpen={!!editingUser}
      onClose={() => setEditingUser(null)}
      title="Edit User"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={editingUser?.fullname || ""}
            onChange={(e) =>
              setEditingUser((prev) => ({
                ...prev,
                fullname: e.target.value,
              }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={editingUser?.email || ""}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            value={editingUser?.role || ""}
            onChange={(e) =>
              setEditingUser((prev) => ({
                ...prev,
                role: e.target.value,
              }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
          <button
            onClick={handleSave}
            className="w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
          >
            Save Changes
          </button>
          <button
            onClick={() => setEditingUser(null)}
            className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header with search */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <div className="mt-4 sm:mt-0">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Responsive table */}
      <div className="overflow-hidden bg-white shadow-sm rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  {editingUser?._id === user._id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editingUser.fullname}
                          onChange={(e) =>
                            setEditingUser((prev) => ({
                              ...prev,
                              fullname: e.target.value,
                            }))
                          }
                          className="input-field"
                        />
                      </td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={editingUser.role}
                          onChange={(e) =>
                            setEditingUser((prev) => ({
                              ...prev,
                              role: e.target.value,
                            }))
                          }
                          className="input-field"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        ₦{user.balance?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-900"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">{user.fullname}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.role}</td>
                      <td className="px-6 py-4">
                        ₦{user.balance?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleEdit(user._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {renderEditModal()}
    </div>
  );
}

export default Users;
