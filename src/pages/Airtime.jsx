import { useState } from "react";

function Airtime() {
  const [formData, setFormData] = useState({
    network: "",
    phoneNumber: "",
    amount: "",
  });

  const networks = [
    { id: "mtn", name: "MTN" },
    { id: "airtel", name: "Airtel" },
    { id: "glo", name: "Glo" },
    { id: "9mobile", name: "9Mobile" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle airtime purchase
    console.log(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buy Airtime</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label className="text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              className="input-field"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Buy Airtime
          </button>
        </form>
      </div>
    </div>
  );
}

export default Airtime;
