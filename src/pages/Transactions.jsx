import { useState, useEffect } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { transactionService } from "../services/transactionService";
import { notify } from "../utils/toast";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getTransactions();

      if (!data) {
        console.warn("No transaction data received");
        setTransactions([]);
        notify.error("No transactions found");
        return;
      }

      if (!Array.isArray(data)) {
        console.error("Invalid data format:", data);
        setTransactions([]);
        notify.error("Invalid transaction data format");
        return;
      }

      setTransactions(data);
    } catch (error) {
      console.error("Transaction fetch error:", error);
      notify.error(
        error.response?.data?.message || "Failed to fetch transactions"
      );
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) =>
    filter === "all" ? true : tx.transaction_type === filter
  );

  const getTransactionIcon = (type) => {
    switch (type) {
      case "airtime":
        return "📱";
      case "data":
        return "📶";
      case "electricity":
        return "⚡";
      case "tv":
        return "📺";
      default:
        return "💳";
    }
  };

  const getProviderName = (providerId) => {
    switch (providerId) {
      case "1":
        return "MTN";
      case "2":
        return "GLO";
      case "3":
        return "9mobile";
      case "4":
        return "Airtel";
      default:
        return providerId;
    }
  };

  const getDescription = (transaction) => {
    const providerName = getProviderName(transaction.provider);
    switch (transaction.type) {
      case "airtime":
        return `${providerName} Airtime - ${transaction.phone}`;
      case "data":
        return `${providerName} Data - ${transaction.phone}`;
      case "electricity":
        return `${transaction.provider} Electricity - ${transaction.meterNumber}`;
      case "tv":
        return `${transaction.provider} TV - ${transaction.smartCardNumber}`;
      default:
        return transaction.provider;
    }
  };

  const getAmountDisplay = (transaction) => {
    if (transaction.status === "failed") {
      return (
        <div className="text-right">
          <p className="font-semibold text-yellow-600">Failed</p>
          <p className="text-xs text-gray-500">
            ₦{transaction.amount.toLocaleString()}
          </p>
        </div>
      );
    }

    return (
      <div className="text-right">
        <p
          className={`font-semibold ${
            transaction.transaction_type === "credit"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {transaction.transaction_type === "credit" ? "+" : "-"}₦
          {transaction.amount.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">Ref: {transaction.reference}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Transaction History
        </h1>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Transactions</option>
          <option value="credit">Credits Only</option>
          <option value="debit">Debits Only</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No transactions found
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction._id}
              className="p-4 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-lg ${
                      transaction.transaction_type === "credit"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    <span className="text-xl">
                      {getTransactionIcon(transaction.type)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {getDescription(transaction)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {getAmountDisplay(transaction)}
              </div>
              <div className="mt-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    transaction.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : transaction.status === "failed"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Transactions;
