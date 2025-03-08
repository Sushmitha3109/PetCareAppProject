import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const SearchScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foodList, setFoodList] = useState([]);
  const [filteredFood, setFilteredFood] = useState([]);

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
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFood([]);
    } else {
      const results = foodList.filter((item) =>
        item.foodName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFood(results);
    }
  }, [searchTerm, foodList]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search Food"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {filteredFood.length > 0 ? (
        <FlatList
          data={filteredFood}
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
            </View>
          )}
          contentContainerStyle={styles.listContainer} 
        />
      ) : (
        searchTerm !== '' && <Text style={styles.noResults}>No results found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  search: {
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 2,
    fontSize: 16,
    width: "100%",
    marginTop: 10,
  },
  listContainer: { paddingBottom: 20 }, // Prevents content from getting cut off
  foodItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    elevation: 3,
  },
  foodText: { fontSize: 16, fontWeight: 'bold' },
  foodStatus: { fontSize: 14, fontWeight: 'bold', marginTop: 5 },
  foodSpecies: { fontSize: 14, color: '#555', marginTop: 2 },
  foodRecipe: { fontSize: 14, color: '#444', marginTop: 2 },
  foodAlternative: { fontSize: 14, color: '#666', marginTop: 2 },
  foodDescription: { fontSize: 14, color: '#777', marginTop: 2 },
  noResults: { textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' },
});

export default SearchScreen;
