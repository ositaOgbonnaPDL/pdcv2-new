import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useLayoutEffect} from 'react';
import {
  Alert,
  ColorSchemeName,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  Paragraph,
  Subheading,
  Title,
  useTheme,
} from 'react-native-paper';
import {MD3Colors} from 'react-native-paper/lib/typescript/types';
import {useQueryClient} from '@tanstack/react-query';

import {Box, Screen, Spacer} from '../../../components';
import {useAuthStore, useSettingsStore, MediaQuality} from '../../../stores';
import {radius, primaryDark} from '../../../theme';
import {QUERY_KEYS} from '../../../utils';
import {Card, SettingsSwitch} from './components';

const themes: ColorSchemeName[] = ['dark', 'light'];

const mediaQualities: {value: MediaQuality; label: string}[] = [
  {value: 'LOW', label: 'Low'},
  {value: 'MEDIUM', label: 'Medium'},
  {value: 'HIGH', label: 'High'},
];

type ThemeSelectorProps = {
  value: 'dark' | 'light' | 'system';
  onPress: () => void;
  status: 'checked' | 'unchecked';
  isDarkPreview?: boolean;
};

const ThemeSelector = ({
  value,
  onPress,
  status,
  isDarkPreview = false,
}: ThemeSelectorProps) => {
  const isSystem = value === 'system';

  return (
    <Box alignItems="center" style={styles.themeSelectorContainer}>
      <Spacer>
        <TouchableOpacity onPress={onPress}>
          <View
            style={[
              styles.themeWrapper,
              status === 'checked' && styles.themeChecked,
            ]}>
            <View
              style={[
                styles.themePreview,
                isSystem
                  ? styles.themePreviewSplit
                  : isDarkPreview
                  ? styles.themePreviewDark
                  : styles.themePreviewLight,
              ]}
            />
          </View>
        </TouchableOpacity>

        <Paragraph style={styles.themeLabel}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Paragraph>
      </Spacer>
    </Box>
  );
};

const ThemeSection = () => {
  const colorScheme = useSettingsStore((state) => state.colorScheme);
  const systemTheme = useSettingsStore((state) => state.systemTheme);
  const setColorScheme = useSettingsStore((state) => state.setColorScheme);
  const setSystemTheme = useSettingsStore((state) => state.setSystemTheme);

  return (
    <View style={styles.section}>
      <Spacer>
        <Title>Theme</Title>
        <Box flexDirection="row">
          <Spacer horizontal gap={20}>
            {themes.map((theme) => (
              <ThemeSelector
                key={theme}
                value={theme}
                isDarkPreview={theme === 'dark'}
                onPress={() => {
                  setSystemTheme(false);
                  setColorScheme(theme);
                }}
                status={
                  theme === colorScheme && !systemTheme
                    ? 'checked'
                    : 'unchecked'
                }
              />
            ))}

            <ThemeSelector
              value="system"
              onPress={() => setSystemTheme(true)}
              status={systemTheme ? 'checked' : 'unchecked'}
            />
          </Spacer>
        </Box>
      </Spacer>
    </View>
  );
};

const MediaSection = () => {
  const {colors} = useTheme();
  const mediaQuality = useSettingsStore((state) => state.mediaQuality);
  const canSaveMedia = useSettingsStore((state) => state.canSaveMedia);
  const setMediaQuality = useSettingsStore((state) => state.setMediaQuality);
  const setCanSaveMedia = useSettingsStore((state) => state.setCanSaveMedia);
  const colorScheme = useSettingsStore((state) => state.colorScheme);

  const isDark = colorScheme === 'dark';
  const checkboxColor = isDark ? '#FFFFFF' : colors.primary;

  return (
    <View style={styles.section}>
      <Spacer>
        <Title>Media</Title>
        <View>
          <Spacer>
            <Card style={styles.cardRow}>
              <Subheading>Save Media To Device</Subheading>
              <SettingsSwitch
                value={canSaveMedia}
                onValueChange={setCanSaveMedia}
              />
            </Card>

            <Card>
              <Spacer>
                <Subheading>Photo Quality</Subheading>
                <View style={styles.qualityContainer}>
                  {mediaQualities.map(({label, value}) => (
                    <TouchableOpacity
                      key={value}
                      style={styles.qualityOption}
                      onPress={() => setMediaQuality(value)}>
                      <View
                        style={[
                          styles.checkbox,
                          {borderColor: checkboxColor},
                          value === mediaQuality && [
                            styles.checkboxChecked,
                            {backgroundColor: checkboxColor},
                          ],
                        ]}
                      />
                      <Paragraph style={{color: checkboxColor, marginLeft: 8}}>
                        {label}
                      </Paragraph>
                    </TouchableOpacity>
                  ))}
                </View>
              </Spacer>
            </Card>
          </Spacer>
        </View>
      </Spacer>
    </View>
  );
};

export default function SettingsScreen() {
  const nav = useNavigation();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  useLayoutEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
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
                    onPress: async () => {
                      // Clear query cache
                      queryClient.clear();

                      // Clear AsyncStorage
                      await AsyncStorage.multiRemove([
                        QUERY_KEYS.PROJECTS,
                        QUERY_KEYS.ASSIGNED,
                        QUERY_KEYS.TRACKS,
                      ]);

                      // Logout (will clear auth store and encrypted storage)
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
  }, [nav, logout, queryClient]);

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Spacer gap={20}>
            <MediaSection />
            <ThemeSection />
          </Spacer>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 0,
  },
  scrollContainer: {
    padding: 20,
  },
  content: {
    marginTop: '10%',
  },
  headerRight: {
    paddingHorizontal: 10,
  },
  section: {
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qualityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  qualityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
  },
  checkboxChecked: {
    borderWidth: 0,
  },
  themeSelectorContainer: {
    flex: 1,
  },
  themeWrapper: {
    borderWidth: 3,
    overflow: 'hidden',
    borderRadius: radius,
    borderColor: MD3colors.surfaceVariant,
  },
  themeChecked: {
    borderColor: MD3colors.primary,
  },
  themePreview: {
    width: 50,
    height: 50,
  },
  themePreviewLight: {
    backgroundColor: '#FFFFFF',
  },
  themePreviewDark: {
    backgroundColor: primaryDark,
  },
  themePreviewSplit: {
    backgroundColor: primaryDark,
    borderTopColor: primaryDark,
    borderRightColor: '#FFFFFF',
    borderBottomColor: '#FFFFFF',
    borderLeftColor: primaryDark,
    borderWidth: 25,
    transform: [{rotate: '45deg'}, {scale: 1.2}],
  },
  themeLabel: {
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
