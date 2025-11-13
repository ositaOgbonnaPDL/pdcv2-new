import React, {ComponentProps} from 'react';
import {Switch as PaperSwitch} from 'react-native-paper';
import {primary} from '../../../shared/colors';

type Switch = ComponentProps<typeof PaperSwitch>;

export default function Switch(props: Switch) {
  return (
    <PaperSwitch
      {...props}
      theme={{mode: 'exact', colors: {accent: primary}}}
    />
  );
}
