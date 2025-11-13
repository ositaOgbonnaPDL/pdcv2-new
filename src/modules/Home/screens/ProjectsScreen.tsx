/**
 * Projects Screen
 * Displays a grid of available projects with search functionality
 */

import {useNavigation} from '@react-navigation/native';
import Fuse from 'fuse.js';
import {flow, map, trim} from 'lodash/fp';
import {MotiView} from 'moti';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  IconButton,
  Text,
  useTheme,
  MD3Colors,
} from 'react-native-paper';
import {pipe} from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';

import {Screen, Spacer, TextInput} from '../../../components';
import useEnabledQuery from '../../../hooks/useEnabledQuery';
import {get} from '../../../api/httpClient';
import {PROJECTS, queryClient} from '../../../api/queryClient';
import useSettingsStore, {
  colorSchemeSelector,
} from '../../../stores/settingsStore';
import {Project} from '../../../types/project';
import {getAsyncItem, setAsyncItem} from '../../../utils/storage';
import {primaryDark} from '../../../theme';

const fuseConfig = {
  ignoreLocation: true,
  ignoreFieldNorm: true,
  keys: ['name', 'description', 'type', 'feature'],
};

const getProjects = async (): Promise<Project[]> => {
  const data = await get<Project[]>('/mobile/projects');
  return data;
};

export default function ProjectsScreen() {
  const nav = useNavigation<any>();
  const {colors} = useTheme();
  const colorScheme = useSettingsStore(colorSchemeSelector);

  const isDark = colorScheme === 'dark';
  const isLight = colorScheme === 'light';

  const value = useRef(new Animated.Value(0));

  const {refetch, isFetching, data = []} = useEnabledQuery({
    queryKey: [PROJECTS],
    queryFn: getProjects,
  });

  // Save projects to AsyncStorage when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      setAsyncItem(PROJECTS, data);
    }
  }, [data]);

  const [searchTerm, setSearchTerm] = useState<string>();

  const fuse = useRef(new Fuse(data, fuseConfig));

  const searchResult = useMemo(() => {
    return pipe(
      O.fromNullable(searchTerm),
      O.map(trim),
      O.fold(
        () => [],
        flow(
          (q) => fuse.current.search(q),
          map(({item}) => item),
        ),
      ),
    );
  }, [data, searchTerm]);

  const result = useMemo(
    () => (searchResult.length > 0 ? searchResult : data),
    [data, searchResult],
  );

  const search = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  useEffect(() => {
    if (isFetching) {
      Animated.loop(
        Animated.timing(value.current, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    }

    if (!isFetching) {
      value.current.stopAnimation(() => value.current.setValue(0));
    }
  }, [isFetching]);

  // Get locally saved projects to speed up load time
  useEffect(() => {
    getAsyncItem<Project[]>(PROJECTS).then((cachedData) => {
      if (cachedData) {
        const data = queryClient.getQueryData([PROJECTS]);
        if (!data) queryClient.setQueryData([PROJECTS], cachedData);
      }
    });
  }, []);

  useEffect(() => {
    fuse.current.setCollection(data);
  }, [data, fuse]);

  useLayoutEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <View style={[styles.horizontalCenter, {paddingHorizontal: 10}]}>
          <Spacer horizontal>
            <IconButton
              onPress={() => refetch()}
              icon="refresh"
              iconColor={isDark ? MD3Colors.neutral100 : MD3Colors.neutral0}
              animated
              style={{
                transform: [
                  {
                    rotate: value.current.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              }}
            />

            <IconButton
              onPress={() => nav.navigate('Settings')}
              icon="cog"
              iconColor={isDark ? MD3Colors.neutral100 : MD3Colors.neutral0}
            />
          </Spacer>
        </View>
      ),
    });
  }, [nav, refetch, value, isDark]);

  return (
    <Screen style={{padding: 0}}>
      <TextInput
        value={searchTerm}
        onChangeText={search}
        style={styles.search}
        placeholder="Search here"
        render={({style, focused, ...props}: any) => {
          return (
            <View style={styles.horizontalCenter}>
              <IconButton
                icon="magnify"
                size={20}
                iconColor={
                  focused
                    ? isDark
                      ? MD3Colors.neutral100
                      : primaryDark
                    : isDark
                    ? MD3Colors.neutral60
                    : MD3Colors.neutral40
                }
              />
              <RNTextInput
                {...props}
                style={[style, styles.searchField]}
                placeholderTextColor={MD3Colors.neutral60}
              />
            </View>
          );
        }}
      />

      {!data || data.length <= 0 ? (
        <View style={styles.empty}>
          <Text variant="headlineMedium" style={{color: MD3Colors.neutral50}}>
            No projects yet
          </Text>
        </View>
      ) : searchTerm && searchResult.length <= 0 ? (
        <View style={styles.empty}>
          <Text variant="headlineMedium" style={{color: MD3Colors.neutral50}}>
            No matching result
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{padding: 20}}>
          <View style={styles.grid}>
            {result.map((item, i) => {
              const {id, name, description} = item;

              return (
                <MotiView
                  key={id}
                  style={styles.gridItem}
                  delay={i * 100}
                  from={{opacity: 0, translateY: 50}}
                  animate={{opacity: 1, translateY: 0}}>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      nav.navigate('Project', {project: item});
                    }}>
                    <View style={[styles.container, isLight && styles.shadow]}>
                      <Text
                        variant="titleLarge"
                        numberOfLines={1}
                        style={styles.white}>
                        {name}
                      </Text>

                      <Text
                        variant="bodyMedium"
                        numberOfLines={6}
                        style={styles.grey}>
                        {description}
                      </Text>

                      <Text variant="titleMedium" style={styles.white}>
                        ...
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                </MotiView>
              );
            })}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  horizontalCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchField: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 15,
  },
  container: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#150E44',
    minHeight: 150,
  },
  shadow: {
    shadowRadius: 7,
    shadowOpacity: 0.2,
    shadowColor: MD3Colors.neutral40,
    shadowOffset: {width: 2, height: 5},
  },
  white: {
    color: MD3Colors.neutral100,
  },
  grey: {
    color: MD3Colors.neutral80,
  },
});
