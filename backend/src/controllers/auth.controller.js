import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import * as authService from '../services/auth.service.js';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/user.model.js';
import crypto from 'crypto';
import {sendMail} from '../utils/sendMail.js';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const allowedRoles = ['admin', 'agent', 'user'];
const allowedAgentTypes = ['hardware', 'software', 'network', 'security', 'account'];

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, agentType } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'name, email and password are required');
  }

  if (!validateEmail(email)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid email format');
  }

  if (password.length < 8) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password must be at least 8 characters');
  }

  if (role && !allowedRoles.includes(role)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid role value');
  }

  if (role === 'agent' && !agentType) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'agentType is required for agent registration');
  }

  if (agentType && !allowedAgentTypes.includes(agentType)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid agent type value');
  }

  const payload = await authService.register({ name, email, password, role, agentType, status: 'active' });

  res.status(StatusCodes.CREATED)
  .cookie('token', payload.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }).json({
    success: true,
    message: 'Registration successful',
    data: payload
  })
});

const login = asyncHandler(async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'email and password are required'
    );
  }

  const payload = await authService.login({
    email,
    password
  });

  return res
    .status(StatusCodes.OK)
    .cookie('token', payload.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .json({
      success: true,
      message: 'Login successful',
      data: payload
    });

});

const getAgents = asyncHandler(async (req, res) => {
  const agents = await authService.listAgents();

  res.status(StatusCodes.OK).json({
    success: true,
    data: agents
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'currentPassword, newPassword and confirmPassword are required'
    );
  }

  if (newPassword.length < 8) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'New password must be at least 8 characters');
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'New password and confirm password must match');
  }

  await authService.changePassword({
    userId: req.user._id,
    currentPassword,
    newPassword
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Password changed successfully'
  });
});

const googleLogin = asyncHandler(async (req, res) => {

  const { credential } = req.body;

  if (!credential) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Google credential is required'
    );
  }

  const payload =
    await authService.googleLogin({
      credential
    });

  // SET COOKIE FIRST
  res.cookie('token', payload.refreshToken, {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:
      7 * 24 * 60 * 60 * 1000
  });

  // THEN SEND RESPONSE
  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Google login successful',
    data: {
      user: payload.user,
      token: payload.token
    }
  });
});

const refreshToken = asyncHandler(async (req, res) => {

  console.log('Received refresh token request',req.cookies.token);
  const incomingRefreshToken = req.cookies.token;

  if (!incomingRefreshToken) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'Refresh token missing'
    );
  }

  let decoded;

  try {

    decoded = jwt.verify(
      incomingRefreshToken,
      env.refreshTokenSecret
    );

  } catch (error) {

    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'Invalid or expired refresh token'
    );
  }

  const user = await User.findById(decoded.sub);

  if (!user) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'User not found'
    );
  }

  // OPTIONAL BUT RECOMMENDED
  // check token exists in DB

  const tokenExists = user.refreshTokens.some(
  (item) => item.token === incomingRefreshToken
);

if (!tokenExists) {
  throw new ApiError(
    StatusCodes.UNAUTHORIZED,
    'Refresh token revoked'
  );
}

  // generate new access token

  const accessToken = user.generateAccessToken();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Access token refreshed successfully',
    data: {
      accessToken
    }
  });
});


const forgotPassword = asyncHandler(async (req, res) => {

  const { email } = req.body;
  console.log('Received forgot password request for email:', email);

  const user = await User.findOne({
    email: email.toLowerCase()
  });
  console.log('User found for forgot password:', user);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const resetToken =
    crypto.randomBytes(32).toString('hex');

  user.resetPasswordToken = resetToken;

  user.resetPasswordExpires =
    Date.now() + 10 * 60 * 1000;

  await user.save();

  const resetUrl =
    `http://localhost:5173/reset-password/${resetToken}`;

  await sendMail({
    to: user.email,

    subject: 'Reset Password',

    html: `
      <h2>Reset Password</h2>

      <p>
        Click below link:
      </p>

      <a href="${resetUrl}">
        Reset Password
      </a>

      <p>
        Valid for 10 minutes.
      </p>
    `
  });

  return res.status(200).json({
    success: true,
    message: 'Reset link sent'
  });
});


const resetPassword = asyncHandler(async (req, res) => {

  const { token } = req.params;

  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  });

  if (!user) {
    throw new ApiError(
      400,
      'Invalid or expired token'
    );
  }



  user.password = password;

  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Password reset successful'
  });
});

const logout = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'User not found'
    );
  }

  // Remove the refresh token from the user's refreshTokens array
  user.refreshTokens = user.refreshTokens.filter(
    (item) => item.token !== req.cookies.token
  );
  user.status = 'inactive'; // Set user status to inactive on logout
  
  await user.save();


  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});


export { register, login, getAgents, changePassword, googleLogin, refreshToken, forgotPassword, resetPassword, logout };
