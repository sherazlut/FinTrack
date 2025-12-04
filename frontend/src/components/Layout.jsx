import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

const Layout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-40 bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl sm:text-2xl font-bold">
            FinTrack
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
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
                <span className="text-sm text-muted-foreground hidden lg:inline">
                  {user.name}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {user.name}
              </span>
            )}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  <Link
                    to="/dashboard"
                    onClick={handleLinkClick}
                    className="text-sm font-medium hover:text-primary transition-colors py-2"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/transactions"
                    onClick={handleLinkClick}
                    className="text-sm font-medium hover:text-primary transition-colors py-2"
                  >
                    Transactions
                  </Link>
                  <Link
                    to="/budgets"
                    onClick={handleLinkClick}
                    className="text-sm font-medium hover:text-primary transition-colors py-2"
                  >
                    Budgets
                  </Link>
                  <Link
                    to="/analytics"
                    onClick={handleLinkClick}
                    className="text-sm font-medium hover:text-primary transition-colors py-2"
                  >
                    Analytics
                  </Link>
                  {user && (
                    <div className="pt-4 border-t">
                      <div className="mb-4">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-8">{children}</main>
    </div>
  );
};

export default Layout;
