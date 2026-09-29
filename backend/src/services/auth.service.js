import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';
import User from '../models/user.model.js';
import { verifyGoogleToken } from '../utils/googleAuth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { sendMail } from '../utils/sendMail.js';

const sanitizeUser = (userDoc) => ({
  id: userDoc._id,
  name: userDoc.name,
  email: userDoc.email,
  role: userDoc.role,
  agentType: userDoc.agentType || null,
  createdAt: userDoc.createdAt
});

const register = async ({ name, email, password, role, agentType }) => {
  if (role === 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Admin accounts cannot be self-registered');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email is already registered');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
    status: 'active',
    agentType: role === 'agent' ? agentType : null
  });

  const token = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshTokens.push({ token: refreshToken });
  await user.save();

  return {
    user: sanitizeUser(user),
    token,
    refreshToken
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  const validPassword = await user.comparePassword(password);

  if (!validPassword) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  const token = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshTokens.push({ token: refreshToken });
  user.status = 'active'; // Set user status to active on successful login
  await user.save();

  return {
    user: sanitizeUser(user),
    token,
    refreshToken
  };
};

const listAgents = async () => {
  const agents = await User.find({ role: 'agent' })
    .select('name email role agentType createdAt')
    .sort({ createdAt: -1 });

  return agents.map((agent) => sanitizeUser(agent));
};

const changePassword = async ({ userId, currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const validPassword = await user.comparePassword(currentPassword);

  if (!validPassword) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password updated successfully' };
};

const googleLogin = async ({ credential }) => {
  // Verify the Google token and extract user info (this is a placeholder, implement actual verification)
  const { email, name } = await verifyGoogleToken(credential);
  console.log("google login", { email, name });

  let user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // If user doesn't exist, create a new one with 'user' role
    const generatedPassword = Math.random().toString(36).slice(-8); // Generate a random password
    user = await User.create({
      name,
      email,
      password: generatedPassword,
      role: 'user',
      status: 'active'
    });

    sendMail({

      to: email,

      subject: 'TicketMind Login Password',

      html: `
    <h2>Welcome to TicketMind</h2>

    <p>
      Your account was created using Google login.
    </p>

    <p>
      Manual login password:
    </p>

    <h3>${generatedPassword}</h3>

    <p>
      Please change password after login.
    </p>
  `
    });
  } else {
    user.status = 'active';
    await user.save();
  }
  const token = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Store refresh token in the database
  user.refreshTokens.push({ token: refreshToken });
  await user.save();


  return {
    user: sanitizeUser(user),
    token,
    refreshToken
  };
};



export { register, login, listAgents, changePassword, googleLogin };
