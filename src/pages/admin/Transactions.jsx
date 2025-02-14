import { useState, useEffect } from "react";
import api from "../../utils/api";
import { notify } from "../../utils/toast";
import Modal from "../../components/ui/Modal";
import { TableSkeleton } from "../../components/Skeleton";
import {
  FunnelIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    type: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const transactionTypes = ["data", "airtime", "refund"];
  const statusTypes = ["completed", "pending", "failed", "refunded"];

  const fetchTransactions = async () => {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await api.get(`/admin/transactions?${queryParams}`);
      setTransactions(response.data.transactions);
      setPagination({
        total: response.data.total,
        pages: response.data.pages,
        currentPage: response.data.currentPage,
      });
    } catch (error) {
      notify.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const handleRefund = async () => {
    try {
      await api.post(`/admin/transactions/${selectedTransaction._id}/refund`, {
        reason: refundReason,
      });
      notify.success("Refund processed successfully");
      setShowRefundModal(false);
      setRefundReason("");
      fetchTransactions();
    } catch (error) {
      notify.error(error.response?.data?.message || "Failed to process refund");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNetworkName = (providerId) => {
    const networks = {
      1: "MTN",
      2: "GLO",
      3: "9mobile",
      4: "Airtel",
    };
    return networks[providerId] || "Unknown";
  };

  const renderTransactionDetails = () => (
    <Modal
      isOpen={!!selectedTransaction}
      onClose={() => setSelectedTransaction(null)}
      title="Transaction Details"
    >
      {selectedTransaction && (
        <div className="space-y-6">
          {/* Basic Transaction Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow
                label="Reference"
                value={selectedTransaction.reference}
              />
              <DetailRow
                label="Type"
                value={selectedTransaction.type?.toUpperCase()}
              />
              <DetailRow
                label="Amount"
                value={`₦${selectedTransaction.amount?.toLocaleString()}`}
              />
              <DetailRow
                label="Status"
                value={
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
                    ${
                      selectedTransaction.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : selectedTransaction.status === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedTransaction.status?.toUpperCase()}
                  </span>
                }
              />
              <DetailRow
                label="Date"
                value={formatDate(selectedTransaction.createdAt)}
              />
              <DetailRow
                label="Transaction Type"
                value={selectedTransaction.transaction_type?.toUpperCase()}
              />
            </div>
          </div>

          {/* Service-Specific Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Service Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Common fields */}
              <DetailRow
                label="Phone Number"
                value={selectedTransaction.phone}
              />
              <DetailRow
                label="Network"
                value={getNetworkName(selectedTransaction.provider)}
              />

              {/* Data-specific fields */}
              {selectedTransaction.type === "data" && (
                <DetailRow
                  label="Data Plan ID"
                  value={selectedTransaction.plan}
                />
              )}

              {/* Electricity-specific fields */}
              {selectedTransaction.type === "electricity" && (
                <>
                  <DetailRow
                    label="Meter Number"
                    value={selectedTransaction.meter_number}
                  />
                  <DetailRow
                    label="Disco"
                    value={selectedTransaction.disco_name}
                  />
                  <DetailRow
                    label="Meter Type"
                    value={
                      selectedTransaction.meter_type === "1"
                        ? "Prepaid"
                        : "Postpaid"
                    }
                  />
                  {selectedTransaction.token && (
                    <DetailRow
                      label="Token"
                      value={selectedTransaction.token}
                    />
                  )}
                </>
              )}

              {/* TV-specific fields */}
              {selectedTransaction.type === "tv" && (
                <>
                  <DetailRow
                    label="Smart Card Number"
                    value={selectedTransaction.smartcard_number}
                  />
                  <DetailRow
                    label="Package"
                    value={selectedTransaction.package}
                  />
                </>
              )}
            </div>
          </div>

          {/* API Response Details if available */}
          {selectedTransaction.apiDetails && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                API Response
              </h3>
              <div className="space-y-2">
                <DetailRow
                  label="API Status"
                  value={
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                      ${
                        selectedTransaction.apiDetails.status === "successful"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedTransaction.apiDetails.status}
                    </span>
                  }
                />
                {selectedTransaction.apiDetails.message && (
                  <DetailRow
                    label="Message"
                    value={selectedTransaction.apiDetails.message}
                  />
                )}
                <DetailRow
                  label="Response Time"
                  value={formatDate(
                    selectedTransaction.apiDetails.responseTime
                  )}
                />
              </div>
            </div>
          )}

          {/* Refund Button */}
          {selectedTransaction.status === "completed" && (
            <button
              onClick={() => setShowRefundModal(true)}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Process Refund
            </button>
          )}
        </div>
      )}
    </Modal>
  );

  const DetailRow = ({ label, value }) => (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  );

  const renderRefundModal = () => (
    <Modal
      isOpen={showRefundModal}
      onClose={() => setShowRefundModal(false)}
      title="Process Refund"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Refund Reason
          </label>
          <textarea
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows="3"
            required
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowRefundModal(false)}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRefund}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Process Refund
          </button>
        </div>
      </div>
    </Modal>
  );

  const renderFilterModal = () => (
    <Modal
      isOpen={showFilters}
      onClose={() => setShowFilters(false)}
      title="Filter Transactions"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, type: e.target.value, page: 1 }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Types</option>
            {transactionTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value,
                page: 1,
              }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Status</option>
            {statusTypes.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                  page: 1,
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                  page: 1,
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
          <button
            onClick={() => {
              setFilters({
                page: 1,
                limit: 10,
                type: "",
                status: "",
                startDate: "",
                endDate: "",
              });
              setShowFilters(false);
            }}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={() => setShowFilters(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </Modal>
  );

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {/* Show active filters */}
          {(filters.type ||
            filters.status ||
            filters.startDate ||
            filters.endDate) && (
            <div className="flex items-center space-x-2">
              {Object.entries(filters).map(([key, value]) => {
                if (value && key !== "page" && key !== "limit") {
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {`${key}: ${value}`}
                      <XMarkIcon
                        className="ml-2 h-4 w-4 cursor-pointer"
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, [key]: "" }))
                        }
                      />
                    </span>
                  );
                }
                return null;
              })}
            </div>
          )}
          <button
            onClick={() => setShowFilters(true)}
            className="inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.user.fullname}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {transaction.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₦{transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        transaction.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : transaction.status === "refunded"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    {transaction.status === "completed" && (
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowRefundModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            disabled={filters.page === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            disabled={filters.page === pagination.pages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {renderFilterModal()}
      {renderTransactionDetails()}
      {renderRefundModal()}
    </div>
  );
}

export default Transactions;
