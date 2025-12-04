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
import useTransactionStore from "@/store/transactionStore";
import TransactionForm from "@/components/TransactionForm";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

const Transactions = () => {
  const {
    transactions,
    pagination,
    isLoading,
    filters,
    getTransactions,
    deleteTransaction,
    setFilters,
    clearFilters,
  } = useTransactionStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadTransactions = useCallback(async () => {
    const params = {
      page: currentPage,
      limit: 10,
      ...filters,
    };
    // Remove empty filters
    Object.keys(params).forEach(
      (key) => params[key] === "" && delete params[key]
    );
    await getTransactions(params);
  }, [currentPage, filters, getTransactions]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleAddClick = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (transaction) => {
    setDeletingTransaction(transaction);
  };

  const confirmDelete = async () => {
    if (deletingTransaction) {
      const result = await deleteTransaction(deletingTransaction._id);
      if (result.success) {
        toast.success("Transaction deleted successfully");
        loadTransactions();
      } else {
        toast.error(result.error || "Failed to delete transaction");
      }
      setDeletingTransaction(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
    setCurrentPage(1); // Reset to first page when filter changes
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
    loadTransactions();
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your income and expenses
            </p>
          </div>
          <Button onClick={handleAddClick} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter transactions by type, category, or date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select
                  value={filters.type || "all"}
                  onValueChange={(value) =>
                    handleFilterChange("type", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <label className="text-sm font-medium mb-2 block">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  End Date
                </label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>
            </div>
            {(filters.type ||
              filters.category ||
              filters.startDate ||
              filters.endDate) && (
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

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction List</CardTitle>
            <CardDescription>
              {pagination
                ? `Showing ${transactions.length} of ${pagination.total} transactions`
                : "Your transactions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found. Add your first transaction to get
                started.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Date</TableHead>
                        <TableHead className="min-w-[80px]">Type</TableHead>
                        <TableHead className="min-w-[100px]">Category</TableHead>
                        <TableHead className="min-w-[150px] hidden sm:table-cell">Description</TableHead>
                        <TableHead className="text-right min-w-[100px]">Amount</TableHead>
                        <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction._id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span className="text-xs sm:hidden text-muted-foreground">
                                {formatDate(transaction.date)}
                              </span>
                              <span className="hidden sm:inline">
                                {formatDate(transaction.date)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.type === "income"
                                  ? "default"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell className="max-w-[200px] truncate hidden sm:table-cell">
                            {transaction.description || "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(transaction)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(transaction)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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

        {/* Transaction Form Dialog */}
        <TransactionForm
          open={isFormOpen}
          onOpenChange={handleFormClose}
          transaction={editingTransaction}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deletingTransaction}
          onOpenChange={(open) => !open && setDeletingTransaction(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                transaction for{" "}
                {deletingTransaction &&
                  formatCurrency(deletingTransaction.amount)}{" "}
                in the {deletingTransaction?.category} category.
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

export default Transactions;
