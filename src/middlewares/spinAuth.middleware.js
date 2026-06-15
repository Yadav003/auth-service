import User from '../models/User.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';

export const authenticateSpinUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(401, 'Unauthorized: No token provided');
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(401, 'Unauthorized: Invalid token format');
    }

    const decoded = verifyAccessToken(token);

    if (decoded.type && decoded.type !== 'access') {
      throw new ApiError(401, 'Unauthorized: Invalid token type');
    }

    if (!decoded.userId) {
      throw new ApiError(401, 'Unauthorized: Invalid token payload');
    }

    const user = await User.findById(decoded.userId).select('_id email role status totalRewardPoints lastSpinDate');

    if (!user || user.status === 'disabled') {
      throw new ApiError(401, 'Unauthorized: User is not active');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticateSpinUser;
