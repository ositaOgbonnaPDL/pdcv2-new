/**
 * Settings Screen
 * App settings including theme, media quality, and logout
 */

import {useNavigation} from '@react-navigation/native';
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
import {Button, MD3Colors, Text, useTheme} from 'react-native-paper';

import {Box, Screen, Spacer} from '../../components';
import useAuthStore from '../../stores/authStore';
import useSettingsStore, {
  colorSchemeSelector,
  ImageQuality,
} from '../../stores/settingsStore';
import {radius, primary, primaryDark} from '../../theme';
import {queryClient, PROJECTS, ASSIGNED} from '../../api/queryClient';
import Card from './components/Card';
import Switch from './components/Switch';

const themes: ColorSchemeName[] = ['dark', 'light'];

const imageQuality: {value: ImageQuality; label: string}[] = [
  {value: ImageQuality.LOW, label: 'Low'},
  {value: ImageQuality.MEDIUM, label: 'Medium'},
  {value: ImageQuality.HIGH, label: 'High'},
];

const Media = ({style}: any) => {
  const {colors} = useTheme();
  const media = useSettingsStore((state) => state.media);
  const colorScheme = useSettingsStore(colorSchemeSelector);
  const setMedia = useSettingsStore((state) => state.setMedia);

  const isDark = colorScheme === 'dark';

  const color = isDark ? MD3Colors.neutral100 : primaryDark;

  return (
    <View style={style}>
      <Spacer>
        <Text variant="titleLarge">Media</Text>
        <View>
          <Spacer>
            <Card style={styles.cardRow}>
              <Text variant="titleMedium">Save Media To Device</Text>
              <Switch
                value={media.canSave}
                onValueChange={(canSave) => {
                  setMedia({canSave});
                }}
              />
            </Card>

            <Card>
              <Spacer>
                <Text variant="titleMedium">Photo Quality</Text>
                <View style={{flexWrap: 'wrap', flexDirection: 'row'}}>
                  {imageQuality.map(({label, value: qualityValue}) => {
                    const isSelected = qualityValue === media.quality;
                    return (
                      <TouchableNativeFeedback
                        key={qualityValue}
                        onPress={() => {
                          setMedia({quality: qualityValue});
                        }}>
                        <View
                          style={[
                            styles.qualityOption,
                            {
                              borderColor: isSelected
                                ? color
                                : MD3Colors.neutral40,
                              backgroundColor: isSelected
                                ? `${color}20`
                                : 'transparent',
                            },
                          ]}>
                          <Text
                            variant="bodyMedium"
                            style={{
                              color: isSelected ? color : MD3Colors.neutral60,
                              fontWeight: isSelected ? 'bold' : 'normal',
                            }}>
                            {label}
                          </Text>
                        </View>
                      </TouchableNativeFeedback>
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
  value: ColorSchemeName | 'system';
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

        <Text
          variant="bodyMedium"
          style={{
            fontWeight: '500',
            textTransform: 'capitalize',
          }}>
          {value}
        </Text>
      </Spacer>
    </Box>
  );
};

const Theme = ({style}: any) => {
  const scheme = useSettingsStore(colorSchemeSelector);
  const system = useSettingsStore((state) => state.theme.system);
  const setTheme = useSettingsStore((state) => state.setTheme);

  return (
    <View style={style}>
      <Spacer>
        <Text variant="titleLarge">Theme</Text>
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
                      colorScheme === scheme && !system ? 'checked' : 'unchecked'
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

export default function SettingsScreen() {
  const nav = useNavigation<any>();
  const logout = useAuthStore((state) => state.logout);

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
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Log me out',
                    style: 'destructive',
                    onPress: () => {
                      // Clear query cache
                      queryClient.cancelQueries({queryKey: [PROJECTS]});
                      queryClient.cancelQueries({queryKey: [ASSIGNED]});
                      queryClient.clear();

                      // Logout (will clear auth state and encrypted storage)
                      logout();
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
  }, [nav, logout]);

  return (
    <Screen style={{padding: 0}}>
      <ScrollView contentContainerStyle={{padding: 20}}>
        <View style={{marginTop: '10%'}}>
          <Spacer gap={20}>
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
    alignItems: 'center',
  },
  qualityOption: {
    margin: 5,
    padding: 10,
    borderWidth: 2,
    borderRadius: radius,
    minWidth: 80,
    alignItems: 'center',
  },
  themeWrapper: {
    borderWidth: 3,
    overflow: 'hidden',
    borderRadius: radius,
    borderColor: MD3Colors.neutral30,
  },
  themeChecked: {
    borderColor: primary,
  },
  part: {
    height: '50%',
  },
  colorSchemeLight: {
    backgroundColor: MD3Colors.neutral100,
  },
  colorSchemeDark: {
    backgroundColor: primaryDark,
  },
});
