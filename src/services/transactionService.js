import api from "../utils/api";

export const transactionService = {
  getTransactions: async () => {
    try {
      const response = await api.get("/transactions/history");
      // Handle different possible response structures
      if (response.data?.transactions) {
        return response.data.transactions;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data) {
        return response.data.data;
      }

      throw new Error("Invalid response structure");
    } catch (error) {
      console.error("Transaction fetch error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
};
