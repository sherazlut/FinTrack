import express from "express";
import {
  createBudget,
  deleteBudget,
  getBudget,
  getBudgets,
  getBudgetProgress,
  updateBudget,
} from "../controllers/budgetController.js";
import { protect } from "../middleware/auth.js";
import {
  handleValidationErrors,
  validateBudgetCreate,
  validateBudgetUpdate,
} from "../middleware/validation.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getBudgets)
  .post(validateBudgetCreate, handleValidationErrors, createBudget);

router.get("/progress", getBudgetProgress);

router
  .route("/:id")
  .get(getBudget)
  .put(validateBudgetUpdate, handleValidationErrors, updateBudget)
  .delete(deleteBudget);

export default router;
