import { useState } from "react";

function Data() {
  const [formData, setFormData] = useState({
    network: "",
    phoneNumber: "",
    plan: "",
  });

  const networks = [
    { id: "mtn", name: "MTN" },
    { id: "airtel", name: "Airtel" },
    { id: "glo", name: "Glo" },
    { id: "9mobile", name: "9Mobile" },
  ];

  const dataPlans = {
    mtn: [
      { id: 1, name: "1GB - 1 Day", price: 500 },
      { id: 2, name: "2GB - 7 Days", price: 1000 },
      { id: 3, name: "5GB - 30 Days", price: 2500 },
    ],
    // Add plans for other networks
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buy Data Bundle</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select Network
            </label>
            <select
              className="input-field"
              value={formData.network}
              onChange={(e) =>
                setFormData({ ...formData, network: e.target.value })
              }
              required
            >
              <option value="">Select a network</option>
              {networks.map((network) => (
                <option key={network.id} value={network.id}>
                  {network.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              className="input-field"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select Data Plan
            </label>
            <select
              className="input-field"
              value={formData.plan}
              onChange={(e) =>
                setFormData({ ...formData, plan: e.target.value })
              }
              required
            >
              <option value="">Select a plan</option>
              {formData.network &&
                dataPlans[formData.network]?.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - ₦{plan.price}
                  </option>
                ))}
            </select>
          </div>

          <button type="submit" className="btn-primary">
            Buy Data Bundle
          </button>
        </form>
      </div>
    </div>
  );
}

export default Data;
