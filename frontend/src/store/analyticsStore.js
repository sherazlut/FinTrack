import { create } from "zustand";
import api from "@/lib/api";

const useAnalyticsStore = create((set) => ({
  summary: null,
  spendingByCategory: null,
  monthlyTrends: null,
  budgetVsActual: null,
  isLoading: false,
  error: null,

  // Get transaction summary (income, expense, balance)
  getSummary: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/transactions/summary", { params });
      set({
        summary: response.data.data,
        isLoading: false,
        error: null,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch summary";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Get spending by category
  getSpendingByCategory: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/analytics/spending-by-category", {
        params,
      });
      set({
        spendingByCategory: response.data.data,
        isLoading: false,
        error: null,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch spending by category";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Get monthly trends
  getMonthlyTrends: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/analytics/monthly-trends", { params });
      set({
        monthlyTrends: response.data.data,
        isLoading: false,
        error: null,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch monthly trends";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Get budget vs actual
  getBudgetVsActual: async (month, year) => {
    set({ isLoading: true, error: null });
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;

      const response = await api.get("/analytics/budget-vs-actual", { params });
      set({
        budgetVsActual: response.data.data,
        isLoading: false,
        error: null,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch budget vs actual";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAnalyticsStore;
