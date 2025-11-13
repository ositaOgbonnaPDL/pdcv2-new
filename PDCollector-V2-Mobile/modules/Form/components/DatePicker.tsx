import DateTimePicker from '@react-native-community/datetimepicker';
import {pipe} from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as S from 'fp-ts/string';
import React, {useState} from 'react';
import {Platform} from 'react-native';
import {Button, Colors, Title} from 'react-native-paper';
import Spacer from '../../../shared/components/Spacer';

type DatePicker = {
  onChange(date: Date): void;
  value?: string | Date | null;
};

export default function DatePicker({value, onChange}: DatePicker) {
  const [open, setOpen] = useState(false);

  const _value = pipe(
    value,
    O.some,
    O.toNullable,
    O.fromNullable,
    O.chainNullableK((v) => {
      return S.isString(v) ? (S.isEmpty(v) ? new Date() : new Date(v)) : v;
    }),
    O.getOrElse(() => new Date()),
  );

  return (
    <Spacer>
      {!!value && (
        <Title style={{alignSelf: 'center', color: Colors.white}}>
          {_value.toLocaleDateString()}
        </Title>
      )}

      <Button
        mode="contained"
        uppercase={false}
        color={Colors.white}
        onPress={() => setOpen((t) => !t)}>
        Pick date
      </Button>

      {open && (
        <DateTimePicker
          mode="date"
          value={_value}
          themeVariant="light"
          textColor={Colors.white}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(_: any, date: any) => {
            onChange(date ?? value);
            setOpen(false);
          }}
        />
      )}
    </Spacer>
  );
}
