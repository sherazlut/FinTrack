import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getSummary,
  getTransaction,
  getTransactions,
  updateTransaction,
} from "../controllers/transactionController.js";
import { protect } from "../middleware/auth.js";
import {
  handleValidationErrors,
  validateTransactionCreate,
  validateTransactionUpdate,
} from "../middleware/validation.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getTransactions)
  .post(validateTransactionCreate, handleValidationErrors, createTransaction);

router.get("/summary", getSummary);

router
  .route("/:id")
  .get(getTransaction)
  .put(validateTransactionUpdate, handleValidationErrors, updateTransaction)
  .delete(deleteTransaction);

export default router;
