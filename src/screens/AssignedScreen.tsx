import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const AssignedScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Assigned Data Screen</Text>
      <Text style={styles.subtext}>Assigned data list will be displayed here</Text>
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
  },
});

export default AssignedScreen;
