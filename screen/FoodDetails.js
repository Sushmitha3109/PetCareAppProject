import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const FoodDetails = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Food Details</Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('AddFoodDetails')}>
          <Ionicons name="add-circle" size={40} color="#9b59b6" />
          <Text style={styles.text}> Add Foods</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('ViewFoodDetails')}>
          <Ionicons name="eye" size={40} color="#9b59b6" />
          <Text style={styles.text}>View Foods</Text>
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
    width: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginStart: 30,
  },
  box: {
    width: '40%',
    backgroundColor: '#fff',
    padding: 20,
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
  },
});

export default FoodDetails;
