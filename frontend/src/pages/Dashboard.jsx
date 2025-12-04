import { useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useAnalyticsStore from "@/store/analyticsStore";
import SpendingByCategoryChart from "@/components/charts/SpendingByCategoryChart";
import MonthlyTrendsChart from "@/components/charts/MonthlyTrendsChart";
import BudgetVsActualChart from "@/components/charts/BudgetVsActualChart";

const Dashboard = () => {
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

  useEffect(() => {
    // Get current month data
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

    // Fetch all dashboard data
    getSummary({
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
    });
    getSpendingByCategory({
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
    });
    getMonthlyTrends();
    getBudgetVsActual(now.getMonth() + 1, now.getFullYear());
  }, [getSummary, getSpendingByCategory, getMonthlyTrends, getBudgetVsActual]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const calculateBudgetProgress = () => {
    if (!budgetVsActual || !budgetVsActual.totals) return 0;
    const { totalBudgeted, totalActual } = budgetVsActual.totals;
    if (totalBudgeted === 0) return 0;
    return Math.min((totalActual / totalBudgeted) * 100, 100);
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome to your financial overview
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Income</CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">
                  {formatCurrency(summary?.totalIncome)}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Expenses</CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">
                  {formatCurrency(summary?.totalExpense)}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Balance</CardTitle>
              <CardDescription>This month</CardDescription>
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
              <CardTitle>Budget Progress</CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">
                  {calculateBudgetProgress().toFixed(1)}%
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Spending by Category Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>This month's expense breakdown</CardDescription>
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
              <CardDescription>Last 12 months overview</CardDescription>
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

        {/* Budget vs Actual Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual</CardTitle>
            <CardDescription>
              Compare your budgeted vs actual spending this month
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
      </div>
    </Layout>
  );
};

export default Dashboard;
