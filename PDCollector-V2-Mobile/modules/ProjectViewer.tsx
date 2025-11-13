import React from 'react';
import {useNavigation, useRoute} from '@react-navigation/core';
import AssetsViewer from '../shared/components/AssetsViewer';

export default function TaskViewer() {
  const {params} = useRoute();
  const nav = useNavigation();
  const {id} = (params ?? {}) as any;
  return (
    <AssetsViewer
      {...{
        id,
        dismissOnSubmit: false,
        onClose: () => nav.goBack(),
      }}
    />
  );
}
