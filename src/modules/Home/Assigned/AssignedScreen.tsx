import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import {Button, Headline, MD3Colors, Text, Title, useTheme} from 'react-native-paper';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {Screen, Spacer} from '../../../components';
import {radius} from '../../../theme';
import {AssignedData, Project, Field} from '../../../types';
import {groupByType} from '../../../utils';
import {useAssigned} from '../context/AssignedContext';
import {RootStackParamList} from '../../../types/navigation';

const white = {color: '#FFFFFF'};
const grey = {color: MD3Colors.neutral60};

export default function AssignedScreen() {
  const nav =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();
  const {colors} = useTheme();

  const {refetch, isLoading, data} = useAssigned();

  // Remove assigned data that doesn't have any project associated with it
  const filteredData = data?.filter((d) => !!d.dataProject) || [];

  const renderItem = ({item}: {item: AssignedData}) => {
    const {geometry, dataProject} = item;

    if (!dataProject) return null;

    const {fields = []} = dataProject as Project;

    const grouped = groupByType(fields);
    const imageFields = grouped.image || [];
    const otherFields = grouped.other || [];

    // Get image URLs from default values
    const images = imageFields
      .map((field) => field.defaultValue)
      .filter(Boolean);

    // Get string values from first 6 non-media fields
    const strValues = otherFields
      .slice(0, 6)
      .map((field) => field.defaultValue)
      .filter((value) => value && value.trim().length > 0);

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
            <Title numberOfLines={1} style={[white, styles.projectTitle]}>
              {dataProject.name}
            </Title>

            {strValues.length > 0 || images.length > 0 ? (
              <View>
                <Spacer>
                  {strValues.length > 0 && (
                    <Text style={grey} numberOfLines={2}>
                      {strValues.join(', ')}
                    </Text>
                  )}

                  {images.length > 0 && (
                    <View style={styles.imageRow}>
                      {images.map((uri, index) => (
                        <Image
                          key={`${uri}-${index}`}
                          style={[styles.thumbnail, styles.imageItem]}
                          source={{uri}}
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
  };

  if (!data || data.length <= 0) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.emptyContainer}>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Headline style={styles.emptyText}>No assigned data</Headline>
              <Button onPress={() => refetch()} style={styles.refreshButton}>
                Refresh
              </Button>
            </>
          )}
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <FlatList
        style={styles.list}
        data={filteredData}
        onRefresh={() => refetch()}
        refreshing={isLoading}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        renderItem={renderItem}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 0,
  },
  list: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
    minHeight: '100%',
  },
  itemSeparator: {
    height: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: MD3Colors.neutral60,
  },
  refreshButton: {
    marginTop: 10,
  },
  card: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#150E44',
  },
  projectTitle: {
    textTransform: 'capitalize',
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageItem: {
    marginHorizontal: 3,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: radius,
  },
});
