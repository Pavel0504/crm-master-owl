import { forwardRef, useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
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
      placeholder = '0,00',
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState<string>('');

    // Синхронизируем отображаемое значение с prop value
    useEffect(() => {
      if (value === 0 && displayValue === '') {
        return; // Не заполняем поле если оно пустое и value = 0
      }
      setDisplayValue(value.toFixed(2).replace('.', ','));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      // Разрешаем только цифры, точку и запятую
      inputValue = inputValue.replace(/[^\d.,]/g, '');

      // Заменяем множественные разделители
      const commaCount = (inputValue.match(/,/g) || []).length;
      const dotCount = (inputValue.match(/\./g) || []).length;

      if (commaCount + dotCount > 1) {
        // Оставляем только первый разделитель
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

      // Ограничиваем до 2 знаков после запятой/точки
      const parts = inputValue.split(/[.,]/);
      if (parts.length > 1 && parts[1].length > 2) {
        parts[1] = parts[1].slice(0, 2);
        inputValue = parts.join(',');
      }

      setDisplayValue(inputValue);

      // Парсим и отправляем числовое значение
      const numericValue = parseCurrency(inputValue);
      if (numericValue >= min) {
        onChange(numericValue);
      }
    };

    const handleBlur = () => {
      // При потере фокуса форматируем значение
      if (displayValue) {
        const numericValue = parseCurrency(displayValue);
        setDisplayValue(numericValue.toFixed(2).replace('.', ','));
      }
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
        error={error}
        helperText={helperText || 'Можно использовать запятую или точку'}
        leftIcon={<DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500" />}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
