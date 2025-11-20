import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";

// Helper function to build date filters
const buildDateFilters = (query = {}) => {
  const filters = {};

  if (query.startDate || query.endDate) {
    filters.date = {};
    if (query.startDate) {
      filters.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filters.date.$lte = new Date(query.endDate);
    }
  } else {
    // Default to current month if no dates provided
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
    filters.date = {
      $gte: startOfMonth,
      $lte: endOfMonth,
    };
  }

  return filters;
};

// GET /api/analytics/spending-by-category
// Returns spending breakdown by category (for expenses)
export const getSpendingByCategory = async (req, res, next) => {
  try {
    const dateFilters = buildDateFilters(req.query);
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Only get expense transactions
    const matchFilters = {
      ...dateFilters,
      user: userId,
      type: "expense",
    };

    const spendingByCategory = await Transaction.aggregate([
      { $match: matchFilters },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalAmount: { $round: ["$totalAmount", 2] },
          transactionCount: 1,
        },
      },
    ]);

    // Calculate total spending for percentage calculation
    const totalSpending = spendingByCategory.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );

    // Add percentage to each category
    const spendingWithPercentage = spendingByCategory.map((item) => ({
      ...item,
      percentage:
        totalSpending > 0
          ? Math.round((item.totalAmount / totalSpending) * 100 * 100) / 100
          : 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        categories: spendingWithPercentage,
        totalSpending: Math.round(totalSpending * 100) / 100,
        period: {
          startDate: dateFilters.date.$gte,
          endDate: dateFilters.date.$lte,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/monthly-trends
// Returns monthly income/expense trends
export const getMonthlyTrends = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get start and end dates from query or default to last 12 months
    let startDate, endDate;

    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);
    } else {
      // Default to last 12 months
      endDate = new Date();
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 11);
      startDate.setDate(1); // First day of the month
    }

    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          totalAmount: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
          },
          income: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "income"] }, "$totalAmount", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "expense"] }, "$totalAmount", 0],
            },
          },
          incomeCount: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "income"] }, "$transactionCount", 0],
            },
          },
          expenseCount: {
            $sum: {
              $cond: [
                { $eq: ["$_id.type", "expense"] },
                "$transactionCount",
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          income: { $round: ["$income", 2] },
          expense: { $round: ["$expense", 2] },
          balance: { $round: [{ $subtract: ["$income", "$expense"] }, 2] },
          incomeCount: 1,
          expenseCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        trends: monthlyTrends,
        period: {
          startDate,
          endDate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/budget-vs-actual
// Returns budget vs actual spending comparison
export const getBudgetVsActual = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    if (month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: "Month must be between 1 and 12",
      });
    }

    if (year < 2000 || year > 2100) {
      return res.status(400).json({
        success: false,
        message: "Year must be a valid year",
      });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get all budgets for the specified month/year
    const budgets = await Budget.find({
      user: req.user.id,
      month,
      year,
    });

    // Get actual spending for each budget category
    const budgetVsActual = await Promise.all(
      budgets.map(async (budget) => {
        const actualSpending = await Transaction.aggregate([
          {
            $match: {
              user: userId,
              type: "expense",
              category: budget.category,
              date: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ]);

        const actual = actualSpending[0]?.total || 0;
        const budgeted = budget.monthlyLimit;
        const difference = actual - budgeted;
        const percentage = budgeted > 0 ? (actual / budgeted) * 100 : 0;

        return {
          budgetId: budget._id,
          category: budget.category,
          budgeted: Math.round(budgeted * 100) / 100,
          actual: Math.round(actual * 100) / 100,
          difference: Math.round(difference * 100) / 100,
          percentage: Math.round(percentage * 100) / 100,
          status:
            actual > budgeted
              ? "exceeded"
              : actual > budgeted * 0.8
              ? "warning"
              : "good",
          transactionCount: actualSpending[0]?.count || 0,
        };
      })
    );

    // Calculate totals
    const totals = budgetVsActual.reduce(
      (acc, item) => {
        acc.totalBudgeted += item.budgeted;
        acc.totalActual += item.actual;
        return acc;
      },
      { totalBudgeted: 0, totalActual: 0 }
    );

    totals.totalDifference =
      Math.round((totals.totalActual - totals.totalBudgeted) * 100) / 100;

    res.status(200).json({
      success: true,
      data: {
        month,
        year,
        categories: budgetVsActual,
        totals: {
          ...totals,
          totalBudgeted: Math.round(totals.totalBudgeted * 100) / 100,
          totalActual: Math.round(totals.totalActual * 100) / 100,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
