/**
 * Switch Component
 * Themed switch wrapper
 */

import React, {ComponentProps} from 'react';
import {Switch as PaperSwitch} from 'react-native-paper';
import {primary} from '../../../theme';

type SwitchProps = ComponentProps<typeof PaperSwitch>;

export default function Switch(props: SwitchProps) {
  return <PaperSwitch {...props} />;
}
