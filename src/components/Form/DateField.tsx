/**
 * Date Field Component
 * Renders a date picker input
 */

import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import {Text} from 'react-native-paper';
import {Controller, Control} from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import {FormField} from '../../types/form';
import {getFieldLabel} from '../../utils/formUtils';
import {validateField} from '../../utils/validation';
import ErrorLabel from '../ErrorLabel';
import Spacer from '../Spacer';
import {white} from '../../theme/colors';

interface DateFieldProps {
  field: FormField;
  control: Control<any>;
  defaultValue?: Date;
}

const DateField: React.FC<DateFieldProps> = ({field, control, defaultValue}) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return '';
    if (!(date instanceof Date)) return '';

    const format = field.config?.dateFormat || 'short';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: format === 'long' ? 'long' : '2-digit',
      day: '2-digit',
    });
  };

  return (
    <Controller
      control={control}
      name={field.id}
      defaultValue={defaultValue}
      rules={{
        validate: value => {
          if (field.validationRules) {
            const error = validateField(value, field.validationRules);
            return error || undefined;
          }
          return undefined;
        },
      }}
      render={({field: {onChange, value}, fieldState: {error}}) => {
        const dateValue = value instanceof Date ? value : value ? new Date(value) : new Date();

        return (
          <View style={styles.container}>
            <Text variant="bodyMedium" style={styles.label}>
              {getFieldLabel(field)}
            </Text>

            <Spacer gap={8} />

            <TouchableOpacity
              style={[styles.dateButton, error && styles.dateButtonError]}
              onPress={() => !field.disabled && setShowPicker(true)}
              disabled={field.disabled}>
              <Text style={[styles.dateText, !value && styles.placeholder]}>
                {value ? formatDate(dateValue) : field.placeholder || 'Select date...'}
              </Text>
            </TouchableOpacity>

            {error && <ErrorLabel>{error.message}</ErrorLabel>}

            {showPicker && (
              <DateTimePicker
                value={dateValue}
                mode={field.type === 'TIME' ? 'time' : field.type === 'DATETIME' ? 'datetime' : 'date'}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowPicker(Platform.OS === 'ios'); // Keep open on iOS
                  if (event.type === 'set' && selectedDate) {
                    onChange(selectedDate);
                  }
                  if (Platform.OS === 'android') {
                    setShowPicker(false);
                  }
                }}
                minimumDate={field.config?.minDate ? new Date(field.config.minDate) : undefined}
                maximumDate={field.config?.maxDate ? new Date(field.config.maxDate) : undefined}
              />
            )}

            {Platform.OS === 'ios' && showPicker && (
              <View style={styles.iosPickerFooter}>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => setShowPicker(false)}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 16,
    backgroundColor: white,
  },
  dateButtonError: {
    borderColor: '#C62828',
  },
  dateText: {
    fontSize: 16,
  },
  placeholder: {
    color: '#999',
  },
  iosPickerFooter: {
    alignItems: 'flex-end',
    paddingTop: 8,
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  doneButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DateField;
