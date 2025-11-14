/**
 * Project Screen
 * Displays project details and collected data
 * Simplified version without tracking managers (Phase 8/13 dependencies)
 */

import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useLayoutEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {FAB, MD3Colors, Text, useTheme} from 'react-native-paper';
import {MotiView, AnimatePresence} from 'moti';

import {Box, Button, Screen, Spacer} from '../../components';
import useSettingsStore, {
  colorSchemeSelector,
} from '../../stores/settingsStore';
import {radius, primary, primaryDark} from '../../theme';
import {Project as ProjectType} from '../../types/project';

const styles = StyleSheet.create({
  card: {
    padding: 15,
    elevation: 4,
    borderWidth: 1,
    borderRadius: 10,
    shadowRadius: 10,
    shadowOpacity: 0.2,
    shadowColor: 'grey',
    shadowOffset: {width: 5, height: 7},
  },
  fabs: {
    right: 10,
    bottom: 20,
    position: 'absolute',
    alignItems: 'center',
  },
  mapBtn: {
    borderRadius: 100,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  lightCard: {
    backgroundColor: 'white',
    borderColor: MD3Colors.neutral30,
  },
  darkCard: {
    backgroundColor: '#150E44',
    borderColor: MD3Colors.neutral60,
  },
  header: {
    marginStart: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default function ProjectScreen() {
  const nav = useNavigation<any>();
  const {params = {}} = useRoute();
  const {colors} = useTheme();
  const colorScheme = useSettingsStore(colorSchemeSelector);

  const project = (params as any).project as ProjectType;

  const {id, name, description, trackingStatus} = project;

  const isDark = colorScheme === 'dark';

  // Placeholder for collected data - will be connected to TaskManager in Phase 13
  const [collectedData] = useState<any[]>([]);

  const isMapButtonDisabled = collectedData.length === 0;

  const fabColor = isDark ? primary : 'white';
  const fabStyle = {backgroundColor: isDark ? 'white' : primary};

  useLayoutEffect(() => {
    nav.setOptions({
      title: name,
    });
  }, [nav, name]);

  return (
    <Screen style={{padding: 0}}>
      <View style={{padding: 10}}>
        <Spacer>
          <View style={styles.header}>
            <Spacer horizontal>
              <Button
                style={styles.mapBtn}
                disabled={isMapButtonDisabled}
                onPress={() => {
                  nav.navigate('Map', {
                    projectId: id,
                  });
                }}>
                View on map
              </Button>

              {trackingStatus && trackingStatus !== 'disabled' && (
                <Box flexDirection="row" alignItems="center">
                  <Text
                    variant="bodyLarge"
                    style={{
                      fontWeight: '700',
                      color: MD3Colors.neutral50,
                    }}>
                    Tracking: Not available yet
                  </Text>
                </Box>
              )}
            </Spacer>
          </View>
        </Spacer>
      </View>

      {collectedData.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}>
          <Spacer gap={20}>
            <Text
              variant="headlineMedium"
              style={{color: MD3Colors.neutral50, textAlign: 'center'}}>
              No data collected yet
            </Text>
            <Text
              variant="bodyLarge"
              style={{color: MD3Colors.neutral60, textAlign: 'center'}}>
              Tap the + button below to start collecting data for this project
            </Text>
          </Spacer>
        </View>
      ) : (
        <FlatList
          data={collectedData}
          keyExtractor={(item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{padding: 20}}
          ItemSeparatorComponent={() => <View style={{height: 20}} />}
          renderItem={({item}) => {
            return (
              <TouchableOpacity
                onPress={() =>
                  nav.navigate('ProjectViewer', {id: item.id})
                }>
                <View
                  style={[
                    styles.card,
                    isDark ? styles.darkCard : styles.lightCard,
                  ]}>
                  <Text variant="titleMedium">Collected Data Item</Text>
                  <Text variant="bodyMedium" style={{color: MD3Colors.neutral60}}>
                    Data preview will be shown here
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View style={styles.fabs}>
        {trackingStatus && trackingStatus !== 'disabled' && (
          <AnimatePresence>
            <MotiView
              exit={{opacity: 0, scale: 0}}
              from={{opacity: 0, scale: 0}}
              animate={{opacity: 1, scale: 1}}>
              <FAB
                size="small"
                color={fabColor}
                style={[fabStyle, {marginBottom: 10}]}
                onPress={() =>
                  Alert.alert(
                    'Tracker',
                    'Background tracking will be available in a later phase (Phase 9)',
                    [{text: 'OK'}],
                  )
                }
                icon="map-marker-path"
              />
            </MotiView>
          </AnimatePresence>
        )}

        <FAB
          color={fabColor}
          style={fabStyle}
          icon="plus"
          onPress={() => {
            if (trackingStatus === 'required') {
              Alert.alert(
                'Tracking Required',
                'This project requires tracking to be enabled. Background tracking will be available in a later phase.',
                [
                  {text: 'Cancel', style: 'cancel'},
                  {
                    text: 'Continue Anyway',
                    onPress: () => nav.navigate('Form', {project}),
                  },
                ],
              );
            } else {
              nav.navigate('Form', {project});
            }
          }}
        />
      </View>
    </Screen>
  );
}
