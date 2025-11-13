import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const ProjectViewerScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Project Viewer Screen</Text>
      <Text style={styles.subtext}>Project viewer will be implemented here</Text>
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

export default ProjectViewerScreen;
