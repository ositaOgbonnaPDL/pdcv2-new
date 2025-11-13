/**
 * ProjectViewer Screen
 * Views collected data with media assets
 * Simplified version - full implementation in Phase 19
 */

import React from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Button, MD3Colors} from 'react-native-paper';

import {Screen, Spacer} from '../../components';

export default function ProjectViewerScreen() {
  const {params} = useRoute();
  const nav = useNavigation<any>();
  const {id} = (params ?? {}) as any;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Spacer gap={20}>
          <Text variant="headlineMedium">Collected Data Viewer</Text>

          <Text variant="bodyLarge" style={{color: MD3Colors.neutral60}}>
            This screen will display collected data with images, audio, and
            other media once the Assets Viewer is implemented in Phase 19.
          </Text>

          <Text variant="bodyMedium" style={{color: MD3Colors.neutral50}}>
            Data ID: {id || 'N/A'}
          </Text>

          <Button mode="contained" onPress={() => nav.goBack()}>
            Go Back
          </Button>
        </Spacer>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
});
