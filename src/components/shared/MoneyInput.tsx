import {useState, useId, InputHTMLAttributes} from 'react';
import {useTranslation} from 'react-i18next';

interface MoneyInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  value: number | '';
  onChange: (value: number) => void;
}

interface LocaleConfig {
  locale: string;
  currency: string;
  thousandsSeparator: string;
  decimalSeparator: string;
  currencySymbol: string;
}

const LOCALE_CONFIGS: Record<string, LocaleConfig> = {
  en: {
    locale: 'en-US',
    currency: 'USD',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    currencySymbol: '$',
  },
  es: {
    locale: 'es-CO',
    currency: 'COP',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    currencySymbol: '$',
  },
};

function getLocaleConfig(language: string): LocaleConfig {
  return LOCALE_CONFIGS[language] || LOCALE_CONFIGS.en;
}

function formatMoneyInput(value: string, config: LocaleConfig): string {
  // Remove all non-numeric characters except the decimal separator
  const escapedDecimalSeparator = config.decimalSeparator.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  );
  const cleanValue = value.replace(
    new RegExp(`[^0-9${escapedDecimalSeparator}]`, 'g'),
    '',
  );

  // Handle empty value
  if (!cleanValue) return '';

  // Split into integer and decimal parts
  const parts = cleanValue.split(config.decimalSeparator);
  let integerPart = parts[0] || '';
  let decimalPart = parts.length > 1 ? parts[1] : '';

  // Remove leading zeros (except for a single zero)
  integerPart = integerPart.replace(/^0+/, '') || '0';

  // Limit decimal part to 2 digits
  decimalPart = decimalPart.slice(0, 2);

  // Add thousands separators to integer part
  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    config.thousandsSeparator,
  );

  // Combine parts
  if (parts.length > 1) {
    return `${formattedInteger}${config.decimalSeparator}${decimalPart}`;
  }

  return formattedInteger;
}

function parseMoneyValue(value: string, config: LocaleConfig): number {
  if (!value) return 0;

  // Remove thousands separators and replace decimal separator with period
  const cleanValue = value
    .replace(
      new RegExp(
        config.thousandsSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'g',
      ),
      '',
    )
    .replace(config.decimalSeparator, '.');

  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

export function MoneyInput({
  label,
  error,
  fullWidth = false,
  value,
  onChange,
  className = '',
  placeholder,
  ...props
}: MoneyInputProps) {
  const {i18n} = useTranslation();
  const config = getLocaleConfig(i18n.language);
  const generatedId = useId();
  const inputId = `money-input-${generatedId}`;
  const errorId = `money-input-error-${generatedId}`;

  // Internal display value (formatted string)
  const [displayValue, setDisplayValue] = useState('');
  const [prevValue, setPrevValue] = useState<number | ''>(value);
  const [prevDecimalSeparator, setPrevDecimalSeparator] = useState(
    config.decimalSeparator,
  );

  // Sync display value when external value or locale changes (React recommended pattern)
  // Note: Negative values are coerced to their absolute value since this input is for positive amounts only
  if (value !== prevValue || config.decimalSeparator !== prevDecimalSeparator) {
    setPrevValue(value);
    setPrevDecimalSeparator(config.decimalSeparator);

    const normalizedValue = typeof value === 'number' ? Math.abs(value) : value;

    if (normalizedValue === '' || normalizedValue === 0) {
      setDisplayValue('');
    } else {
      const formatted = formatMoneyInput(
        normalizedValue.toString().replace('.', config.decimalSeparator),
        config,
      );
      setDisplayValue(formatted);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Format the input value
    const formatted = formatMoneyInput(inputValue, config);
    setDisplayValue(formatted);

    // Parse and send numeric value to parent
    const numericValue = parseMoneyValue(formatted, config);
    onChange(numericValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, arrows
    if (
      [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
      ].includes(e.key)
    ) {
      return;
    }

    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    // Allow numbers
    if (/^\d$/.test(e.key)) {
      return;
    }

    // Allow decimal separator (only if not already present)
    if (e.key === config.decimalSeparator) {
      if (!displayValue.includes(config.decimalSeparator)) {
        return;
      }
      e.preventDefault();
      return;
    }

    // Convert period or comma to the locale's decimal separator
    if (
      (e.key === '.' || e.key === ',') &&
      !displayValue.includes(config.decimalSeparator)
    ) {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue =
        displayValue.slice(0, start) +
        config.decimalSeparator +
        displayValue.slice(end);
      const formatted = formatMoneyInput(newValue, config);
      setDisplayValue(formatted);
      const numericValue = parseMoneyValue(formatted, config);
      onChange(numericValue);

      // Set cursor position after the decimal separator
      setTimeout(() => {
        const newPosition = start + 1;
        input.setSelectionRange(newPosition, newPosition);
      }, 0);
      return;
    }

    // Prevent all other keys
    e.preventDefault();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedText = e.clipboardData.getData('text');

    // Normalize decimal separators: convert . or , to the locale's decimal separator
    // First, remove any characters that aren't digits, periods, or commas
    let cleaned = pastedText.replace(/[^\d.,]/g, '');

    // Determine which separator is the decimal (the last . or , is likely the decimal)
    const lastPeriod = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');

    if (lastPeriod > lastComma) {
      // Period is the decimal separator in pasted text
      cleaned = cleaned.replace(/,/g, '').replace('.', config.decimalSeparator);
    } else if (lastComma > lastPeriod) {
      // Comma is the decimal separator in pasted text
      cleaned = cleaned
        .replace(/\./g, '')
        .replace(',', config.decimalSeparator);
    }
    // If neither exists or they're equal, just use digits

    const formatted = formatMoneyInput(cleaned, config);
    setDisplayValue(formatted);

    const numericValue = parseMoneyValue(formatted, config);
    onChange(numericValue);
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error ? 'border-red-500 focus:ring-red-500' : '';

  // Generate locale-aware placeholder
  const defaultPlaceholder = config.decimalSeparator === ',' ? '0,00' : '0.00';

  return (
    <div className={`${widthClass}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <div className={`relative ${widthClass}`}>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
          {config.currencySymbol}
        </span>
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          className={`pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${widthClass} ${errorClass} ${className}`}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder || defaultPlaceholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

MoneyInput.displayName = 'MoneyInput';
