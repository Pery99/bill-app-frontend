import { useState, useEffect } from "react";
import api from "../../utils/api";
import { notify } from "../../utils/toast";
import Modal from "../../components/ui/Modal";

function DataPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [activeNetwork, setActiveNetwork] = useState("MTN");
  const [searchQuery, setSearchQuery] = useState("");

  const networkTabs = [
    { id: "MTN", name: "MTN", color: "yellow" },
    { id: "GLO", name: "GLO", color: "green" },
    { id: "AIRTEL", name: "Airtel", color: "red" },
    { id: "9MOBILE", name: "9Mobile", color: "green" },
  ];

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get("/transactions/data-plans");
      if (response.data) {
        // Create a map to track unique plan IDs
        const uniquePlans = new Map();

        // Helper function to process plans
        const processPlans = (plansArray) => {
          plansArray.forEach((plan) => {
            // Use dataplan_id or _id as unique identifier
            const planId = plan.dataplan_id || plan._id;
            if (!uniquePlans.has(planId)) {
              uniquePlans.set(planId, plan);
            }
          });
        };

        // Process plans for each network
        if (response.data.MTN_PLAN) {
          Object.values(response.data.MTN_PLAN).forEach(processPlans);
        }
        if (response.data.GLO_PLAN) {
          Object.values(response.data.GLO_PLAN).forEach(processPlans);
        }
        if (response.data.AIRTEL_PLAN) {
          Object.values(response.data.AIRTEL_PLAN).forEach(processPlans);
        }
        if (response.data["9MOBILE_PLAN"]) {
          Object.values(response.data["9MOBILE_PLAN"]).forEach(processPlans);
        }

        // Convert map values back to array
        setPlans(Array.from(uniquePlans.values()));
      }
    } catch (error) {
      notify.error("Failed to fetch data plans");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan({ ...plan });
  };

  const handleSave = async () => {
    try {
      await api.put(`/admin/data-plans/${editingPlan._id}`, editingPlan);
      notify.success("Plan updated successfully");
      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      notify.error(error.response?.data?.message || "Failed to update plan");
    }
  };

  const handleCancel = () => {
    setEditingPlan(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingPlan((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (planId) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await api.delete(`/admin/data-plans/${planId}`);
        notify.success("Plan deleted successfully");
        fetchPlans();
      } catch (error) {
        notify.error(error.response?.data?.message || "Failed to delete plan");
      }
    }
  };

  // Add this helper function to convert data size to MB for sorting
  const convertToMB = (planName) => {
    const cleanPlan = planName.toLowerCase().replace(/\s+/g, "");

    // Extract number and unit from plan name
    const match = cleanPlan.match(/(\d+(?:\.\d+)?)\s*(mb|gb|tb)?/);
    if (!match) return 0;

    const [, number, unit = "mb"] = match;
    const value = parseFloat(number);

    switch (unit.toLowerCase()) {
      case "tb":
        return value * 1024 * 1024;
      case "gb":
        return value * 1024;
      case "mb":
        return value;
      default:
        return value;
    }
  };

  // Add search filter function
  const filterPlans = (plans) => {
    if (!searchQuery) return plans;

    return plans.filter((plan) =>
      plan.dataplan_id
        ?.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  };

  // Update getNetworkPlans function to ensure unique plans and include search
  const getNetworkPlans = (networkName) => {
    const networkPlans = plans.filter(
      (plan) => plan.plan_network === networkName
    );

    const filteredPlans = filterPlans(networkPlans);

    // Sort plans by data size
    return [...new Set(filteredPlans)].sort((a, b) => {
      const sizeA = convertToMB(a.plan);
      const sizeB = convertToMB(b.plan);
      return sizeA - sizeB;
    });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const renderEditModal = () => (
    <Modal
      isOpen={!!editingPlan}
      onClose={() => setEditingPlan(null)}
      title="Edit Data Plan"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Plan
          </label>
          <input
            type="text"
            name="plan"
            value={editingPlan?.plan || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <input
            type="text"
            name="plan_type"
            value={editingPlan?.plan_type || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Validity
          </label>
          <input
            type="text"
            name="month_validate"
            value={editingPlan?.month_validate || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            type="number"
            name="plan_amount"
            value={editingPlan?.plan_amount || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
          <button
            onClick={handleSave}
            className="w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
          >
            Save Changes
          </button>
          <button
            onClick={() => setEditingPlan(null)}
            className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Data Plans</h1>
        <div className="mt-4 sm:mt-0">
          <input
            type="text"
            placeholder="Search by Plan ID..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full sm:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Network tabs - scrollable on mobile */}
      <div className="border-b border-gray-200">
        <div className="overflow-x-auto">
          <nav
            className="-mb-px flex space-x-8 px-4"
            style={{ minWidth: "max-content" }}
          >
            {networkTabs.map((network) => (
              <button
                key={network.id}
                onClick={() => setActiveNetwork(network.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${
                    activeNetwork === network.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                {network.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Responsive table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plan ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Validity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getNetworkPlans(activeNetwork).map((plan) => (
                <tr key={plan._id}>
                  {editingPlan?._id === plan._id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="dataplan_id"
                          value={editingPlan.dataplan_id || ""}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="Plan ID"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="plan"
                          value={editingPlan.plan}
                          onChange={handleInputChange}
                          className="input-field"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="plan_type"
                          value={editingPlan.plan_type}
                          onChange={handleInputChange}
                          className="input-field"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="month_validate"
                          value={editingPlan.month_validate}
                          onChange={handleInputChange}
                          className="input-field"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          name="plan_amount"
                          value={editingPlan.plan_amount}
                          onChange={handleInputChange}
                          className="input-field"
                        />
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-900"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">{plan.dataplan_id}</td>
                      <td className="px-6 py-4">{plan.plan}</td>
                      <td className="px-6 py-4">{plan.plan_type}</td>
                      <td className="px-6 py-4">{plan.month_validate}</td>
                      <td className="px-6 py-4">
                        ₦{Number(plan.plan_amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleEdit(plan)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(plan._id)}
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

export default DataPlans;
