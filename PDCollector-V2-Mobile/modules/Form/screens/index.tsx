import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useMachine} from '@xstate/react';
import {pipe} from 'fp-ts/lib/function';
import {isEmpty} from 'lodash';
import {AnimatePresence, View as MotiView} from 'moti';
import {filter, identity, ifElse, is, reduce, trim} from 'ramda';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Keyboard,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {KeyboardAwareFlatList} from 'react-native-keyboard-aware-scroll-view';
import {
  Button as PaperButton,
  Caption,
  Colors,
  ProgressBar,
  useTheme,
} from 'react-native-paper';
import {sentenceCase} from 'sentence-case';
import {match, when, __} from 'ts-pattern';
import {useTaskManager} from '../../../contexts/TaskManager';
import AssetsViewer from '../../../shared/components/AssetsViewer';
import Button from '../../../shared/components/Button';
import Screen from '../../../shared/components/Screen';
import Spacer from '../../../shared/components/Spacer';
import useSettings, {
  colorSchemeSelector,
} from '../../../shared/stores/settings';
import {Project} from '../../../shared/types/project';
import {latlngToPoint} from '../../../shared/utils';
import Card from '../components/Card';
import machine from '../machine';
import {isFile, isSet} from '../utils';
import FeaturePicker from './Map';

type Params = {
  project: Project;
  collectedGeometry?: any;
  collectedData?: Record<number, unknown>;
};

let maybeTrim = ifElse(is(String), trim, identity);

const dataSavedMsg =
  'Data saved and will be uploaded when there is an internet connection';

const Divider = () => {
  const {surface} = useTheme().colors;

  return (
    <View
      style={{
        width: 5,
        height: 20,
        marginLeft: 20,
        backgroundColor: surface,
      }}
    />
  );
};

function Form() {
  const nav = useNavigation();
  const {createTask} = useTaskManager();
  const showAccuracyAlert = useRef(true);
  const networkState = useRef<NetInfoState>();
  const colorScheme = useSettings(colorSchemeSelector);
  const {primary, background, primaryDark} = useTheme().colors;

  const color = colorScheme === 'dark' ? 'white' : primaryDark;

  const {project, collectedGeometry} = useRoute().params as Params;

  const {
    id,
    name,
    fields,
    client,
    feature,
    geofence,
    accuracyLevel,
  } = project as Project;

  const TYPE = useRef<string>();
  const [taskId, setTaskId] = useState<string>();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showFeaturePicker, setShowFeaturePicker] = useState(false);

  if (!TYPE.current) TYPE.current = sentenceCase(feature);

  const {height} = useWindowDimensions();

  const [state, send] = useMachine(machine, {
    context: {
      fields,
      feature,
      geofence,
      values: {},
      doneMarker: [],
      errors: new Map(),
      skippedFields: [],
      coordinates: collectedGeometry?.coordinates ?? [],
    },
    actions: {
      notifyFeatureError() {
        Alert.alert(
          `${feature} Feature`,
          `You need to capture a ${feature}`,
          [
            {
              text: 'Capture',
              style: 'default',
              onPress: () => {
                setShowFeaturePicker(true);
              },
            },
          ],
          {cancelable: true},
        );
      },
      resolveErrorsNotif() {
        Alert.alert('Error', 'Resolve erros to continue');
      },

      async submit({mocked, values, coordinates}) {
        const data = {} as any;
        const assets = {} as any;

        for (const key in values) {
          if (Object.prototype.hasOwnProperty.call(values, key)) {
            const value = values[key as any];

            if (isFile(value)) {
              assets[key] = value;
            } else {
              data[key] = maybeTrim(value);
            }
          }
        }

        const task = {
          data,
          assets,
          client,
          projectId: id,
          isMocked: mocked,
          collectedOn: new Date(),
          geometry: {
            type: TYPE.current as string,
            coordinates:
              feature === 'POINT'
                ? latlngToPoint(coordinates[0])
                : [coordinates.map(latlngToPoint)],
          },
        };

        const taskId = createTask(task as any);

        if (networkState.current?.isConnected) {
          setTaskId(taskId);
        } else {
          Alert.alert(name, dataSavedMsg, [
            {text: 'OK', onPress: () => nav.goBack()},
          ]);
        }
      },
    },
  });

  const {values, errors, skippedFields} = state.context;

  const filteredFields = useMemo(
    () => fields.filter((f) => !skippedFields.includes(f.id)),
    [fields, skippedFields],
  );

  const onSubmit = useCallback(() => send('SUBMIT'), [send]);

  const totalFilled = useMemo(() => {
    return pipe(
      Object.values(values),
      filter((val) => !isEmpty(val)),
      reduce((acc, curr) => {
        const value = acc + 1;

        return match(curr)
          .with(when(isSet), (val) => (val.size > 0 ? value : acc))
          .with(when(isFile), (val) => (val.uri ? value : acc))
          .with(__.nullish, () => acc)
          .with(__, () => value)
          .exhaustive();
      }, 0),
    );
  }, [values]);

  useEffect(() => {
    const off = NetInfo.addEventListener((info) => {
      networkState.current = info;
    });

    return () => {
      off();
    };
  }, []);

  // Hide the keyboard to prevent if from overlaying
  // on top of the map (feature picker)
  useLayoutEffect(() => {
    if (showFeaturePicker) Keyboard.dismiss();
  }, [showFeaturePicker]);

  // Listen for keyborad changes to hide/show the action
  // buttons at the button to create more screen space
  useLayoutEffect(() => {
    const subscriptionShow = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });

    const subscriptionHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      subscriptionShow.remove();
      subscriptionHide.remove();
    };
  }, []);

  // Alert the user when leaving the page without submitting
  // the form about loss of data collected
  useLayoutEffect(() => {
    const onRemove = (e: any) => {
      e.preventDefault();

      if (totalFilled > 0 && !state.matches('submitted') && !taskId) {
        Alert.alert(
          'Collected data will be lost, do you wish to continue',
          undefined,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Continue',
              style: 'destructive',
              onPress: () => {
                nav.dispatch(e.data.action);
              },
            },
          ],
          {cancelable: true},
        );

        return;
      }

      nav.dispatch(e.data.action);
    };

    nav.addListener('beforeRemove', onRemove);

    return () => {
      nav.removeListener('beforeRemove', onRemove);
    };
  }, [nav, state, totalFilled]);

  useLayoutEffect(() => {
    if (taskId) {
      nav.setOptions({headerShown: false});
    } else if (showFeaturePicker) {
      nav.setOptions({headerShown: false});
    } else {
      nav.setOptions({headerShown: true});
    }
  }, [nav, taskId, showFeaturePicker]);

  return (
    <>
      <Screen style={{padding: 0}}>
        <KeyboardAwareFlatList
          data={filteredFields}
          // We don't render any field initial for performance
          // reasons, given for large forms the form screen takes a while
          // before opening. So to not make the user feel the app isn't responding
          // we delay rendering until they screen is open.
          initialNumToRender={0}
          // To prevent the weird behaviour where the keyboard gets dismissed
          // immediately after opening for inputs at the end of the list
          removeClippedSubviews={false}
          ItemSeparatorComponent={Divider}
          keyExtractor={({id}) => String(id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{padding: 20}}
          renderItem={({item: data, index}) => {
            const {id} = data;
            const value = values[id];
            const isLast = index === filteredFields.length;

            return (
              <View
                style={[
                  styles.container,
                  {shadowColor: primary, backgroundColor: primary},
                ]}>
                <Card
                  {...{data, value, isLast, onSubmit}}
                  onChange={(value) => {
                    send({type: 'CHANGE', id, value});
                  }}
                />

                {errors.has(id) && (
                  <Caption style={styles.error}>{errors.get(id)}</Caption>
                )}
              </View>
            );
          }}
        />

        {!keyboardVisible && (
          <View>
            <ProgressBar
              indeterminate={state.matches('validate')}
              progress={totalFilled / (fields.length - skippedFields.length)}
            />

            <View style={styles.footer}>
              <Spacer horizontal>
                <PaperButton onPress={() => setShowFeaturePicker(true)}>
                  {`Capture ${feature}`}
                </PaperButton>

                <Button
                  color={color}
                  onPress={onSubmit}
                  style={styles.actionButton}
                  loading={state.matches('validate')}>
                  Submit
                </Button>
              </Spacer>
            </View>
          </View>
        )}

        {taskId && (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              styles.elevate,
              {backgroundColor: background},
            ]}>
            <AssetsViewer id={taskId} onClose={() => nav.goBack()} />
          </View>
        )}
      </Screen>

      <AnimatePresence>
        {showFeaturePicker && (
          <MotiView
            animate={{translateY: 0}}
            from={{translateY: height}}
            exit={{translateY: height}}
            transition={{type: 'timing'}}
            style={[StyleSheet.absoluteFillObject, styles.elevate]}>
            <FeaturePicker
              feature={feature}
              geofence={geofence}
              distanceFilter={accuracyLevel}
              showAccuracyLevelAlert={Boolean(
                showAccuracyAlert.current &&
                  accuracyLevel &&
                  state.context.coordinates.length <= 0,
              )}
              onDismiss={(coords) => {
                setShowFeaturePicker(false);

                if (showAccuracyAlert.current) {
                  showAccuracyAlert.current = false;
                }

                if (coords) {
                  const {mocked, coordinates} = coords;
                  send({type: 'SET_COORDS', mocked, coords: coordinates});
                }
              }}
            />
          </MotiView>
        )}
      </AnimatePresence>
    </>
  );
}

const styles = StyleSheet.create({
  error: {
    marginTop: 7,
    color: Colors.amber500,
  },
  footer: {
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  // work around for zIndex
  // check https://github.com/facebook/react-native/issues/8968
  // https://github.com/facebook/react-native/issues/8968#issuecomment-316223266
  elevate: {
    ...Platform.select({
      ios: {zIndex: 100},
      android: {elevation: 100},
    }),
  },
  container: {
    width: '100%',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 18,
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowRadius: 15,
        shadowOpacity: 0.6,
        shadowOffset: {width: 0, height: 15},
      },
    }),
  },
});

export default Form;
