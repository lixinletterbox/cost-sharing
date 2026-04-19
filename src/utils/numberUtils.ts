/**
 * Formats a number with thousand separators and 2 decimal places.
 * Example: 1234.56 -> 1,234.56
 */
export function formatAmount(amount: number, language?: string): string {
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  return amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
