/**
 * Text Field Component
 * Renders a text input field with validation
 */

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Controller, Control} from 'react-hook-form';
import TextInput from '../TextInput';
import {FormField} from '../../types/form';
import {getFieldLabel} from '../../utils/formUtils';
import {validateField} from '../../utils/validation';

interface TextFieldProps {
  field: FormField;
  control: Control<any>;
  defaultValue?: string;
}

const TextField: React.FC<TextFieldProps> = ({field, control, defaultValue = ''}) => {
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
      render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
        <View style={styles.container}>
          <TextInput
            label={getFieldLabel(field)}
            value={value || ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={field.placeholder}
            errorMessage={error?.message}
            editable={!field.disabled && !field.readonly}
            multiline={field.config?.multiline}
            numberOfLines={field.config?.numberOfLines}
            maxLength={field.config?.maxLength}
            keyboardType={
              field.type === 'NUMBER'
                ? 'numeric'
                : field.type === 'EMAIL'
                ? 'email-address'
                : field.type === 'PHONE'
                ? 'phone-pad'
                : 'default'
            }
            autoCapitalize={field.type === 'EMAIL' ? 'none' : 'sentences'}
            autoCorrect={field.type !== 'EMAIL'}
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});

export default TextField;
