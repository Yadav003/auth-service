import rewards from '../config/rewards.js';

const getUtcDayStart = (date = new Date()) => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

export const canUserSpinToday = (lastSpinDate) => {
  if (!lastSpinDate) {
    return true;
  }

  const lastSpin = new Date(lastSpinDate);
  if (Number.isNaN(lastSpin.getTime())) {
    return true;
  }

  return lastSpin < getUtcDayStart();
};

export const getNextSpinTime = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
};

export const getCurrentSpinWindowStart = () => {
  return getUtcDayStart();
};

export const getWeightedReward = () => {
  const totalProbability = rewards.reduce((sum, reward) => {
    return sum + Math.max(0, reward.probability);
  }, 0);

  if (totalProbability <= 0) {
    throw new Error('Reward configuration must contain at least one positive probability');
  }

  const threshold = Math.random() * totalProbability;
  let cumulativeProbability = 0;

  for (const reward of rewards) {
    cumulativeProbability += Math.max(0, reward.probability);

    if (threshold < cumulativeProbability) {
      return reward;
    }
  }

  return rewards.find((reward) => reward.probability > 0);
};

export default {
  canUserSpinToday,
  getNextSpinTime,
  getCurrentSpinWindowStart,
  getWeightedReward,
};
