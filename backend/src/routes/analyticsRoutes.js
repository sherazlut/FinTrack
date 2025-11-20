import express from "express";
import {
  getSpendingByCategory,
  getMonthlyTrends,
  getBudgetVsActual,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

router.get("/spending-by-category", getSpendingByCategory);
router.get("/monthly-trends", getMonthlyTrends);
router.get("/budget-vs-actual", getBudgetVsActual);

export default router;
