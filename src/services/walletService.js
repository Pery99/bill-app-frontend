import api from "../utils/api";

export const walletService = {
  getBalance: async () => {
    try {
      const response = await api.get("/transactions/balance");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
      throw error;
    }
  },

  getFundingHistory: async () => {
    try {
      const response = await api.get("/transactions/funding-history");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch funding history:", error);
      throw error;
    }
  }
};
