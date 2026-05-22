/**
 * Admin Service
 * Business logic for admin-only operations (user management, dashboard stats)
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import Contact from '../models/Contact.js';
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

const sanitizeContact = (contact) => {
  return {
    id: contact._id?.toString(),
    name: contact.name,
    email: contact.email,
    subject: contact.subject,
    message: contact.message,
    phone: contact.phone,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  };
};

export const listUsers = async ({
  page = 1,
  limit = 10,
  search = '',
  role = '',
  loginProvider = '',
  status = '',
}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
  const trimmedSearch = String(search || '').trim().slice(0, 100);

  const query = {};

  if (role) {
    query.role = role;
  }

  if (loginProvider) {
    const normalizedLoginProvider = loginProvider === 'normal' ? 'local' : loginProvider;
    query.authProvider = normalizedLoginProvider;
  }

  if (status) {
    query.status = status;
  }

  if (trimmedSearch) {
    const safeSearch = escapeRegex(trimmedSearch);
    const normalizedSearch = trimmedSearch.toLowerCase() === 'normal' ? 'local' : null;
    const orFilters = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { email: { $regex: safeSearch, $options: 'i' } },
      { role: { $regex: safeSearch, $options: 'i' } },
      { authProvider: { $regex: safeSearch, $options: 'i' } },
      { status: { $regex: safeSearch, $options: 'i' } },
    ];

    if (normalizedSearch) {
      orFilters.push({ authProvider: normalizedSearch });
    }

    if (mongoose.Types.ObjectId.isValid(trimmedSearch)) {
      orFilters.push({ _id: trimmedSearch });
    }

    query.$or = orFilters;
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

export const listContacts = async ({ page = 1, limit = 10, search = '' }) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
  const trimmedSearch = String(search || '').trim().slice(0, 100);

  const query = {};

  if (trimmedSearch) {
    const safeSearch = escapeRegex(trimmedSearch);
    const orFilters = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { email: { $regex: safeSearch, $options: 'i' } },
      { subject: { $regex: safeSearch, $options: 'i' } },
      { message: { $regex: safeSearch, $options: 'i' } },
      { phone: { $regex: safeSearch, $options: 'i' } },
    ];

    if (mongoose.Types.ObjectId.isValid(trimmedSearch)) {
      orFilters.push({ _id: trimmedSearch });
    }

    query.$or = orFilters;
  }

  const [contacts, total] = await Promise.all([
    Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    Contact.countDocuments(query),
  ]);

  return {
    contacts: contacts.map(sanitizeContact),
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

export const createUser = async ({
  name,
  email,
  password,
  role,
  status = 'active',
}) => {
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
    status,
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

  if (updates.status !== undefined) {
    user.status = updates.status;
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

export const deleteContact = async (contactId) => {
  const contact = await Contact.findById(contactId);

  if (!contact) {
    const error = new Error('Contact not found');
    error.statusCode = 404;
    throw error;
  }

  await contact.deleteOne();

  return { message: 'Contact deleted successfully' };
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
  listContacts,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deleteContact,
  getDashboardStats,
};
