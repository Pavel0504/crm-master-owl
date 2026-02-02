import { forwardRef, useState, useEffect } from 'react';
import { Ruble } from 'lucide-react';
import Input from './Input';
import { parseCurrency } from '../../utils/currency';

interface CurrencyInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  placeholder?: string;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      label,
      value,
      onChange,
      error,
      helperText,
      disabled,
      required,
      min = 0,
      placeholder = '0',
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (!isFocused) {
        if (value === 0 && displayValue === '') {
          return;
        }
        setDisplayValue(value.toFixed(2).replace('.', ','));
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      inputValue = inputValue.replace(/[^\d.,]/g, '');

      const commaCount = (inputValue.match(/,/g) || []).length;
      const dotCount = (inputValue.match(/\./g) || []).length;

      if (commaCount + dotCount > 1) {
        let foundSeparator = false;
        inputValue = inputValue
          .split('')
          .filter((char) => {
            if (char === ',' || char === '.') {
              if (foundSeparator) return false;
              foundSeparator = true;
            }
            return true;
          })
          .join('');
      }

      const parts = inputValue.split(/[.,]/);
      if (parts.length > 1 && parts[1].length > 2) {
        parts[1] = parts[1].slice(0, 2);
        inputValue = parts.join(',');
      }

      setDisplayValue(inputValue);

      const numericValue = parseCurrency(inputValue);
      if (numericValue >= min) {
        onChange(numericValue);
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (displayValue && displayValue !== '') {
        const numericValue = parseCurrency(displayValue);
        setDisplayValue(numericValue.toFixed(2).replace('.', ','));
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        label={label}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        error={error}
        helperText={helperText || 'Можно использовать запятую или точку'}
        leftIcon={
          <div className="flex items-center justify-center w-5 h-5 text-gray-400 dark:text-gray-500">
            <span className="text-sm font-medium">₽</span>
          </div>
        }
        disabled={disabled}
        required={required}
        placeholder={placeholder}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
