/**
 * Admin Controller
 * Handles HTTP requests for admin-only endpoints
 */

import {
  listUsers,
  listContacts,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deleteContact,
  getDashboardStats,
} from '../services/adminService.js';
import { logoutUser } from '../services/authService.js';
import {
  validateListUsers,
  validateListContacts,
  validateCreateUser,
  validateUpdateUser,
} from '../validators/adminValidator.js';

export const getDashboard = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();

    res.status(200).json({
      status: 'success',
      message: 'Admin dashboard data',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { error, value } = validateListUsers(req.query);

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    const result = await listUsers(value);

    res.status(200).json({
      status: 'success',
      message: 'Users fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (req, res, next) => {
  try {
    const { error, value } = validateListContacts(req.query);

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    const result = await listContacts(value);

    res.status(200).json({
      status: 'success',
      message: 'Contacts fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContactHandler = async (req, res, next) => {
  try {
    const result = await deleteContact(req.params.contactId);

    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.userId);

    res.status(200).json({
      status: 'success',
      message: 'User fetched successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const createUserHandler = async (req, res, next) => {
  try {
    const { error, value } = validateCreateUser(req.body);

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    const user = await createUser(value);

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserHandler = async (req, res, next) => {
  try {
    const { error, value } = validateUpdateUser(req.body || {});

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    const user = await updateUser(req.params.userId, value);

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserHandler = async (req, res, next) => {
  try {
    const result = await deleteUser(req.params.userId);

    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogout = async (req, res, next) => {
  try {
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token is required',
      });
    }

    await logoutUser({ refreshToken });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboard,
  getUsers,
  getContacts,
  getUser,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  deleteContactHandler,
  adminLogout,
};
