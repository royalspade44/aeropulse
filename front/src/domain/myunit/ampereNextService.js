/**
 * AMPERE-style estimate: next regular servicing window from technician report summary.
 * @param {Object} params
 * @param {string} [params.conditionRating] - 'excellent' | 'good' | 'fair' | 'poor'
 * @param {string} [params.lastServiceDate] - ISO date
 * @returns {{ label: string, monthsUntil: number }}
 */
export function estimateNextServiceWindow({ conditionRating = 'good', lastServiceDate } = {}) {
  const baseMonths = { excellent: 6, good: 5, fair: 3, poor: 2 }[conditionRating] || 4;
  const start = lastServiceDate ? new Date(lastServiceDate) : new Date();
  const target = new Date(start);
  target.setMonth(target.getMonth() + baseMonths);
  const monthName = target.toLocaleString('en-US', { month: 'long' });
  const year = target.getFullYear();
  const week = Math.ceil(target.getDate() / 7);
  return {
    label: `${monthName} ${year}, Week ${week}`,
    monthsUntil: baseMonths
  };
}
