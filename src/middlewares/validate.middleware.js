import { ApiError } from '../utils/apiError.js';

const forbiddenSpinFields = ['userId', 'points', 'pointsWon', 'reward', 'rewardName', 'email'];

export const rejectClientControlledSpinFields = (req, res, next) => {
  const body = req.body || {};
  const forbiddenField = forbiddenSpinFields.find((field) => Object.prototype.hasOwnProperty.call(body, field));

  if (forbiddenField) {
    return next(new ApiError(400, `Field "${forbiddenField}" is not allowed`));
  }

  next();
};

export default {
  rejectClientControlledSpinFields,
};
