import { useEffect, useState, useCallback } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import useBudgetStore from "@/store/budgetStore";
import BudgetForm from "@/components/BudgetForm";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Budgets = () => {
  const {
    budgets,
    budgetProgress,
    pagination,
    isLoading,
    filters,
    getBudgets,
    getBudgetProgress,
    deleteBudget,
    setFilters,
    clearFilters,
  } = useBudgetStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadBudgets = useCallback(async () => {
    const params = {
      page: currentPage,
      limit: 10,
      ...filters,
    };
    // Remove empty filters
    Object.keys(params).forEach(
      (key) => params[key] === "" && delete params[key]
    );
    await getBudgets(params);
  }, [currentPage, filters, getBudgets]);

  const loadBudgetProgress = useCallback(async () => {
    await getBudgetProgress(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, getBudgetProgress]);

  useEffect(() => {
    loadBudgets();
    loadBudgetProgress();
  }, [loadBudgets, loadBudgetProgress]);

  const handleAddClick = () => {
    setEditingBudget(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (budget) => {
    setDeletingBudget(budget);
  };

  const confirmDelete = async () => {
    if (deletingBudget) {
      const result = await deleteBudget(deletingBudget._id);
      if (result.success) {
        toast.success("Budget deleted successfully");
        loadBudgets();
        loadBudgetProgress();
      } else {
        toast.error(result.error || "Failed to delete budget");
      }
      setDeletingBudget(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    clearFilters();
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (percentage) => {
    if (percentage >= 100) {
      return <Badge variant="destructive">Exceeded</Badge>;
    }
    if (percentage >= 80) {
      return (
        <Badge
          variant="outline"
          className="border-yellow-500 text-yellow-700 dark:text-yellow-400"
        >
          Warning
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="border-green-500 text-green-700 dark:text-green-400"
      >
        Good
      </Badge>
    );
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingBudget(null);
    loadBudgets();
    loadBudgetProgress();
  };

  // Get progress for a specific budget
  const getBudgetProgressData = (budgetId) => {
    if (!budgetProgress || !budgetProgress.budgets) return null;
    return budgetProgress.budgets.find((bp) => bp.budgetId === budgetId);
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = 0; i < 3; i++) {
    yearOptions.push(currentYear + i);
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Budgets</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your monthly budget limits
            </p>
          </div>
          <Button onClick={handleAddClick} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Budget
          </Button>
        </div>

        {/* Budget Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Progress Overview</CardTitle>
            <CardDescription>
              View your budget progress for the selected month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Month</label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) =>
                    setSelectedMonth(parseInt(value, 10))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Year</label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) =>
                    setSelectedYear(parseInt(value, 10))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : budgetProgress && budgetProgress.budgets?.length > 0 ? (
              <div className="space-y-4">
                {budgetProgress.budgets.map((bp) => (
                  <div key={bp.budgetId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{bp.category}</span>
                      {getStatusBadge(bp.percentage)}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {formatCurrency(bp.actualSpending)} of{" "}
                        {formatCurrency(bp.monthlyLimit)}
                      </span>
                      <span>
                        {bp.remaining >= 0
                          ? `${formatCurrency(bp.remaining)} remaining`
                          : `${formatCurrency(Math.abs(bp.remaining))} over`}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(bp.percentage, 100)}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                No budgets found for this month. Create a budget to get started.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter budgets by category, month, or year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Category
                </label>
                <Input
                  placeholder="Category"
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Month</label>
                <Select
                  value={filters.month || "all"}
                  onValueChange={(value) =>
                    handleFilterChange("month", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All months</SelectItem>
                    {MONTHS.map((month, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Year</label>
                <Select
                  value={filters.year || "all"}
                  onValueChange={(value) =>
                    handleFilterChange("year", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(filters.category || filters.month || filters.year) && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Budgets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Budget List</CardTitle>
            <CardDescription>
              {pagination
                ? `Showing ${budgets.length} of ${pagination.total} budgets`
                : "Your budgets"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No budgets found. Add your first budget to get started.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">
                          Category
                        </TableHead>
                        <TableHead className="min-w-[120px]">
                          Monthly Limit
                        </TableHead>
                        <TableHead className="min-w-[100px] hidden sm:table-cell">
                          Month
                        </TableHead>
                        <TableHead className="min-w-[80px] hidden md:table-cell">
                          Year
                        </TableHead>
                        <TableHead className="min-w-[180px]">
                          Progress
                        </TableHead>
                        <TableHead className="text-right min-w-[100px]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {budgets.map((budget) => {
                        const progress = getBudgetProgressData(budget._id);
                        return (
                          <TableRow key={budget._id}>
                            <TableCell className="font-medium">
                              {budget.category}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(budget.monthlyLimit)}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {MONTHS[budget.month - 1]}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {budget.year}
                            </TableCell>
                            <TableCell>
                              {progress ? (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="truncate">
                                      {formatCurrency(progress.actualSpending)}{" "}
                                      / {formatCurrency(progress.monthlyLimit)}
                                    </span>
                                    <span className="ml-2">
                                      {progress.percentage.toFixed(1)}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={Math.min(progress.percentage, 100)}
                                    className="h-1.5"
                                  />
                                  <div className="mt-1">
                                    {getStatusBadge(progress.percentage)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  No data
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(budget)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(budget)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                        {[...Array(pagination.pages)].map((_, i) => {
                          const page = i + 1;
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setCurrentPage((p) =>
                                Math.min(pagination.pages, p + 1)
                              )
                            }
                            className={
                              currentPage === pagination.pages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Budget Form Dialog */}
        <BudgetForm
          open={isFormOpen}
          onOpenChange={handleFormClose}
          budget={editingBudget}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deletingBudget}
          onOpenChange={(open) => !open && setDeletingBudget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                budget for {deletingBudget?.category} in{" "}
                {deletingBudget && MONTHS[deletingBudget.month - 1]}{" "}
                {deletingBudget?.year}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Budgets;
