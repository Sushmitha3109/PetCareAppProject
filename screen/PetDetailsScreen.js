import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const PetDetailsScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Pet Details</Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('AddPetDetails')}>
          <Ionicons name="add-circle" size={40} color="#9b59b6" />
          <Text style={styles.text}>Add Details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('ViewPetDetails')}>
          <Ionicons name="eye" size={40} color="#9b59b6" />
          <Text style={styles.text}>View Details</Text>
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
    alignItems: 'center', // Center content
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#9b59b6',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Adjusts spacing
    width: '100%', // Ensure full width
    paddingHorizontal: 20, // Adds spacing on both sides
  },
  box: {
    width: '45%', // Ensures two boxes in one row
    backgroundColor: '#fff',
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 10,
    elevation: 5, // Improves shadow on Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 15, // Adds spacing between rows
  },
  text: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PetDetailsScreen;
