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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAnalyticsStore from "@/store/analyticsStore";
import SpendingByCategoryChart from "@/components/charts/SpendingByCategoryChart";
import MonthlyTrendsChart from "@/components/charts/MonthlyTrendsChart";
import BudgetVsActualChart from "@/components/charts/BudgetVsActualChart";
import { toast } from "sonner";

const Analytics = () => {
  const {
    summary,
    spendingByCategory,
    monthlyTrends,
    budgetVsActual,
    isLoading,
    getSummary,
    getSpendingByCategory,
    getMonthlyTrends,
    getBudgetVsActual,
  } = useAnalyticsStore();

  // Initialize date range with current month
  const getCurrentMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    return {
      startDate: startOfMonth.toISOString().split("T")[0],
      endDate: endOfMonth.toISOString().split("T")[0],
    };
  };

  const [dateRange, setDateRange] = useState(getCurrentMonthRange);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState("custom"); // 'custom' or 'monthly'

  const loadAnalytics = useCallback(async () => {
    if (viewMode === "custom") {
      if (!dateRange.startDate || !dateRange.endDate) {
        toast.error("Please select both start and end dates");
        return;
      }
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      await Promise.all([
        getSummary({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
        getSpendingByCategory({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
        getMonthlyTrends({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      ]);
    } else {
      // Monthly view
      const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
      const endOfMonth = new Date(
        selectedYear,
        selectedMonth,
        0,
        23,
        59,
        59,
        999
      );

      await Promise.all([
        getSummary({
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString(),
        }),
        getSpendingByCategory({
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString(),
        }),
        getMonthlyTrends({
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString(),
        }),
        getBudgetVsActual(selectedMonth, selectedYear),
      ]);
    }
  }, [
    viewMode,
    dateRange,
    selectedMonth,
    selectedYear,
    getSummary,
    getSpendingByCategory,
    getMonthlyTrends,
    getBudgetVsActual,
  ]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

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

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = 0; i < 3; i++) {
    yearOptions.push(currentYear - 1 + i);
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed insights into your financial data
          </p>
        </div>

        {/* View Mode Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Options</CardTitle>
            <CardDescription>
              Choose how you want to view your analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">View Mode</Label>
                <Select value={viewMode} onValueChange={handleViewModeChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Date Range</SelectItem>
                    <SelectItem value="monthly">Monthly View</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {viewMode === "custom" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) =>
                        setDateRange({
                          ...dateRange,
                          startDate: e.target.value,
                        })
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) =>
                        setDateRange({
                          ...dateRange,
                          endDate: e.target.value,
                        })
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Month</Label>
                    <Select
                      value={selectedMonth.toString()}
                      onValueChange={(value) =>
                        setSelectedMonth(parseInt(value, 10))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month, index) => (
                          <SelectItem
                            key={index}
                            value={(index + 1).toString()}
                          >
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(value) =>
                        setSelectedYear(parseInt(value, 10))
                      }
                    >
                      <SelectTrigger className="mt-2">
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
              )}

              <Button onClick={loadAnalytics} disabled={isLoading}>
                {isLoading ? "Loading..." : "Refresh Analytics"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Income</CardTitle>
              <CardDescription>
                {viewMode === "custom"
                  ? "Selected period"
                  : `${MONTHS[selectedMonth - 1]} ${selectedYear}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary?.totalIncome)}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Expenses</CardTitle>
              <CardDescription>
                {viewMode === "custom"
                  ? "Selected period"
                  : `${MONTHS[selectedMonth - 1]} ${selectedYear}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(summary?.totalExpense)}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Balance</CardTitle>
              <CardDescription>
                {viewMode === "custom"
                  ? "Selected period"
                  : `${MONTHS[selectedMonth - 1]} ${selectedYear}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p
                  className={`text-2xl font-bold ${
                    (summary?.balance || 0) >= 0
                      ? "text-green-600"
                      : "text-destructive"
                  }`}
                >
                  {formatCurrency(summary?.balance)}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Transaction Count</CardTitle>
              <CardDescription>
                {viewMode === "custom"
                  ? "Selected period"
                  : `${MONTHS[selectedMonth - 1]} ${selectedYear}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">
                  {(summary?.incomeCount || 0) + (summary?.expenseCount || 0)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Spending by Category Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>
                {viewMode === "custom"
                  ? "Expense breakdown for selected period"
                  : `Expense breakdown for ${
                      MONTHS[selectedMonth - 1]
                    } ${selectedYear}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <SpendingByCategoryChart data={spendingByCategory} />
              )}
            </CardContent>
          </Card>

          {/* Monthly Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>
                {viewMode === "custom"
                  ? "Income vs Expense trends"
                  : `Last 12 months overview`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <MonthlyTrendsChart data={monthlyTrends} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Budget vs Actual Chart - Only shown in monthly view */}
        {viewMode === "monthly" && (
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
              <CardDescription>
                Compare your budgeted vs actual spending for{" "}
                {MONTHS[selectedMonth - 1]} {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <BudgetVsActualChart data={budgetVsActual} />
              )}
            </CardContent>
          </Card>
        )}

        {/* Additional Statistics */}
        {spendingByCategory && spendingByCategory.categories && (
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Detailed spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {spendingByCategory.categories.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: `hsl(var(--chart-${
                            (index % 5) + 1
                          }))`,
                        }}
                      />
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {formatCurrency(item.totalAmount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.percentage}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
