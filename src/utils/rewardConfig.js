export const REDEMPTION_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FULFILLED: 'FULFILLED',
});

export const REWARD_CONVERSION_RATE = 2;

export const REWARD_CONFIG = Object.freeze({
  amazon: Object.freeze([
    Object.freeze({ amount: 50, requiredPoints: 100 }),
    Object.freeze({ amount: 100, requiredPoints: 200 }),
    Object.freeze({ amount: 200, requiredPoints: 400 }),
    Object.freeze({ amount: 250, requiredPoints: 500 }),
    Object.freeze({ amount: 500, requiredPoints: 1000 }),
  ]),
  flipkart: Object.freeze([
    Object.freeze({ amount: 50, requiredPoints: 100 }),
    Object.freeze({ amount: 100, requiredPoints: 200 }),
    Object.freeze({ amount: 200, requiredPoints: 400 }),
    Object.freeze({ amount: 250, requiredPoints: 500 }),
    Object.freeze({ amount: 500, requiredPoints: 1000 }),
  ]),
});

export const SUPPORTED_REWARD_BRANDS = Object.freeze(Object.keys(REWARD_CONFIG));
export const ALLOWED_REDEMPTION_STATUSES = Object.freeze(Object.values(REDEMPTION_STATUSES));
export const ADMIN_MUTABLE_REDEMPTION_STATUSES = Object.freeze([
  REDEMPTION_STATUSES.APPROVED,
  REDEMPTION_STATUSES.REJECTED,
  REDEMPTION_STATUSES.FULFILLED,
]);

export const getRewardRule = (brand, amount) => {
  const normalizedBrand = String(brand || '').toLowerCase();
  const normalizedAmount = Number(amount);

  return REWARD_CONFIG[normalizedBrand]?.find((rule) => rule.amount === normalizedAmount) || null;
};

export const getEligibleCoupons = (availablePoints) => {
  const safePoints = Math.max(0, Number(availablePoints) || 0);

  return Object.fromEntries(
    Object.entries(REWARD_CONFIG).map(([brand, rules]) => [
      brand,
      rules
        .filter((rule) => safePoints >= rule.requiredPoints)
        .map((rule) => rule.amount),
    ])
  );
};

export default REWARD_CONFIG;
