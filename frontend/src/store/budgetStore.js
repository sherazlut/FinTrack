import { create } from "zustand";
import api from "@/lib/api";

const useBudgetStore = create((set) => ({
  budgets: [],
  budgetProgress: null,
  pagination: null,
  isLoading: false,
  error: null,
  filters: {
    category: "",
    month: "",
    year: "",
  },

  // Get all budgets with filters
  getBudgets: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/budgets", { params });
      set({
        budgets: response.data.data,
        pagination: response.data.pagination,
        isLoading: false,
        error: null,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch budgets";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Get single budget
  getBudget: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/budgets/${id}`);
      set({ isLoading: false, error: null });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch budget";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Create budget
  createBudget: async (budgetData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/budgets", budgetData);
      set((state) => ({
        budgets: [response.data.data, ...state.budgets],
        isLoading: false,
        error: null,
      }));
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create budget";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Update budget
  updateBudget: async (id, budgetData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/budgets/${id}`, budgetData);
      set((state) => ({
        budgets: state.budgets.map((b) =>
          b._id === id ? response.data.data : b
        ),
        isLoading: false,
        error: null,
      }));
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update budget";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Delete budget
  deleteBudget: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/budgets/${id}`);
      set((state) => ({
        budgets: state.budgets.filter((b) => b._id !== id),
        isLoading: false,
        error: null,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete budget";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Get budget progress
  getBudgetProgress: async (month, year) => {
    set({ isLoading: true, error: null });
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;

      const response = await api.get("/budgets/progress", { params });
      set({
        budgetProgress: response.data.data,
        isLoading: false,
        error: null,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch budget progress";
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
        category: "",
        month: "",
        year: "",
      },
    });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useBudgetStore;
