import {useState, useEffect, useCallback, InputHTMLAttributes} from 'react';
import {useTranslation} from 'react-i18next';

interface MoneyInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
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
  const cleanValue = value.replace(
    new RegExp(`[^0-9${config.decimalSeparator}]`, 'g'),
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
    .replace(new RegExp(`\\${config.thousandsSeparator}`, 'g'), '')
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

  // Internal display value (formatted string)
  const [displayValue, setDisplayValue] = useState('');

  // Format the initial value when component mounts or value changes externally
  useEffect(() => {
    if (value === '' || value === 0) {
      setDisplayValue('');
    } else {
      // Format the number for display
      const formatted = formatMoneyInput(
        value.toString().replace('.', config.decimalSeparator),
        config,
      );
      setDisplayValue(formatted);
    }
  }, [value, config.decimalSeparator]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Format the input value
      const formatted = formatMoneyInput(inputValue, config);
      setDisplayValue(formatted);

      // Parse and send numeric value to parent
      const numericValue = parseMoneyValue(formatted, config);
      onChange(numericValue);
    },
    [config, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      }

      // Also allow period or comma as decimal input depending on keyboard
      if (e.key === '.' || e.key === ',') {
        if (!displayValue.includes(config.decimalSeparator)) {
          // Convert to correct decimal separator
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
      }

      // Prevent all other keys
      e.preventDefault();
    },
    [config, displayValue, onChange],
  );

  const widthClass = fullWidth ? 'w-full' : '';
  const errorClass = error ? 'border-red-500 focus:ring-red-500' : '';

  // Generate locale-aware placeholder
  const defaultPlaceholder =
    config.decimalSeparator === ',' ? '0,00' : '0.00';

  return (
    <div className={`${widthClass}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className={`relative ${widthClass}`}>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          {config.currencySymbol}
        </span>
        <input
          type="text"
          inputMode="decimal"
          className={`pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${widthClass} ${errorClass} ${className}`}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

MoneyInput.displayName = 'MoneyInput';
