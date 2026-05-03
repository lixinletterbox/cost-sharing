import { SUPPORTED_CURRENCIES } from '../types';

/**
 * Returns the symbol for a given currency code.
 * Falls back to the code itself if not found.
 */
export function getCurrencySymbol(currencyCode: string): string {
  const found = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return found ? found.symbol : currencyCode;
}

/**
 * Formats a number with the given currency's symbol and thousand separators.
 * Example: formatAmount(1234.56, 'en', 'EUR') -> '€1,234.56'
 */
export function formatAmount(amount: number, language?: string, currencyCode?: string): string {
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol = currencyCode ? getCurrencySymbol(currencyCode) : '$';
  return `${symbol}${formatted}`;
}

/**
 * Formats a number without any currency prefix (plain number with decimals).
 */
export function formatNumber(amount: number, language?: string): string {
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  return amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
