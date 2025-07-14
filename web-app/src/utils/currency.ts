export const formatCurrency = (amount: number, currency = 'PHP'): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const parseCurrencyInput = (value: string): number => {
  // Remove currency symbols and commas, then parse
  const cleanedValue = value.replace(/[₱,\s]/g, '');
  const parsed = parseFloat(cleanedValue);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `₱${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `₱${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
};
