/**
 * Checkbox Field Component
 * Renders a checkbox with label
 */

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Checkbox, Text} from 'react-native-paper';
import {Controller, Control} from 'react-hook-form';
import {FormField} from '../../types/form';
import {getFieldLabel} from '../../utils/formUtils';
import {validateField} from '../../utils/validation';
import ErrorLabel from '../ErrorLabel';

interface CheckboxFieldProps {
  field: FormField;
  control: Control<any>;
  defaultValue?: boolean;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({field, control, defaultValue = false}) => {
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
      render={({field: {onChange, value}, fieldState: {error}}) => (
        <View style={styles.container}>
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={value ? 'checked' : 'unchecked'}
              onPress={() => onChange(!value)}
              disabled={field.disabled || field.readonly}
            />
            <Text
              variant="bodyMedium"
              style={styles.label}
              onPress={() => !field.disabled && !field.readonly && onChange(!value)}>
              {field.label}
            </Text>
          </View>

          {field.helpText && (
            <Text variant="bodySmall" style={styles.helpText}>
              {field.helpText}
            </Text>
          )}

          {error && <ErrorLabel>{error.message}</ErrorLabel>}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    flex: 1,
    marginLeft: 8,
  },
  helpText: {
    marginLeft: 40,
    marginTop: 4,
    color: '#666',
  },
});

export default CheckboxField;
