interface LocaleCurrencyConfig {
  locale: string;
  currency: string;
}

const CURRENCY_CONFIGS: Record<string, LocaleCurrencyConfig> = {
  en: {
    locale: 'en-US',
    currency: 'USD',
  },
  es: {
    locale: 'es-CO',
    currency: 'COP',
  },
};

/**
 * Get currency configuration based on language
 */
export function getCurrencyConfig(language: string): LocaleCurrencyConfig {
  return CURRENCY_CONFIGS[language] || CURRENCY_CONFIGS.en;
}

/**
 * Format currency value (default to US format for backwards compatibility)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format currency value based on language locale
 */
export function formatCurrencyLocale(amount: number, language: string): string {
  const config = getCurrencyConfig(language);
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Parse currency input to number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and spaces
  const cleaned = value.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Round to 2 decimal places
 */
export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
