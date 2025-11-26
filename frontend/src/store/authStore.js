import { create } from "zustand";
import api from "@/lib/api";

const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user } = response.data;

      // Token cookie me automatically set ho jayega
      set({ user, isLoading: false, error: null });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Register function
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      const { user } = response.data;

      // Token cookie me automatically set ho jayega
      set({ user, isLoading: false, error: null });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/auth/me");
      set({ user: response.data, isLoading: false });
      return { success: true };
    } catch (error) {
      console.error("Get current user error:", error);
      set({ user: null, isLoading: false });
      return { success: false };
    }
  },

  // Logout function -
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      set({ user: null, error: null });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
