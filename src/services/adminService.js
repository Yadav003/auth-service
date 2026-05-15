/**
 * Admin Service
 * Business logic for admin-only operations (user management, dashboard stats)
 */

import User from '../models/User.js';
import { hashPassword } from '../utils/password.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sanitizeUser = (user) => {
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  return userObject;
};

export const listUsers = async ({ page = 1, limit = 20, search = '', role = '' }) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const trimmedSearch = String(search || '').trim().slice(0, 100);

  const query = {};

  if (role) {
    query.role = role;
  }

  if (trimmedSearch) {
    const safeSearch = escapeRegex(trimmedSearch);
    query.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { email: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    User.countDocuments(query),
  ]);

  return {
    users: users.map(sanitizeUser),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    },
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error('This email is already registered');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  return sanitizeUser(user);
};

export const updateUser = async (userId, updates) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (updates.name !== undefined) {
    user.name = updates.name;
  }

  if (updates.email !== undefined) {
    user.email = updates.email;
  }

  if (updates.role !== undefined) {
    user.role = updates.role;
  }

  if (updates.password !== undefined) {
    user.password = await hashPassword(updates.password);
  }

  if (updates.lockUntil !== undefined) {
    user.lockUntil = updates.lockUntil;
  }

  await user.save();

  return sanitizeUser(user);
};

export const deleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  await user.deleteOne();

  return { message: 'User deleted successfully' };
};

export const getDashboardStats = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const now = new Date();

  const [
    totalUsers,
    adminCount,
    lockedAccounts,
    loginsToday,
    registrationsToday,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ lockUntil: { $gt: now } }),
    User.countDocuments({ lastLogin: { $gte: todayStart } }),
    User.countDocuments({ createdAt: { $gte: todayStart } }),
  ]);

  return {
    totalUsers,
    adminCount,
    lockedAccounts,
    loginsToday,
    registrationsToday,
  };
};

export default {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getDashboardStats,
};
