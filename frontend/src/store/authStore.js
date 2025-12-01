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
      // Extract error message from validation errors array or message
      let errorMessage = "Login failed";
      const errorData = error.response?.data;

      if (
        errorData?.errors &&
        Array.isArray(errorData.errors) &&
        errorData.errors.length > 0
      ) {
        // Join all validation error messages
        errorMessage = errorData.errors.map((err) => err.message).join(", ");
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage, errors: errorData?.errors };
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
      // Extract error message from validation errors array or message
      let errorMessage = "Registration failed";
      const errorData = error.response?.data;

      if (
        errorData?.errors &&
        Array.isArray(errorData.errors) &&
        errorData.errors.length > 0
      ) {
        // Join all validation error messages
        errorMessage = errorData.errors.map((err) => err.message).join(", ");
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage, errors: errorData?.errors };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/auth/me");
      set({ user: response.data.user, isLoading: false });
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
