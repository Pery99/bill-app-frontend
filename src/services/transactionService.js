import api from "../utils/api";

export const transactionService = {
  getTransactions: async ({ page = 1, limit = 10 } = {}) => {
    try {
      const response = await api.get(`/transactions/history`, {
        params: { page, limit }
      });

      // Check if response.data exists and has the expected structure
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Destructure with defaults to handle potential missing data
      const { data: { transactions = [], pagination = {} } = {} } = response;
      return {
        transactions,
        pagination: {
          currentPage: Number(pagination.currentPage || page),
          totalPages: Number(pagination.totalPages || 1),
          totalTransactions: Number(pagination.totalTransactions || 0),
          hasNextPage: Boolean(pagination.hasNextPage),
          hasPrevPage: Boolean(pagination.hasPrevPage),
          limit: Number(pagination.limit || limit)
        }
      };
    } catch (error) {
      console.error("Transaction fetch error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
};
