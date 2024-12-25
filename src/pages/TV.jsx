import { useState } from "react";

function TV() {
  const [formData, setFormData] = useState({
    provider: "",
    smartCardNumber: "",
    package: "",
  });

  const providers = [
    { id: "dstv", name: "DSTV" },
    { id: "gotv", name: "GOTV" },
    { id: "startimes", name: "StarTimes" },
  ];

  const packages = {
    dstv: [
      { id: 1, name: "Premium", price: 24500 },
      { id: 2, name: "Compact Plus", price: 16600 },
      { id: 3, name: "Compact", price: 10500 },
    ],
    // Add packages for other providers
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">TV Subscription</h1>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select Provider
            </label>
            <select
              className="input-field"
              value={formData.provider}
              onChange={(e) =>
                setFormData({ ...formData, provider: e.target.value })
              }
              required
            >
              <option value="">Select a provider</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              SmartCard/IUC Number
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter SmartCard Number"
              value={formData.smartCardNumber}
              onChange={(e) =>
                setFormData({ ...formData, smartCardNumber: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select Package
            </label>
            <select
              className="input-field"
              value={formData.package}
              onChange={(e) =>
                setFormData({ ...formData, package: e.target.value })
              }
              required
            >
              <option value="">Select a package</option>
              {formData.provider &&
                packages[formData.provider]?.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} - ₦{pkg.price}
                  </option>
                ))}
            </select>
          </div>

          <button type="submit" className="btn-primary">
            Pay Subscription
          </button>
        </form>
      </div>
    </div>
  );
}

export default TV;
