import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const ViewFoodDetails = ({ navigation }) => {
  const [foodList, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    fetchFoodDetails();
  }, []);

  const fetchFoodDetails = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'fooddetails'));
      const foods = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFoodList(foods);
    } catch (error) {
      console.error('Error fetching food details:', error);
    }
    setLoading(false); // Stop loading after fetching data
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "fooddetails", id)); 
      setFoodList(prevData => prevData.filter(item => item.id !== id));
      Alert.alert("Deleted!", "Food details have been removed.");
    } catch (error) {
      console.error("Delete Error:", error);
      Alert.alert("Error", "Failed to delete Food details.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Recommendations</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#9b59b6" style={styles.loader} />
      ) : (
        <FlatList
          data={foodList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.foodItem}>
              <Text style={styles.foodText}>🍖 {item.foodName} ({item.category})</Text>
              <Text style={[styles.foodStatus, { color: item.isSafe ? 'green' : 'red' }]}>
                {item.isSafe ? 'Safe ✅' : 'Unsafe ❌'}
              </Text>
              <Text style={styles.foodSpecies}>For: {item.species}</Text>
              <Text style={styles.foodRecipe}>📖 Recipe: {item.recipe}</Text>
              <Text style={styles.foodAlternative}>🔄 Alternative: {item.alternativeFood}</Text>
              <Text style={styles.foodDescription}>📌 {item.description}</Text>

              <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => navigation.navigate("EditFoodDetails", { foodItem: item })}>
                  <AntDesign name="edit" size={24} color="#9b59b6" /><Text>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <AntDesign name="delete" size={24} color="red" /><Text>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#9b59b6' },
  loader: { marginTop: 20 },
  foodItem: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginVertical: 5, elevation: 3 },
  foodText: { fontSize: 18, fontWeight: 'bold' },
  foodStatus: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  foodSpecies: { fontSize: 16, color: '#555', marginTop: 2 },
  foodRecipe: { fontSize: 16, color: '#444', marginTop: 2 },
  foodAlternative: { fontSize: 16, color: '#666', marginTop: 2 },
  foodDescription: { fontSize: 16, color: '#777', marginTop: 2 },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});

export default ViewFoodDetails;