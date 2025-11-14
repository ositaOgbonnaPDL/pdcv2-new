import React, {ComponentProps} from 'react';
import {Switch as PaperSwitch, useTheme} from 'react-native-paper';

type SwitchProps = ComponentProps<typeof PaperSwitch>;

export default function SettingsSwitch(props: SwitchProps) {
  const {colors} = useTheme();

  return (
    <PaperSwitch
      {...props}
      color={colors.primary}
    />
  );
}
