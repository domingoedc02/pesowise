import { formatCurrency, formatNumber, formatPercentage, parseCurrencyInput, formatCompactCurrency } from '../../utils/currency';

describe('Currency Utils', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('₱1,234.56');
      expect(formatCurrency(0)).toBe('₱0.00');
    });

    it('should format negative numbers correctly', () => {
      expect(formatCurrency(-1234.56)).toBe('-₱1,234.56');
    });

    it('should handle different currencies', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with decimals', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56');
      expect(formatNumber(1234)).toBe('1,234.00');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(45.6789)).toBe('45.7%');
      expect(formatPercentage(45.6789, 2)).toBe('45.68%');
      expect(formatPercentage(100)).toBe('100.0%');
    });
  });

  describe('parseCurrencyInput', () => {
    it('should parse currency strings correctly', () => {
      expect(parseCurrencyInput('₱1,234.56')).toBe(1234.56);
      expect(parseCurrencyInput('1,234')).toBe(1234);
      expect(parseCurrencyInput('1234.56')).toBe(1234.56);
    });

    it('should handle invalid input', () => {
      expect(parseCurrencyInput('')).toBe(0);
      expect(parseCurrencyInput('abc')).toBe(0);
    });
  });

  describe('formatCompactCurrency', () => {
    it('should format large numbers compactly', () => {
      expect(formatCompactCurrency(1234567)).toBe('₱1.2M');
      expect(formatCompactCurrency(1234)).toBe('₱1.2K');
      expect(formatCompactCurrency(123)).toBe('₱123.00');
    });
  });
});
