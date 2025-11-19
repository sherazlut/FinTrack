import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";

const buildFilters = (query = {}) => {
  const filters = {};

  if (query.category) {
    filters.category = { $regex: new RegExp(query.category, "i") };
  }

  if (query.month) {
    const month = parseInt(query.month, 10);
    if (month >= 1 && month <= 12) {
      filters.month = month;
    }
  }

  if (query.year) {
    const year = parseInt(query.year, 10);
    if (year >= 2000 && year <= 2100) {
      filters.year = year;
    }
  }

  return filters;
};

export const getBudgets = async (req, res, next) => {
  try {
    const filters = buildFilters(req.query);
    filters.user = req.user.id;

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;
    const sort =
      req.query.sort === "monthlyLimit"
        ? { monthlyLimit: -1 }
        : { year: -1, month: -1 };

    const [budgets, total] = await Promise.all([
      Budget.find(filters).sort(sort).skip(skip).limit(limit),
      Budget.countDocuments(filters),
    ]);

    res.status(200).json({
      success: true,
      data: budgets,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBudget = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget ID",
      });
    }

    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

export const createBudget = async (req, res, next) => {
  try {
    const budget = await Budget.create({
      ...req.body,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Budget created successfully",
      data: budget,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Budget already exists for this category, month, and year",
      });
    }
    next(error);
  }
};

export const updateBudget = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget ID",
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget ID",
      });
    }

    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getBudgetProgress = async (req, res, next) => {
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

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const budgets = await Budget.find({
      user: req.user.id,
      month,
      year,
    });

    const budgetProgress = await Promise.all(
      budgets.map(async (budget) => {
        const actualSpending = await Transaction.aggregate([
          {
            $match: {
              user: new mongoose.Types.ObjectId(req.user.id),
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
            },
          },
        ]);

        const actual = actualSpending[0]?.total || 0;
        const limit = budget.monthlyLimit;
        const remaining = limit - actual;
        const percentage = limit > 0 ? (actual / limit) * 100 : 0;

        return {
          budgetId: budget._id,
          category: budget.category,
          monthlyLimit: limit,
          actualSpending: actual,
          remaining: remaining,
          percentage: Math.round(percentage * 100) / 100,
          status:
            actual > limit
              ? "exceeded"
              : actual > limit * 0.8
              ? "warning"
              : "good",
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        month,
        year,
        budgets: budgetProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};
