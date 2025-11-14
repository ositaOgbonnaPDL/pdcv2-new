import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Headline, Paragraph} from 'react-native-paper';
import {useRoute, useNavigation} from '@react-navigation/core';

import {Screen, Spacer} from '../../components';

/**
 * ProjectViewer Screen
 *
 * This screen displays collected data assets (images, audio) for a specific task.
 * The full AssetsViewer component will be migrated in a later phase.
 *
 * For now, this is a placeholder that shows the task ID.
 */
export default function ProjectViewerScreen() {
  const {params} = useRoute();
  const nav = useNavigation();
  const {id} = (params ?? {}) as any;

  return (
    <Screen>
      <View style={styles.container}>
        <Spacer gap={20}>
          <Headline>Project Data Viewer</Headline>
          <Paragraph>Task ID: {id}</Paragraph>
          <Paragraph style={styles.description}>
            The full asset viewer (images, audio playback, etc.) will be
            available in a future update. This feature is part of the Form
            Engine and Media components migration.
          </Paragraph>
        </Spacer>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
