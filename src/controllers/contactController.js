/**
 * Contact Controller
 * Handles contact form submissions
 */

import { validateContactSubmission } from '../validators/contactValidator.js';
import { createContactSubmission } from '../services/contactService.js';

export const submitContact = async (req, res, next) => {
  try {
    const { error, value } = validateContactSubmission(req.body || {});

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    const contact = await createContactSubmission(value);

    res.status(201).json({
      status: 'success',
      message: 'Contact message received',
      data: {
        id: contact._id?.toString(),
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  submitContact,
};
