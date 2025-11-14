/**
 * Select Field Component
 * Renders a picker/select input with options
 */

import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Modal, FlatList} from 'react-native';
import {Text} from 'react-native-paper';
import {Controller, Control} from 'react-hook-form';
import {FormField, FieldOption} from '../../types/form';
import {getFieldLabel} from '../../utils/formUtils';
import {validateField} from '../../utils/validation';
import ErrorLabel from '../ErrorLabel';
import Spacer from '../Spacer';
import {primary, white, primaryDark} from '../../theme/colors';

interface SelectFieldProps {
  field: FormField;
  control: Control<any>;
  defaultValue?: string | number;
}

const SelectField: React.FC<SelectFieldProps> = ({field, control, defaultValue}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const renderOption = (
    option: FieldOption,
    isSelected: boolean,
    onSelect: () => void,
  ) => (
    <TouchableOpacity
      style={[styles.option, isSelected && styles.selectedOption]}
      onPress={onSelect}>
      <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

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
        const selectedOption = field.options?.find(opt => opt.value === value);

        return (
          <View style={styles.container}>
            <Text variant="bodyMedium" style={styles.label}>
              {getFieldLabel(field)}
            </Text>

            <Spacer gap={8} />

            <TouchableOpacity
              style={[styles.selectButton, error && styles.selectButtonError]}
              onPress={() => !field.disabled && setModalVisible(true)}
              disabled={field.disabled}>
              <Text style={[styles.selectText, !selectedOption && styles.placeholder]}>
                {selectedOption ? selectedOption.label : field.placeholder || 'Select...'}
              </Text>
            </TouchableOpacity>

            {error && <ErrorLabel>{error.message}</ErrorLabel>}

            <Modal
              visible={modalVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text variant="titleMedium">{field.label}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <FlatList
                    data={field.options || []}
                    keyExtractor={item => String(item.value)}
                    renderItem={({item}) =>
                      renderOption(item, item.value === value, () => {
                        onChange(item.value);
                        setModalVisible(false);
                      })
                    }
                  />
                </View>
              </View>
            </Modal>
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
  selectButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 16,
    backgroundColor: white,
  },
  selectButtonError: {
    borderColor: '#C62828',
  },
  selectText: {
    fontSize: 16,
  },
  placeholder: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    padding: 4,
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedOption: {
    backgroundColor: primary + '20', // 20% opacity
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    color: primary,
    fontWeight: '600',
  },
});

export default SelectField;
