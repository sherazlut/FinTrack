import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

const ProtectedRoute = ({ children }) => {
  const { user, getCurrentUser, isLoading } = useAuthStore();

  useEffect(() => {
    if (!user) {
      getCurrentUser();
    }
  }, [user, getCurrentUser]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
