import {Picker} from '@react-native-picker/picker';
import {map, prop} from 'ramda';
import React, {useCallback, useMemo} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Caption, Colors, Text} from 'react-native-paper';
import {Checkbox, RadioButton, RadioGroup} from 'react-native-ui-lib';
import {match} from 'ts-pattern';
import {primary, primaryDark} from '../../../shared/colors';
import {Field} from '../../../shared/types/project';
import DatePicker from './DatePicker';
import ImageView from './ImageView';
import AudioRecorder from './Recorder';
import TextField from './TextField';

type Card = {
  value: any;
  data: Field;
  isLast: boolean;
  onChange(value: any): void;
};

const toString = map<Field['options'][0], string>(prop('value'));

const checkRadioProps = {
  color: Colors.white,
  labelStyle: {flex: 1, color: Colors.white},
};

const Seperator = () => <View style={styles.seperator} />;

const Card = ({data, value, isLast, onChange: change}: Card) => {
  const {name, option, imageSource, options, inputType} = data;

  const mOptions = useMemo(() => toString(options), [options]);

  const onChange = useCallback(change, [change]);

  return (
    <>
      <Caption style={styles.label}>
        {option === 'required' ? (
          <>
            {name}
            {'  '}
            <Text style={styles.requiredLabel}>(required)</Text>
          </>
        ) : (
          name
        )}
      </Caption>

      <View style={{marginTop: 7}}>
        {match(inputType)
          .with('date', () => <DatePicker {...{value, onChange}} />)
          .with('image', () => (
            <ImageView {...{value, onChange, source: imageSource}} />
          ))
          .with('text', 'email', 'number', 'password', (type) => {
            return (
              <TextField
                inputType={type}
                onChangeText={onChange}
                value={value?.toString() ?? ''}
                returnKeyType={isLast ? 'go' : 'default'}
                returnKeyLabel={isLast ? 'submit' : undefined}
              />
            );
          })
          .with('checkbox', () => (
            <FlatList
              data={mOptions}
              keyExtractor={(item) => item}
              ItemSeparatorComponent={Seperator}
              renderItem={({item}) => {
                return (
                  <Checkbox
                    {...checkRadioProps}
                    label={item}
                    iconColor={primaryDark}
                    value={value?.has?.(item)}
                    onValueChange={() => {
                      const values = new Set(value);
                      values.has(item) ? values.delete(item) : values.add(item);
                      onChange(values);
                    }}
                  />
                );
              }}
            />
          ))
          .with('radio', () => (
            <RadioGroup initialValue={value} onValueChange={onChange}>
              <FlatList
                data={mOptions}
                keyExtractor={(item) => item}
                ItemSeparatorComponent={Seperator}
                renderItem={({item}) => (
                  <RadioButton
                    {...checkRadioProps}
                    labelStyle={{flex: 1, color: Colors.white}}
                    value={item}
                    label={item}
                  />
                )}
              />
            </RadioGroup>
          ))
          .with('dropdown', 'select', () => (
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              dropdownIconColor={Colors.white}>
              <Picker.Item
                value={null}
                color={Colors.white}
                label="Select a value"
              />

              {mOptions.map((opt) => (
                <Picker.Item
                  {...{key: opt, label: opt, value: opt}}
                  color={Colors.black}
                />
              ))}
            </Picker>
          ))
          .with('audio', () => (
            <AudioRecorder
              {...{name, onChange}}
              duration={5000}
              uri={value?.uri}
            />
          ))
          .exhaustive()}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 3,
    borderRadius: 20,
    paddingVertical: 20,
    shadowColor: primary,
    paddingHorizontal: 25,
    backgroundColor: primary,
    shadowOffset: {width: 0, height: 15},
  },
  label: {
    fontSize: 14,
    color: 'white',
    textTransform: 'uppercase',
  },
  seperator: {
    height: 6,
  },
  requiredLabel: {
    fontStyle: 'italic',
    color: Colors.grey300,
    textTransform: 'lowercase',
  },
});

export default Card;
