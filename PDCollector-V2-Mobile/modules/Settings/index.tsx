import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useLayoutEffect} from 'react';
import {
  Alert,
  ColorSchemeName,
  ScrollView,
  StyleProp,
  StyleSheet,
  TouchableNativeFeedback,
  View,
  ViewStyle,
} from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import BgGeolocation from 'react-native-background-geolocation-android';
import {
  ActivityIndicator,
  Button,
  Caption,
  Colors,
  IconButton,
  Paragraph,
  Subheading,
  Text,
  Title,
  useTheme,
} from 'react-native-paper';
import {Checkbox} from 'react-native-ui-lib';
import {useQuery, useQueryClient} from 'react-query';
import {useTracker} from '../../contexts/TrackManager';
import {primary, primaryDark} from '../../shared/colors';
import Box from '../../shared/components/Box';
import Screen from '../../shared/components/Screen';
import Spacer from '../../shared/components/Spacer';
import {ASSIGNED, PROJECTS, TRACKS} from '../../shared/query';
import authStore from '../../shared/stores/auth';
import useSettings, {
  colorSchemeSelector,
  ImageQuality,
  Themes,
} from '../../shared/stores/settings';
import {radius} from '../../shared/theme';
import {TASKS, TASK_ID} from '../../shared/utils';
import Card from './components/Card';
import Switch from './components/Switch';

import Refresh from '../../assets/svg/sf/arrow.clockwise.svg';

import BGLocation from 'react-native-background-geolocation-android';
import useEnabledQuery from '../../shared/hooks/useEnabledQuery';
import {useTaskManager} from '../../contexts/TaskManager';

const themes: ColorSchemeName[] = ['dark', 'light'];

const imageQuality: {value: ImageQuality; label: string}[] = [
  {value: ImageQuality.LOW, label: 'Low'},
  {value: ImageQuality.MEDIUM, label: 'Medium'},
  {value: ImageQuality.HIGH, label: 'High'},
];

const Tracking = ({style}: any) => {
  const {enabled} = useTracker();
  const {primary} = useTheme().colors;
  const tracking = useSettings(({tracking}) => tracking);
  const colorScheme = useSettings(({theme}) => theme.colorScheme);
  const setTracking = useSettings(({setTracking}) => setTracking);

  const color = colorScheme === 'dark' ? Colors.white : primary;

  const isFocused = useIsFocused();

  const {isFetching, refetch, data: count = 0} = useQuery(
    ['tracks-count'],
    () => BGLocation.getCount(),
    {refetchInterval: 3000, enabled: isFocused && enabled},
  );

  return (
    <View style={style}>
      <Spacer>
        <Title>Tracking</Title>

        <View>
          <Spacer>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View
                style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                <Text numberOfLines={1} style={{color: Colors.grey600}}>
                  Tracks not yet uploaded: <Title>{count}</Title>
                </Text>

                {isFetching && (
                  <ActivityIndicator
                    size={15}
                    color={color}
                    style={{marginStart: 10}}
                  />
                )}
              </View>

              <IconButton
                color={color}
                onPress={() => refetch()}
                icon={({size, color}) => (
                  <Refresh width={size} height={size} color={color} />
                )}
              />
            </View>

            <Card style={styles.cardRow}>
              <Subheading>Enable GPS Accuracy</Subheading>
              <Switch
                value={tracking.accurracyEnabled}
                onValueChange={(accurracyEnabled) => {
                  setTracking({accurracyEnabled});
                }}
              />
            </Card>
          </Spacer>
        </View>
      </Spacer>
    </View>
  );
};

const Media = ({style}: any) => {
  const {colors} = useTheme();
  const media = useSettings(({media}) => media);
  const theme = useSettings(({theme}) => theme);
  const setMedia = useSettings(({setMedia}) => setMedia);

  const isDark = theme.colorScheme === 'dark';

  const color = isDark ? Colors.white : colors.primaryDark;

  return (
    <View style={style}>
      <Spacer>
        <Title>Media</Title>
        <View>
          <Spacer>
            <Card style={styles.cardRow}>
              <Subheading>Save Media To Device</Subheading>
              <Switch
                value={media.canSave}
                onValueChange={(canSave) => {
                  setMedia({canSave});
                }}
              />
            </Card>

            <Card>
              <Spacer>
                <Subheading>Photo Quality</Subheading>
                <View style={{flexWrap: 'wrap', flexDirection: 'row'}}>
                  {imageQuality.map(({label, value}) => {
                    return (
                      <Checkbox
                        key={value}
                        color={color}
                        label={label}
                        labelStyle={{color}}
                        containerStyle={{margin: 5}}
                        value={value === media.quality}
                        iconColor={isDark ? primaryDark : Colors.white}
                        onValueChange={(checked) => {
                          setMedia({
                            quality: checked ? value : media.quality,
                          });
                        }}
                      />
                    );
                  })}
                </View>
              </Spacer>
            </Card>
          </Spacer>
        </View>
      </Spacer>
    </View>
  );
};

const ThemeSelector = ({
  value,
  style,
  status,
  onPress,
  partsStyle,
  containerStyle,
  contentContainerStyle,
}: {
  value: Themes;
  onPress(): void;
  style?: StyleProp<ViewStyle>;
  status: 'checked' | 'unchecked';
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  partsStyle?: Record<'top' | 'bottom', StyleProp<ViewStyle>>;
}) => {
  return (
    <Box alignItems="center" style={style}>
      <Spacer>
        <TouchableNativeFeedback onPress={onPress}>
          <View
            style={[
              styles.themeWrapper,
              status === 'checked' && styles.themeChecked,
              containerStyle,
            ]}>
            <Box
              width={50}
              height={50}
              style={contentContainerStyle}
              transform={[{rotate: '-45deg'}, {scale: 1.5}]}>
              <View style={[styles.part, partsStyle?.top]} />
              <View style={[styles.part, partsStyle?.bottom]} />
            </Box>
          </View>
        </TouchableNativeFeedback>

        <Paragraph
          style={{
            fontWeight: '500',
            textTransform: 'capitalize',
          }}>
          {value}
        </Paragraph>
      </Spacer>
    </Box>
  );
};

const Theme = ({style}: any) => {
  const scheme = useSettings(colorSchemeSelector);
  const system = useSettings(({theme}) => theme.system);
  const setTheme = useSettings(({setTheme}) => setTheme);

  return (
    <View style={style}>
      <Spacer>
        <Title>Theme</Title>
        <Box flexDirection="row">
          <Spacer horizontal gap={20}>
            <>
              {themes.map((colorScheme) => {
                const isLight = colorScheme === 'light';
                const color = isLight
                  ? styles.colorSchemeLight
                  : styles.colorSchemeDark;

                return (
                  <ThemeSelector
                    key={colorScheme}
                    style={{flex: 1}}
                    value={colorScheme}
                    containerStyle={color}
                    contentContainerStyle={color}
                    onPress={() => {
                      setTheme({system: false, colorScheme});
                    }}
                    status={
                      colorScheme === scheme && !system
                        ? 'checked'
                        : 'unchecked'
                    }
                    partsStyle={{
                      bottom: color,
                      top: !isLight
                        ? styles.colorSchemeDark
                        : styles.colorSchemeLight,
                    }}
                  />
                );
              })}
            </>

            <ThemeSelector
              value="system"
              style={{flex: 1}}
              onPress={() => setTheme({system: true})}
              status={system ? 'checked' : 'unchecked'}
              partsStyle={{
                top: styles.colorSchemeDark,
                bottom: styles.colorSchemeLight,
              }}
            />
          </Spacer>
        </Box>
      </Spacer>
    </View>
  );
};

export default function Settings() {
  const nav = useNavigation();
  const queryClient = useQueryClient();
  const {stop: stopTracking} = useTracker();
  const {stop: stopTasks} = useTaskManager();

  useLayoutEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <View style={{paddingHorizontal: 10}}>
          <Button
            onPress={() => {
              Alert.alert(
                'Log out',
                'All your project and tracking data, including those not yet submitted will be lost upon logout',
                [
                  {
                    text: 'Log me out',
                    style: 'destructive',
                    onPress: () => {
                      stopTracking();

                      stopTasks();

                      BackgroundFetch.stop(TASK_ID);

                      BgGeolocation.destroyLocations();

                      AsyncStorage.multiRemove([TASKS, PROJECTS]);

                      [[PROJECTS], [ASSIGNED], [TRACKS]].map((key) => {
                        queryClient.cancelQueries(key);
                      });

                      queryClient.clear();

                      authStore.getState().logout();
                    },
                  },
                ],
                {cancelable: true},
              );
            }}>
            Logout
          </Button>
        </View>
      ),
    });
  }, [nav, stopTracking, queryClient]);

  return (
    <Screen style={{padding: 0}}>
      <ScrollView contentContainerStyle={{padding: 20}}>
        <View style={{marginTop: '10%'}}>
          <Spacer gap={20}>
            <Tracking />

            <Media />

            <Theme />
          </Spacer>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeWrapper: {
    borderWidth: 3,
    overflow: 'hidden',
    borderRadius: radius,
    borderColor: Colors.grey300,
  },
  themeChecked: {
    borderColor: primary,
  },
  part: {
    height: '50%',
  },
  theme: {
    borderWidth: 30,
    borderTopColor: Colors.grey900,
    borderRightColor: Colors.white,
    borderLeftColor: Colors.grey900,
    borderBottomColor: Colors.white,
  },
  colorSchemeLight: {
    backgroundColor: Colors.white,
  },
  colorSchemeDark: {
    backgroundColor: primaryDark,
  },
});
