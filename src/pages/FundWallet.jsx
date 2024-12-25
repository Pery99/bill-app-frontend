import { useState } from 'react';
import { CreditCardIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

function FundWallet() {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  
  const presetAmounts = [1000, 2000, 5000, 10000, 20000];
  
  const paymentMethods = [
    { 
      id: 'card', 
      name: 'Debit Card', 
      icon: CreditCardIcon,
      description: 'Fund your wallet using your debit card'
    },
    { 
      id: 'bank', 
      name: 'Bank Transfer', 
      icon: BuildingLibraryIcon,
      description: 'Fund via bank transfer'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle payment processing
    console.log({ amount, paymentMethod });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Fund Wallet</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
              <input
                type="number"
                className="input-field pl-8"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="100"
              />
            </div>
          </div>

          {/* Preset Amounts */}
          <div className="grid grid-cols-3 gap-3">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${amount === preset 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              >
                ₦{preset.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Payment Method</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex items-start p-4 rounded-lg border-2 transition-colors
                    ${paymentMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <method.icon className="w-6 h-6 text-primary mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!amount || !paymentMethod}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Fund Wallet with ₦{Number(amount).toLocaleString()}
          </button>
        </form>
      </div>

      {/* Security Notice */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>🔒 Your transactions are secure and encrypted</p>
      </div>
    </div>
  );
}

export default FundWallet;
