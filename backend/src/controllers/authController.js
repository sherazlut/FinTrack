import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

// Helper function for cookie options
// Render always uses HTTPS, so we need secure: true and sameSite: "none" for cross-origin cookies
const getCookieOptions = () => {
  // Check if we're in production (Render) or using HTTPS
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.RENDER;

  return {
    httpOnly: true,
    secure: true, // Always true for Render (HTTPS)
    sameSite: "none", // Required for cross-origin cookies (Vercel -> Render)
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/",
    domain: undefined, // Let browser set domain automatically
  };
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email }).select("+password");

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const token = generateToken(user._id);

    // Set HttpOnly cookie for security
    res.cookie("token", token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password +loginAttempts +lockUntil");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.isLocked) {
      const lockTime = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked. Try again in ${lockTime} minutes`,
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      await user.incrementLoginAttempts();
      const updatedUser = await User.findById(user._id).select(
        "+loginAttempts +lockUntil"
      );
      const remainingAttempts = Math.max(
        0,
        5 - (updatedUser.loginAttempts || 0)
      );

      if (updatedUser.isLocked) {
        const lockTime = Math.ceil(
          (updatedUser.lockUntil - Date.now()) / (1000 * 60)
        );
        return res.status(423).json({
          success: false,
          message: `Account locked due to too many failed attempts. Try again in ${lockTime} minutes`,
        });
      }

      if (remainingAttempts > 0) {
        return res.status(401).json({
          success: false,
          message: `Invalid email or password. ${remainingAttempts} attempts remaining`,
        });
      }
    }

    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    const token = generateToken(user._id);

    res.cookie("token", token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // Clear the HttpOnly cookie
    res.cookie("token", "", {
      httpOnly: true,
      secure: true, // Always true for Render (HTTPS)
      sameSite: "none", // Required for cross-origin cookies
      expires: new Date(0), // Expire immediately
      path: "/",
      domain: undefined,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
