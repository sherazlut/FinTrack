import { body, validationResult } from "express-validator";

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
