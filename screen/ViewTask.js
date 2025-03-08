import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const ViewTask = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Task Details</Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('PendingTask')}>
          <Ionicons name="close-circle-outline" size={40} color="#9b59b6" />
          <Text style={styles.text}>Pending Task</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('CompletedTask')}>
          <Ionicons name="checkbox" size={40} color="#9b59b6" />
          <Text style={styles.text}>Completed Task</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('MissedTask')}>
          <Ionicons name="alert-circle-outline" size={40} color="#e74c3c" />
          <Text style={styles.text}>Missed Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#9b59b6',
  },
  grid: {
    width: '70%',
    height:140,
    flexDirection: 'row',
  },
  box: {
    width: '40%',
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
    alignItems: 'center',
    borderRadius: 10,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold',
    alignItems:'center',
  },
});

export default ViewTask;
