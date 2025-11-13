import {useNavigation} from '@react-navigation/native';
import {filter} from 'fp-ts/Array';
import {flow, pipe} from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import {identity, isEmpty, map} from 'ramda';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Image from 'react-native-fast-image';
import {Button, Colors, Headline, Text, Title} from 'react-native-paper';
import Screen from '../../../../shared/components/Screen';
import Spacer from '../../../../shared/components/Spacer';
import {radius} from '../../../../shared/theme';
import {Project} from '../../../../shared/types/project';
import {groupByType} from '../../../../shared/utils';
import {useAssigned} from '../../context/Assigned';

const white = {color: Colors.white};
const grey = {color: Colors.grey200};

export default function Assigned() {
  const nav = useNavigation();

  const {refetch, isLoading, data} = useAssigned();

  // remove assigned data that doesn't have any project associated with
  // it, given we need to know the associated project to person data submission
  const filteredData = data?.filter((d) => !!d.dataProject);

  return (
    <Screen style={{padding: 0}}>
      {!data || data.length <= 0 ? (
        <View style={styles.empty}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Headline style={{color: Colors.grey500}}>
                No assigned data
              </Headline>
              <Button onPress={refetch} style={{marginTop: 10}}>
                Refresh
              </Button>
            </>
          )}
        </View>
      ) : (
        <FlatList
          style={{flex: 1}}
          data={filteredData}
          onRefresh={refetch}
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
                      <Title
                        numberOfLines={1}
                        style={[white, {textTransform: 'capitalize'}]}>
                        {dataProject.name}
                      </Title>
                    )}

                    {strValues.length > 0 || images.length > 0 ? (
                      <View>
                        <Spacer>
                          {strValues.length > 0 && (
                            <Text style={grey} numberOfLines={2}>
                              {strValues.join(', ')}
                            </Text>
                          )}

                          {images.length > 0 && (
                            <View style={styles.row}>
                              {images.map((uri) => (
                                <Image
                                  key={uri}
                                  style={[styles.img, styles.rowItem]}
                                  source={{uri, priority: Image.priority.low}}
                                />
                              ))}
                            </View>
                          )}
                        </Spacer>
                      </View>
                    ) : (
                      <Text style={grey}>No data</Text>
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
