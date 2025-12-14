import React from 'react';
import { Platform, View } from 'react-native';

interface WebDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  mode?: 'date' | 'time';
  display?: string;
}

export default function WebDatePicker({
  value,
  onChange,
  minimumDate,
  mode = 'date',
}: WebDatePickerProps) {
  if (Platform.OS !== 'web') {
    return null;
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTimeForInput = (date: Date) => {
    return date.toTimeString().slice(0, 5);
  };

  const handleDateChange = (e: any) => {
    if (e.target.value) {
      const newDate = new Date(e.target.value);
      if (!isNaN(newDate.getTime())) {
        onChange(newDate);
      }
    }
  };

  const handleTimeChange = (e: any) => {
    if (e.target.value) {
      const [hours, minutes] = e.target.value.split(':');
      const newDate = new Date(value);
      newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      onChange(newDate);
    }
  };

  // Use React.createElement to create a web input element
  if (mode === 'date') {
    return React.createElement('input', {
      type: 'date',
      value: formatDateForInput(value),
      min: minimumDate ? formatDateForInput(minimumDate) : undefined,
      onChange: handleDateChange,
      style: {
        flex: 1,
        border: 'none',
        outline: 'none',
        fontSize: 16,
        padding: 0,
        fontFamily: 'inherit',
        background: 'transparent',
        width: '100%',
      },
    } as any);
  }

  return React.createElement('input', {
    type: 'time',
    value: formatTimeForInput(value),
    onChange: handleTimeChange,
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      fontSize: 16,
      padding: 0,
      fontFamily: 'inherit',
      background: 'transparent',
      width: '100%',
    },
  } as any);
}
