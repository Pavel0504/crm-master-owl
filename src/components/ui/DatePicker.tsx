import { forwardRef } from 'react';
import { Calendar } from 'lucide-react';
import Input from './Input';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      label,
      value,
      onChange,
      error,
      helperText,
      min,
      max,
      disabled,
      required,
    },
    ref
  ) => {
    return (
      <Input
        ref={ref}
        type="date"
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        helperText={helperText}
        leftIcon={<Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
      />
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
