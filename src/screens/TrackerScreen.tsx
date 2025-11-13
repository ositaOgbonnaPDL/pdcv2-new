import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const TrackerScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tracker Screen</Text>
      <Text style={styles.subtext}>
        Background location tracking will be implemented here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default TrackerScreen;
