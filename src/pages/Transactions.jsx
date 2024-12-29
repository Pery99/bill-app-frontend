import { useState, useEffect } from "react";
import { transactionService } from "../services/transactionService";
import { notify } from "../utils/toast";
import Pagination from "../components/Pagination";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalTransactions: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10,
  });

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

  const getAmountDisplay = (transaction) => (
    <div
      className={`text-${
        transaction.transaction_type === "credit" ? "green" : "red"
      }-600 font-medium`}
    >
      {transaction.transaction_type === "credit" ? "+" : "-"}₦
      {transaction.amount.toLocaleString()}
    </div>
  );

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true;
    return transaction.transaction_type === filter;
  });

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching transactions for page:", page);

      const data = await transactionService.getTransactions({
        page,
        limit: 10,
      });

      console.log("Raw transaction data:", data);

      if (
        !data ||
        (!Array.isArray(data.transactions) && !Array.isArray(data))
      ) {
        console.error("Invalid data structure:", data);
        throw new Error("Invalid data received from server");
      }

      setTransactions(data.transactions || []);
      setPagination((prev) => ({
        ...prev,
        ...data.pagination,
        currentPage: page,
      }));

      // Log the state updates
      console.log("Updated transactions:", data.transactions);
      console.log("Updated pagination:", data.pagination);
    } catch (error) {
      console.error("Transaction fetch error:", error);
      setError(error.message);
      notify.error(error.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handlePageChange = (newPage) => {
    fetchTransactions(newPage);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={() => fetchTransactions()}
          className="mt-4 btn-secondary"
        >
          Retry
        </button>
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

      {filteredTransactions.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
        />
      )}
    </div>
  );
}

export default Transactions;
