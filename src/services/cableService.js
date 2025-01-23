import api from '../utils/api';

export const cableService = {
  getAllPlans: async () => {
    const response = await api.get('/transactions/cable-plans');
    return response.data;
  },

  getProviderPlans: async (provider) => {
    const response = await api.get(`/transactions/cable-plans?provider=${provider}`);
    return response.data;
  }
};
