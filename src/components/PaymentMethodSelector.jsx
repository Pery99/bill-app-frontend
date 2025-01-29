import { WalletIcon, CreditCardIcon } from "@heroicons/react/24/outline";

function PaymentMethodSelector({ selectedMethod, onSelect }) {
  const methods = [
    {
      id: "wallet",
      name: "Pay with Wallet",
      icon: WalletIcon,
      description: "Use your wallet balance",
    },
    {
      id: "direct",
      name: "Pay with Card",
      icon: CreditCardIcon,
      description: "Direct payment with Paystack",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Select Payment Method</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {methods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={`flex items-center p-4 border-2 rounded-lg transition-all
              ${
                selectedMethod === method.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-200"
              }`}
          >
            <method.icon className="w-6 h-6 text-blue-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">{method.name}</div>
              <div className="text-sm text-gray-500">{method.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PaymentMethodSelector;
