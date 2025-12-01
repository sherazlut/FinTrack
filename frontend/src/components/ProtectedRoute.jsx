import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

const ProtectedRoute = ({ children }) => {
  const { user, getCurrentUser, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    // Only fetch user if we haven't initialized yet
    if (!isInitialized && !isLoading) {
      getCurrentUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isLoading]); // Only depend on isInitialized and isLoading

  // Show loading while checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Only redirect if we've checked and there's no user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
