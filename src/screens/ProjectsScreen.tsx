import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const ProjectsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Projects Screen</Text>
      <Text style={styles.subtext}>Projects list will be displayed here</Text>
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

export default ProjectsScreen;
