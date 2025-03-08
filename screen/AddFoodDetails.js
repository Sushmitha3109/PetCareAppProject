import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const AddFoodDetails = ({ navigation }) => {
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState('Protein');
  const [species, setSpecies] = useState('Dog');
  const [isSafe, setIsSafe] = useState(true);
  const [recipe, setRecipe] = useState('');
  const [alternativeFood, setAlternativeFood] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const addFoodDetail = async () => {
    if (!foodName || !recipe || !alternativeFood || !description) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'fooddetails'), {
        foodName,
        category,
        species,
        isSafe,
        recipe,
        alternativeFood,
        description,
      });

      alert('Food added successfully!');
      setFoodName('');
      setCategory('Protein');
      setSpecies('Dog');
      setIsSafe(true);
      setRecipe('');
      setAlternativeFood('');
      setDescription('');
    } catch (error) {
      console.error('Error adding food:', error);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Food Recommendation</Text>

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

      <TouchableOpacity style={styles.addButton} onPress={addFoodDetail} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addButtonText}>Add Food</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#9b59b6' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  picker: { height: 50, backgroundColor: '#fff', borderColor: '#ddd', borderWidth: 1, borderRadius: 10, marginBottom: 10 },
  input: { height: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, marginBottom: 10, backgroundColor: '#fff' },
  addButton: { backgroundColor: '#9b59b6', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default AddFoodDetails;