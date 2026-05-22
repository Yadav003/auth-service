/**
 * Contact Service
 * Handles persistence for contact form submissions
 */

import Contact from '../models/Contact.js';

export const createContactSubmission = async (payload) => {
  const contact = await Contact.create(payload);
  return contact;
};

export default {
  createContactSubmission,
};
