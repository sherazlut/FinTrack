import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const buildFilters = (query = {}) => {
  const filters = {};

  if (query.type && ["income", "expense"].includes(query.type)) {
    filters.type = query.type;
  }

  if (query.category) {
    filters.category = { $regex: new RegExp(query.category, "i") };
  }

  if (query.startDate || query.endDate) {
    filters.date = {};
    if (query.startDate) {
      filters.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filters.date.$lte = new Date(query.endDate);
    }
  }

  return filters;
};

export const getTransactions = async (req, res, next) => {
  try {
    const filters = buildFilters(req.query);
    filters.user = req.user.id;

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;
    const sort = req.query.sort === "amount" ? { amount: -1 } : { date: -1 };

    const [transactions, total] = await Promise.all([
      Transaction.find(filters).sort(sort).skip(skip).limit(limit),
      Transaction.countDocuments(filters),
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
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

export const getTransaction = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.create({
      ...req.body,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req, res, next) => {
  try {
    const filters = buildFilters(req.query);
    filters.user = mongoose.Types.ObjectId.createFromHexString(req.user.id);

    const summary = await Transaction.aggregate([
      { $match: filters },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const income = summary.find((item) => item._id === "income") || {
      totalAmount: 0,
      count: 0,
    };
    const expense = summary.find((item) => item._id === "expense") || {
      totalAmount: 0,
      count: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        totalIncome: income.totalAmount,
        incomeCount: income.count,
        totalExpense: expense.totalAmount,
        expenseCount: expense.count,
        balance: income.totalAmount - expense.totalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};
