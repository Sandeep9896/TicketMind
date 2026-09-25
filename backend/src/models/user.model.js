import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

const roles = ['admin', 'agent', 'user'];
const agentTypes = ['hardware', 'software', 'network', 'security', 'account'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: roles,
      default: 'user'
    },
    agentType: {
      type: String,
      enum: agentTypes,
      default: null
    },
    refreshTokens: [
    {
      token: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  resetPasswordToken:{ type: String },
  resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.generateAccessToken = function generateAccessToken() {
  return jwt.sign(
    {
      sub: this._id.toString(),
      role: this.role,
      email: this.email
    },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );
};

userSchema.methods.generateRefreshToken = function generateRefreshToken() {
  return jwt.sign(
    {
      sub: this._id.toString(),
      role: this.role,
      email: this.email
    },
    env.refreshTokenSecret,
    { expiresIn: env.refreshTokenExpiresIn }
  );
};

const User = mongoose.model('User', userSchema);

export default User;
