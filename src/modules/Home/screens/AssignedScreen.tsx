/**
 * Assigned Data Screen
 * Displays assigned data that needs to be filled/verified
 */

import {useNavigation} from '@react-navigation/native';
import {filter} from 'fp-ts/Array';
import {flow, pipe} from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import {identity, isEmpty, map} from 'ramda';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button, MD3Colors, Text} from 'react-native-paper';

import {Screen, Spacer} from '../../../components';
import {radius} from '../../../theme';
import {Project} from '../../../types/project';
import {groupByType} from '../../../utils/project';
import {useAssigned} from '../../../contexts/AssignedContext';

const white = {color: MD3Colors.neutral100};
const grey = {color: MD3Colors.neutral80};

export default function AssignedScreen() {
  const nav = useNavigation<any>();

  const {refetch, isLoading, data} = useAssigned();

  // Remove assigned data that doesn't have any project associated with
  // it, given we need to know the associated project to perform data submission
  const filteredData = data?.filter((d) => !!d.dataProject);

  return (
    <Screen style={{padding: 0}}>
      {!data || data.length <= 0 ? (
        <View style={styles.empty}>
          {isLoading ? (
            <ActivityIndicator color={MD3Colors.neutral100} />
          ) : (
            <>
              <Text variant="headlineMedium" style={{color: MD3Colors.neutral50}}>
                No assigned data
              </Text>
              <Button onPress={() => refetch()} style={{marginTop: 10}}>
                Refresh
              </Button>
            </>
          )}
        </View>
      ) : (
        <FlatList
          style={{flex: 1}}
          data={filteredData}
          onRefresh={() => refetch()}
          refreshing={isLoading}
          keyExtractor={({id}) => String(id)}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => {
            return <View style={styles.itemSeparator} />;
          }}
          renderItem={({item}) => {
            const {geometry, dataProject} = item;

            const {fields = []} = (dataProject ?? {}) as Project;

            const {image, other} = groupByType(fields);

            const images = pipe(
              O.fromNullable(image),
              O.map(
                flow(
                  map((img) => img.defaultValue),
                  filter(Boolean),
                ),
              ),
              O.fold(() => [], identity),
            );

            const strValues = pipe(
              O.fromNullable(other),
              O.map(
                flow(
                  (f) => f.slice(0, 6),
                  map((f) => f.defaultValue),
                  filter((v) => !isEmpty(v)),
                ),
              ),
              O.fold(() => [], identity),
            );

            return (
              <View style={styles.card}>
                <TouchableOpacity
                  onPress={() => {
                    nav.navigate('Form', {
                      project: dataProject,
                      collectedGeometry: geometry,
                    });
                  }}>
                  <Spacer>
                    {dataProject && (
                      <Text
                        variant="titleLarge"
                        numberOfLines={1}
                        style={[white, {textTransform: 'capitalize'}]}>
                        {dataProject.name}
                      </Text>
                    )}

                    {strValues.length > 0 || images.length > 0 ? (
                      <View>
                        <Spacer>
                          {strValues.length > 0 && (
                            <Text variant="bodyMedium" style={grey} numberOfLines={2}>
                              {strValues.join(', ')}
                            </Text>
                          )}

                          {images.length > 0 && (
                            <View style={styles.row}>
                              {images.map((uri) => (
                                <Image
                                  key={uri}
                                  style={[styles.img, styles.rowItem]}
                                  source={{uri}}
                                />
                              ))}
                            </View>
                          )}
                        </Spacer>
                      </View>
                    ) : (
                      <Text variant="bodyMedium" style={grey}>
                        No data
                      </Text>
                    )}
                  </Spacer>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    alignItems: 'flex-start',
  },
  list: {
    padding: 20,
    minHeight: '100%',
  },
  itemSeparator: {
    height: 10,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#150E44',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rowItem: {
    marginHorizontal: 3,
  },
  img: {
    width: 40,
    height: 40,
    borderRadius: radius,
  },
});
