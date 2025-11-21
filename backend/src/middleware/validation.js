import { body, validationResult } from "express-validator";

// Validation middleware for user registration
export const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces")
    .escape(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage("Email is too long"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 128 })
    .withMessage("Password must be between 6 and 128 characters")
    .custom((value) => {
      if (!/(?=.*[a-z])/.test(value)) {
        throw new Error("Password must contain at least one lowercase letter");
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        throw new Error("Password must contain at least one uppercase letter");
      }
      if (!/(?=.*\d)/.test(value)) {
        throw new Error("Password must contain at least one number");
      }
      return true;
    }),
];

export const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage("Email is too long"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 1, max: 128 })
    .withMessage("Invalid password format"),
];

export const validateTransactionCreate = [
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["income", "expense"])
    .withMessage("Type must be either income or expense"),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number")
    .toFloat(),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ max: 50 })
    .withMessage("Category cannot exceed 50 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO 8601 string")
    .toDate(),
];

export const validateTransactionUpdate = [
  body("type")
    .optional()
    .trim()
    .isIn(["income", "expense"])
    .withMessage("Type must be either income or expense"),
  body("amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number")
    .toFloat(),
  body("category")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Category cannot exceed 50 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO 8601 string")
    .toDate(),
];

export const validateBudgetCreate = [
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ max: 50 })
    .withMessage("Category cannot exceed 50 characters"),
  body("monthlyLimit")
    .notEmpty()
    .withMessage("Monthly limit is required")
    .isFloat({ min: 0 })
    .withMessage("Monthly limit must be a positive number")
    .toFloat(),
  body("month")
    .notEmpty()
    .withMessage("Month is required")
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12")
    .toInt(),
  body("year")
    .notEmpty()
    .withMessage("Year is required")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Year must be a valid year")
    .toInt(),
];

export const validateBudgetUpdate = [
  body("category")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Category cannot exceed 50 characters"),
  body("monthlyLimit")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Monthly limit must be a positive number")
    .toFloat(),
  body("month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12")
    .toInt(),
  body("year")
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Year must be a valid year")
    .toInt(),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};
