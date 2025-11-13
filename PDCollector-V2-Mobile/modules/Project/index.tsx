/* eslint-disable react-native/no-inline-styles */
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/core';
import {useMachine} from '@xstate/react';
import {filter} from 'fp-ts/lib/Array';
import {pipe} from 'fp-ts/lib/function';
import {AnimatePresence, MotiView} from 'moti';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  AlertButton,
  FlatList,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Colors,
  FAB,
  Snackbar,
  Subheading,
  Switch,
  Text,
  useTheme,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {displayName} from '../../app.json';
import Plus from '../../assets/svg/sf/plus.svg';
import Tracking from '../../assets/svg/sf/tracking.svg';
import {useTaskManager} from '../../contexts/TaskManager';
import {TaskRef} from '../../contexts/TaskManager/types';
import {useTracker, ValuesType} from '../../contexts/TrackManager';
import {primaryDark} from '../../shared/colors';
import Box from '../../shared/components/Box';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/DataCard';
import Screen from '../../shared/components/Screen';
import Spacer from '../../shared/components/Spacer';
import useSettings, {colorSchemeSelector} from '../../shared/stores/settings';
import {radius} from '../../shared/theme';
import {Project as ProjectType} from '../../shared/types/project';
import {
  createFieldsMap,
  DISCLOSURE,
  getAsyncItem,
  mapToArray,
  setAsyncItem,
} from '../../shared/utils';
import {sortByDate} from '../../shared/utils/task';
import machine, {TStates} from './machine';

const trackingOffMsg =
  'Tracking is turned on for another project and will be switched to this project';

const trackingRequired =
  'Tracking is required to collect data for this project';

const cancelBtn: AlertButton = {text: 'Cancel', style: 'cancel'};

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
  icon: {
    backgroundColor: primaryDark,
  },
  lightCard: {
    backgroundColor: 'white',
    borderColor: Colors.grey300,
  },
  darkCard: {
    backgroundColor: '#150E44',
    borderColor: Colors.grey600,
  },
  header: {
    marginStart: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  disclosure: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  disclosureWrapper: {
    padding: 30,
    maxWidth: '80%',
    borderRadius: radius,
    backgroundColor: Colors.white,
  },
});

export default function Project() {
  const nav = useNavigation();
  const {params = {}} = useRoute();
  const {surface, primary, text} = useTheme().colors;
  const colorScheme = useSettings(colorSchemeSelector);

  const [disclosed, setDisclosed] = useState(true);

  const [showDisclosure, setShowDisclosure] = useState(false);

  const {error, clearError, setTracking, ...tracking} = useTracker();

  const project = (params as any).project as ProjectType;

  const {id, fields, trackingStatus} = project;

  const isDark = colorScheme === 'dark';

  const {tasks, spawnedTasks} = useTaskManager();

  const sortedTasks = useMemo(() => {
    return pipe(
      tasks,
      mapToArray,
      sortByDate,
      filter((t) => t.projectId === id),
    );
  }, [tasks.size, id]);

  const tasksWithGeometry = useMemo(() => {
    return sortedTasks.filter((t) => !!t.geometry);
  }, [sortedTasks]);

  const mappedFields = useMemo(() => createFieldsMap(fields), [fields]);

  const lastTracking = useRef<ValuesType>(tracking);

  const [current, send] = useMachine(machine, {
    context: {project, tracking},
    actions: {
      off: () => setTracking({enable: false}),

      on: () => {
        setTracking({enable: true, project});
      },
    },
    services: {
      notifySwitching: () => (send) => {
        Alert.alert('Tracking', trackingOffMsg, [
          {text: 'Cancel', onPress: () => send('DISABLE')},
          {
            text: 'Continue',
            style: 'destructive',
            onPress: () => send('CONTINUE'),
          },
        ]);
      },
    },
  });

  const enabled = current.matches(TStates.On);

  const isMapButtonDisabled =
    !tasksWithGeometry || tasksWithGeometry.length <= 0;

  const fabColor = isDark ? primary : 'white';

  const fabStyle = {backgroundColor: isDark ? 'white' : primary};

  useEffect(() => {
    lastTracking.current = tracking;
  }, [tracking]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  useEffect(() => {
    nav.setOptions({headerShown: !showDisclosure});

    if (showDisclosure) {
      setDisclosed(true);
      setAsyncItem(DISCLOSURE, true);
    }
  }, [showDisclosure]);

  useEffect(() => {
    getAsyncItem<string>(DISCLOSURE).then((n) => {
      if (!n) setDisclosed(false);
    });
  }, []);

  useEffect(() => {
    send({tracking, type: 'SET'});
  }, [tracking.enabled, tracking.project?.id]);

  // Disable tracking UI indication if tracking was stopped
  // by an error encountered by the `TrackManager`
  useEffect(() => {
    if (!lastTracking.current.enabled || !tracking.enabled) {
      send('OFF');
    }
  }, [tracking.enabled, lastTracking]);

  // Set the initial state to `on` if tracking is on for
  // this project when this screen gets opened. Would have used a factory function
  // instead of watching for changes and updating the machine, but due to
  // how screens are rendered and destroyed on mobile, this screen would
  // still be rendered if navigated from to the next screen. Which means our
  // machine will be out of sync with the `TrackManager` state when the user
  // returns to this screen.
  useFocusEffect(
    useCallback(() => {
      if (tracking.enabled && tracking.project?.id === id) {
        send('ON');
      }
    }, [tracking.enabled, tracking.project?.id, id]),
  );

  useFocusEffect(
    useCallback(() => {
      const tracking = lastTracking.current;

      if (trackingStatus === 'required' && tracking?.project?.id !== id) {
        Alert.alert(
          'Tracking',
          trackingRequired,
          [cancelBtn, {text: 'Enable', onPress: () => send('ENABLE')}],
          {cancelable: true},
        );
      }
    }, [nav, send, id, trackingStatus, lastTracking]),
  );

  return (
    <>
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
                      screen: 'Main',
                      params: {
                        project,
                        index: 0,
                        fields: mappedFields,
                        tasks: tasksWithGeometry,
                      },
                    });
                  }}>
                  View on map
                </Button>

                {trackingStatus && trackingStatus !== 'disabled' && (
                  <Box flexDirection="row" alignItems="center">
                    <Spacer horizontal>
                      <Subheading style={{fontWeight: '700'}}>
                        Tracking
                      </Subheading>
                      <Switch
                        value={enabled}
                        trackColor={{true: primary, false: Colors.grey500}}
                        onValueChange={(val) => {
                          disclosed
                            ? send(val ? 'ENABLE' : 'DISABLE')
                            : setShowDisclosure(true);
                        }}
                      />
                    </Spacer>
                  </Box>
                )}
              </Spacer>
            </View>
          </Spacer>
        </View>

        <FlatList
          data={sortedTasks}
          keyExtractor={({id}) => id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{padding: 20}}
          ItemSeparatorComponent={() => <View style={{height: 20}} />}
          renderItem={({item}) => {
            const actor = spawnedTasks.get(item.id);

            return (
              <TouchableOpacity
                disabled={item.assets.size <= 0}
                onPress={() => nav.navigate('ProjectViewer', {id: item.id})}>
                <Card
                  fields={mappedFields}
                  actor={actor as TaskRef}
                  style={[
                    styles.card,
                    isDark ? styles.darkCard : styles.lightCard,
                  ]}
                />
              </TouchableOpacity>
            );
          }}
        />

        <View style={styles.fabs}>
          {trackingStatus && (
            <AnimatePresence>
              {trackingStatus !== 'disabled' && (
                <MotiView
                  exit={{opacity: 0, scale: 0}}
                  from={{opacity: 0, scale: 0}}
                  animate={{opacity: 1, scale: 1}}>
                  <FAB
                    small
                    animated={false}
                    color={fabColor}
                    style={[fabStyle, {marginBottom: 10}]}
                    onPress={() =>
                      nav.navigate('Tracker', {project: project.id})
                    }
                    icon={({color, size}) => (
                      <Tracking width={size} height={size} color={color} />
                    )}
                  />
                </MotiView>
              )}
            </AnimatePresence>
          )}

          {/* Avoid disabling the button to provide the user with meaningful
          feedback as to why they can't go any further if tracking is not
          enable for this project, if it is required */}
          <FAB
            color={fabColor}
            style={fabStyle}
            animated={false}
            icon={({color}) => <Plus width={20} height={20} color={color} />}
            onPress={() => {
              if (trackingStatus === 'required' && !enabled) {
                Alert.alert(
                  'Tracking',
                  trackingRequired,
                  [
                    cancelBtn,
                    {
                      text: 'Enable',
                      onPress: () => {
                        disclosed ? send('ENABLE') : setShowDisclosure(true);
                      },
                    },
                  ],
                  {cancelable: true},
                );
              } else {
                nav.navigate('Form', {project});
              }
            }}
          />
        </View>

        <Snackbar
          visible={!!error}
          onDismiss={() => clearError()}
          duration={
            error?.type === 'denied'
              ? Snackbar.DURATION_MEDIUM
              : Snackbar.DURATION_SHORT
          }
          action={
            error?.type === 'denied'
              ? {
                  label: 'Go to settings',
                  onPress: () => {
                    clearError();
                    Linking.openSettings();
                  },
                }
              : undefined
          }>
          <Text style={{color: Colors.white}}>{error?.message}</Text>
        </Snackbar>
      </Screen>

      <AnimatePresence>
        {showDisclosure && (
          <MotiView
            style={styles.disclosure}
            exit={{opacity: 0}}
            from={{opacity: 0.4}}
            animate={{opacity: 1}}>
            <SafeAreaView
              style={[styles.disclosureWrapper, {backgroundColor: primary}]}>
              <Spacer gap={50}>
                <Subheading style={{color: Colors.white}}>
                  {displayName} collects location data to enable the tracking
                  feature for projects even when the app is closed or not in
                  use.
                </Subheading>

                <View>
                  <Spacer gap={30}>
                    <Button
                      color={Colors.white}
                      onPress={() => {
                        setShowDisclosure(false);
                        send('ENABLE');
                      }}>
                      Allow
                    </Button>

                    <Button
                      mode="text"
                      color={Colors.white}
                      onPress={() => setShowDisclosure(false)}>
                      Cancel
                    </Button>
                  </Spacer>
                </View>
              </Spacer>
            </SafeAreaView>
          </MotiView>
        )}
      </AnimatePresence>
    </>
  );
}
