import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { Button } from "@/components/ui/button";

const Layout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-2xl font-bold">
            FinTrack
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/transactions"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Transactions
            </Link>
            <Link
              to="/budgets"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Budgets
            </Link>
            <Link
              to="/analytics"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Analytics
            </Link>
            {user && (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l">
                <span className="text-sm text-muted-foreground">
                  {user.name}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default Layout;
