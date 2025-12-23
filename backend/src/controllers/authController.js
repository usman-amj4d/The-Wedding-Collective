import User from "../models/User/User.js";
import sendMail from "../utils/sendMail.js";
import { errorHandler } from "../utils/errorHandler.js";
import { successHandler } from "../utils/successHandler.js";

// ? Register
export const register = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { name, email, gender, password } = req.body;
    if (
      !password.match(
        /(?=[A-Za-z0-9@#$%^&+!=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=])(?=.{8,}).*$/
      )
    ) {
      return errorHandler(
        "Password must contain at least one uppercase letter, one special character, and one number",
        400,
        req,
        res
      );
    }
    const user = await User.findOne({ email });
    if (user) {
      return errorHandler("User already exists", 400, req, res);
    }
    const newUser = await User.create({
      name,
      email,
      gender,
      password,
    });
    newUser.save();
    return successHandler("User created successfully", null, 200, res);
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// ? Request Email Verification Token
export const requestEmailToken = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return errorHandler("User does not exist", 400, req, res);
    }
    const emailVerificationToken = Math.floor(100000 + Math.random() * 900000);
    const emailVerificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpires = emailVerificationTokenExpires;
    await user.save();
    const message = `Your email verification token is ${emailVerificationToken} and it expires in 10 minutes`;
    const subject = `Email verification token`;
    await sendMail(email, subject, message);
    return successHandler(
      `Email verification token sent to ${email}`,
      null,
      200,
      res
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// ? Verify Email Token
export const verifyEmail = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { email, emailVerificationToken } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }
    if (
      user.emailVerificationToken !== emailVerificationToken ||
      user.emailVerificationTokenExpires < Date.now()
    ) {
      return errorHandler("Invalid token", 400, req, res);
    }
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    jwt = user.getJWT();
    await user.save();
    return successHandler("Email verified successfully", null, 200, res);
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// ? Login
export const login = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return errorHandler("User does not exist", req, 400, res);
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorHandler("Invalid credentials", 400, req, res);
    }
    if (!user.emailVerified) {
      return errorHandler("Email not verified", 400, req, res);
    }

    const jwt = user.getJWT();

    return successHandler(
      "Logged in successfully",
      { jwt, data: user },
      200,
      res
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// ? Logout
export const logout = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    req.user = null;
    return successHandler("Logged out successfully", null, 200, res);
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// ? Forgot Password
export const forgotPassword = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return errorHandler("User does not exist", 400, req, res);
    }
    const passwordResetToken = Math.floor(100000 + Math.random() * 900000);
    const passwordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetToken = passwordResetToken;
    user.passwordResetTokenExpires = passwordResetTokenExpires;
    await user.save();
    const message = `Your password reset token is ${resetPasswordToken} and it expires in 10 minutes`;
    const subject = `Password reset token`;
    await sendMail(email, subject, message);
    return successHandler(
      `Password reset token sent to ${email}`,
      null,
      200,
      res
    );
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// ? Reset Password
export const resetPassword = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { email, passwordResetToken, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return errorHandler("User does not exist", 400, req, res);
    }
    if (
      user.passwordResetToken !== passwordResetToken ||
      user.passwordResetTokenExpires < Date.now()
    ) {
      return errorHandler("Invalid token", 400, req, res);
    }
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;
    await user.save();
    return successHandler("Password reset successfully", null, 200, res);
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};

// ? Update Password
export const updatePassword = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { currentPassword, newPassword } = req.body;
    if (
      !newPassword.match(
        /(?=[A-Za-z0-9@#$%^&+!=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=])(?=.{8,}).*$/
      )
    ) {
      return errorHandler(
        "Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character",
        400,
        req,
        res
      );
    }
    const user = await User.findById(req.user.id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorHandler("Invalid credentials", 400, req, res);
    }
    const samePasswords = await user.comparePassword(newPassword);
    if (samePasswords) {
      return errorHandler(
        "New password cannot be the same as the old password",
        400,
        req,
        res
      );
    }
    user.password = newPassword;
    await user.save();
    return successHandler("Password updated successfully", null, 200, res);
  } catch (error) {
    return errorHandler(error.message, 500, req, res);
  }
};
