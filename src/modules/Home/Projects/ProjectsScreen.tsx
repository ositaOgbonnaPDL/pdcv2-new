import {useNavigation} from '@react-navigation/core';
import Fuse from 'fuse.js';
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
  FlatList,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Headline,
  IconButton,
  MD3Colors,
  Paragraph,
  Subheading,
  Title,
  useTheme,
} from 'react-native-paper';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {MotiView} from 'moti';

import {httpClient} from '../../../api';
import {Screen, Spacer, TextInput} from '../../../components';
import {Project} from '../../../types';
import {QUERY_KEYS, setAsyncItem, getAsyncItem} from '../../../utils';
import useSettingsStore, {colorSchemeSelector} from '../../../stores/settingsStore';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../types/navigation';

const fuseConfig = {
  ignoreLocation: true,
  ignoreFieldNorm: true,
  keys: ['name', 'description', 'type', 'feature'],
};

const getProjects = async (): Promise<Project[]> => {
  const response = await httpClient.get('/mobile/projects');
  return response.data;
};

export default function ProjectsScreen() {
  const nav =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();
  const {colors} = useTheme();
  const colorScheme = useSettingsStore(colorSchemeSelector);
  const queryClient = useQueryClient();

  const isDark = colorScheme === 'dark';
  const isLight = colorScheme === 'light';

  const value = useRef(new Animated.Value(0));

  const {refetch, isFetching, data = []} = useQuery({
    queryKey: [QUERY_KEYS.PROJECTS],
    queryFn: getProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const [searchTerm, setSearchTerm] = useState<string>('');

  const fuse = useRef(new Fuse(data, fuseConfig));

  const searchResult = useMemo(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return [];
    return fuse.current.search(trimmed).map(({item}) => item);
  }, [searchTerm]);

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

  // Load cached projects on mount
  useEffect(() => {
    getAsyncItem<Project[]>(QUERY_KEYS.PROJECTS).then((cachedData) => {
      if (cachedData) {
        const current = queryClient.getQueryData([QUERY_KEYS.PROJECTS]);
        if (!current) {
          queryClient.setQueryData([QUERY_KEYS.PROJECTS], cachedData);
        }
      }
    });
  }, [queryClient]);

  // Save projects to cache when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      setAsyncItem(QUERY_KEYS.PROJECTS, data);
    }
  }, [data]);

  useEffect(() => {
    fuse.current.setCollection(data);
  }, [data]);

  useLayoutEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          <Spacer horizontal>
            <IconButton
              icon="refresh"
              iconColor={isDark ? '#FFFFFF' : colors.primary}
              onPress={() => refetch()}
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
              icon="cog"
              iconColor={isDark ? '#FFFFFF' : colors.primary}
              onPress={() => nav.navigate('Settings')}
            />
          </Spacer>
        </View>
      ),
    });
  }, [nav, refetch, value, isDark, colors]);

  const renderProject = ({item, index}: {item: Project; index: number}) => {
    const {id, name, description} = item;

    return (
      <MotiView
        delay={index * 100}
        from={{opacity: 0, translateY: 50}}
        animate={{opacity: 1, translateY: 0}}
        style={styles.gridItem}>
        <TouchableOpacity
          onPress={() => {
            nav.navigate('Project', {project: item});
          }}>
          <View style={[styles.card, isLight && styles.cardShadow]}>
            <Title numberOfLines={1} style={styles.cardTitle}>
              {name}
            </Title>

            <Paragraph numberOfLines={6} style={styles.cardDescription}>
              {description}
            </Paragraph>

            <Subheading style={styles.cardTitle}>...</Subheading>
          </View>
        </TouchableOpacity>
      </MotiView>
    );
  };

  return (
    <Screen style={styles.screen}>
      <TextInput
        value={searchTerm}
        onChangeText={search}
        style={styles.searchContainer}
        placeholder="Search here"
        render={({style, focused, ...props}: any) => {
          return (
            <View style={styles.searchInputContainer}>
              <IconButton
                icon="magnify"
                size={20}
                iconColor={
                  focused
                    ? isDark
                      ? '#FFFFFF'
                      : colors.primary
                    : isDark
                    ? MD3Colors.neutral60
                    : MD3Colors.neutral60
                }
              />
              <RNTextInput
                {...props}
                style={[style, styles.searchInput]}
                placeholderTextColor={MD3Colors.neutral60}
              />
            </View>
          );
        }}
      />

      {!data || data.length <= 0 ? (
        <View style={styles.emptyContainer}>
          <Headline style={styles.emptyText}>No projects yet</Headline>
        </View>
      ) : searchTerm && searchResult.length <= 0 ? (
        <View style={styles.emptyContainer}>
          <Headline style={styles.emptyText}>No matching result</Headline>
        </View>
      ) : (
        <FlatList
          data={result}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProject}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchContainer: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: MD3Colors.neutral60,
  },
  listContainer: {
    padding: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 15,
  },
  card: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#150E44',
  },
  cardShadow: {
    shadowRadius: 7,
    shadowOpacity: 0.2,
    shadowColor: MD3Colors.neutral60,
    shadowOffset: {width: 2, height: 5},
    elevation: 4,
  },
  cardTitle: {
    color: '#FFFFFF',
  },
  cardDescription: {
    color: MD3Colors.neutral60,
  },
});
