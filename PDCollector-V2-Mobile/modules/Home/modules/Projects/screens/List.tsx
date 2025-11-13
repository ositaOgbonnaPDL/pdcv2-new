import {useNavigation} from '@react-navigation/core';
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
// @ts-ignore
import {Col, Cols} from 'react-native-cols';
import {
  Colors,
  Headline,
  IconButton,
  Paragraph,
  Subheading,
  Title,
} from 'react-native-paper';
import {SharedElement} from 'react-navigation-shared-element';
import Refresh from '../../../../../assets/svg/sf/arrow.triangle.2.circlepath.svg';
import Settings from '../../../../../assets/svg/sf/gearshape.fill.svg';
import SearchIcon from '../../../../../assets/svg/sf/magnifyingglass.svg';
import {primaryDark} from '../../../../../shared/colors';
import Screen from '../../../../../shared/components/Screen';
import Spacer from '../../../../../shared/components/Spacer';
import TextInput from '../../../../../shared/components/TextInput';
import useEnabledQuery from '../../../../../shared/hooks/useEnabledQuery';
import {get} from '../../../../../shared/http';
import {PROJECTS, queryClient} from '../../../../../shared/query';
import useSettings, {
  colorSchemeSelector,
} from '../../../../../shared/stores/settings';
import {Project as ProjectType} from '../../../../../shared/types/project';
import {getAsyncItem, setAsyncItem} from '../../../../../shared/utils';

import {pipe} from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';

const fuseConfig = {
  ignoreLocation: true,
  ignoreFieldNorm: true,
  keys: ['name', 'description', 'type', 'feature'],
};

const getProjects = async (): Promise<ProjectType[]> => {
  const {data} = await get('/mobile/projects');
  return data;
};

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
  container: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#150E44',
  },
  shadow: {
    shadowRadius: 7,
    shadowOpacity: 0.2,
    shadowColor: Colors.grey400,
    shadowOffset: {width: 2, height: 5},
  },
  white: {
    color: Colors.white,
  },
  grey: {
    color: Colors.grey200,
  },
});

export default function List() {
  const nav = useNavigation();
  const colorScheme = useSettings(colorSchemeSelector);

  const isDark = colorScheme === 'dark';
  const isLight = colorScheme === 'light';

  const value = useRef(new Animated.Value(0));

  const {refetch, isFetching, data = []} = useEnabledQuery(
    [PROJECTS],
    () => getProjects(),
    {onSuccess: (data) => setAsyncItem(PROJECTS, data)},
  );

  // const data = useMemo(() => query.data ?? [], [query.data]);

  const [searchTerm, setSearchTerm] = useState<string>();

  // console.log(data, 'here');

  // const [projects, setProjects] = useState(data);

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

  // console.log('searchResult', searchResult);

  // const search = useCallback(
  //   debounce(700)((query: string) => {
  //     const q = trim(query);
  //     setProjects(
  //       q === '' ? data : fuse.current.search(q).map(({item}) => item),
  //     );
  //   }),
  //   [data],
  // );

  const search = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  useEffect(() => {
    if (isFetching) {
      Animated.loop(
        Animated.timing(value.current, {
          toValue: 1,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    }

    if (!isFetching) {
      value.current.stopAnimation(() => value.current.setValue(0));
    }
  }, [isFetching]);

  // get locally saved projects to speed up load time
  useEffect(() => {
    getAsyncItem<ProjectType[]>(PROJECTS).then((cachedData) => {
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
              icon={({size, color}) => (
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: value.current.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  }}>
                  <Refresh width={size} height={size} color={color} />
                </Animated.View>
              )}
            />

            <IconButton
              onPress={() => nav.navigate('Settings')}
              icon={({size, color}) => (
                <Settings width={size} height={size} color={color} />
              )}
            />
          </Spacer>
        </View>
      ),
    });
  }, [nav, refetch, value]);

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
              <SearchIcon
                width={20}
                height={20}
                style={{marginHorizontal: 7}}
                color={
                  focused
                    ? isDark
                      ? Colors.white
                      : primaryDark
                    : isDark
                    ? Colors.grey600
                    : Colors.grey400
                }
              />
              <RNTextInput
                {...props}
                style={[style, styles.searchField]}
                placeholderTextColor={Colors.grey600}
              />
            </View>
          );
        }}
      />

      {!data || data.length <= 0 ? (
        <View style={styles.empty}>
          <Headline style={{color: Colors.grey500}}>No projects yets</Headline>
        </View>
      ) : searchTerm && searchResult.length <= 0 ? (
        <View style={styles.empty}>
          <Headline style={{color: Colors.grey500}}>
            No matching result
          </Headline>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{padding: 20}}>
          <Cols cols={2} style={{height: '100%'}}>
            {result.map((item, i) => {
              const {id, name, description} = item;

              return (
                <Col key={id}>
                  <MotiView
                    delay={i * 200}
                    from={{opacity: 0, translateY: 100}}
                    animate={{opacity: 1, translateY: 0}}>
                    <TouchableWithoutFeedback
                      onLongPress={() => {
                        nav.navigate('Popup', {project: item});
                      }}
                      onPress={() => {
                        nav.navigate('Project', {project: item});
                      }}>
                      <SharedElement id={`project-${id}`}>
                        <View
                          style={[styles.container, isLight && styles.shadow]}>
                          <Title numberOfLines={1} style={styles.white}>
                            {name}
                          </Title>

                          <Paragraph numberOfLines={6} style={styles.grey}>
                            {description}
                          </Paragraph>

                          <Subheading style={styles.white}>...</Subheading>
                        </View>
                      </SharedElement>
                    </TouchableWithoutFeedback>
                  </MotiView>
                </Col>
              );
            })}
          </Cols>
        </ScrollView>
      )}
    </Screen>
  );
}
