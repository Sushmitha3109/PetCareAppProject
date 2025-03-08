import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const EditFoodDetails = ({ route, navigation }) => {
  const { foodItem } = route.params;

  const [foodName, setFoodName] = useState(foodItem.foodName);
  const [category, setCategory] = useState(foodItem.category);
  const [species, setSpecies] = useState(foodItem.species);
  const [isSafe, setIsSafe] = useState(foodItem.isSafe);
  const [recipe, setRecipe] = useState(foodItem.recipe);
  const [alternativeFood, setAlternativeFood] = useState(foodItem.alternativeFood);
  const [description, setDescription] = useState(foodItem.description);

  const handleUpdate = async () => {
    try {
      const foodRef = doc(db, 'fooddetails', foodItem.id);
      await updateDoc(foodRef, {
        foodName,
        category,
        species,
        isSafe,
        recipe,
        alternativeFood,
        description,
      });
      Alert.alert("Updated", "Food details updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Update Error:", error);
      Alert.alert("Error", "Failed to update food details.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Food Recommendation</Text>

      <TextInput style={styles.input} placeholder="Food Name" value={foodName} onChangeText={setFoodName} />

      <Text style={styles.label}>Category</Text>
      <Picker selectedValue={category} style={styles.picker} onValueChange={(value) => setCategory(value)}>
        <Picker.Item label="Protein" value="Protein" />
        <Picker.Item label="Fruits" value="Fruits" />
        <Picker.Item label="Vegetables" value="Vegetables" />
        <Picker.Item label="Dairy" value="Dairy" />
        <Picker.Item label="Grains" value="Grains" />
        <Picker.Item label="Sweets" value="Sweets" />
        <Picker.Item label="Fish" value="Fish" />
        <Picker.Item label="Nuts" value="Nuts" />
        <Picker.Item label="Beverage" value="Beverage" />
        <Picker.Item label="Bread" value="Bread" />
      </Picker>

      <Text style={styles.label}>Species</Text>
      <Picker selectedValue={species} style={styles.picker} onValueChange={(value) => setSpecies(value)}>
        <Picker.Item label="Dog" value="Dog" />
        <Picker.Item label="Cat" value="Cat" />
        <Picker.Item label="Bird" value="Bird" />
      </Picker>

      <Text style={styles.label}>Is Safe?</Text>
      <Picker selectedValue={isSafe} style={styles.picker} onValueChange={(value) => setIsSafe(value)}>
        <Picker.Item label="Safe ✅" value={true} />
        <Picker.Item label="Unsafe ❌" value={false} />
      </Picker>

      <TextInput style={styles.input} placeholder="Recipe (How to prepare)" value={recipe} onChangeText={setRecipe} />
      <TextInput style={styles.input} placeholder="Alternative Food (If unavailable)" value={alternativeFood} onChangeText={setAlternativeFood} />
      <TextInput style={styles.input} placeholder="Description (Benefits, Warnings)" value={description} onChangeText={setDescription} />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#9b59b6' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  input: { height: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, marginBottom: 10, backgroundColor: '#fff' },
  picker: { height: 50, backgroundColor: '#fff', marginBottom: 10 },
  button: { backgroundColor: '#9b59b6', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default EditFoodDetails;
