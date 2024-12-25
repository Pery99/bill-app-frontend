import { useState } from "react";

function Electricity() {
  const [formData, setFormData] = useState({
    distributor: "",
    meterType: "",
    meterNumber: "",
    amount: "",
  });

  const distributors = [
    { id: "ekedc", name: "Eko Electric" },
    { id: "ikedc", name: "Ikeja Electric" },
    { id: "aedc", name: "Abuja Electric" },
  ];

  const meterTypes = [
    { id: "prepaid", name: "Prepaid" },
    { id: "postpaid", name: "Postpaid" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buy Electricity</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select Distributor
            </label>
            <select
              className="input-field"
              value={formData.distributor}
              onChange={(e) =>
                setFormData({ ...formData, distributor: e.target.value })
              }
              required
            >
              <option value="">Select a distributor</option>
              {distributors.map((dist) => (
                <option key={dist.id} value={dist.id}>
                  {dist.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Meter Type
            </label>
            <select
              className="input-field"
              value={formData.meterType}
              onChange={(e) =>
                setFormData({ ...formData, meterType: e.target.value })
              }
              required
            >
              <option value="">Select meter type</option>
              {meterTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Meter Number
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter meter number"
              value={formData.meterNumber}
              onChange={(e) =>
                setFormData({ ...formData, meterNumber: e.target.value })
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
            Buy Electricity
          </button>
        </form>
      </div>
    </div>
  );
}

export default Electricity;
