import { create } from "zustand";
import api from "@/lib/api";

const useTransactionStore = create((set) => ({
  transactions: [],
  pagination: null,
  isLoading: false,
  error: null,
  filters: {
    type: "",
    category: "",
    startDate: "",
    endDate: "",
  },

  // Get all transactions with filters
  getTransactions: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/transactions", { params });
      set({
        transactions: response.data.data,
        pagination: response.data.pagination,
        isLoading: false,
        error: null,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch transactions";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Get single transaction
  getTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/transactions/${id}`);
      set({ isLoading: false, error: null });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch transaction";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Create transaction
  createTransaction: async (transactionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/transactions", transactionData);
      set((state) => ({
        transactions: [response.data.data, ...state.transactions],
        isLoading: false,
        error: null,
      }));
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create transaction";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Update transaction
  updateTransaction: async (id, transactionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/transactions/${id}`, transactionData);
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t._id === id ? response.data.data : t
        ),
        isLoading: false,
        error: null,
      }));
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update transaction";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/transactions/${id}`);
      set((state) => ({
        transactions: state.transactions.filter((t) => t._id !== id),
        isLoading: false,
        error: null,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete transaction";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Set filters
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  // Clear filters
  clearFilters: () => {
    set({
      filters: {
        type: "",
        category: "",
        startDate: "",
        endDate: "",
      },
    });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useTransactionStore;
