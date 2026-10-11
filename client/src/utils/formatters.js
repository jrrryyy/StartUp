import { format } from 'date-fns';

/**
 * Format numbers as currency with symbol (Default PHP ₱)
 */
export const formatCurrency = (amount, symbol = '₱') => {
  const num = Number(amount) || 0;
  return `${symbol}${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format date
 */
export const formatDate = (date, pattern = 'MMM dd, yyyy') => {
  if (!date) return '—';
  try {
    return format(new Date(date), pattern);
  } catch (e) {
    return String(date);
  }
};

/**
 * Format date & time
 */
export const formatDateTime = (date, pattern = 'MMM dd, yyyy hh:mm a') => {
  if (!date) return '—';
  try {
    return format(new Date(date), pattern);
  } catch (e) {
    return String(date);
  }
};
