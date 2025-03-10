import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { db } from '../config/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { RadioButton } from 'react-native-paper';

const EditPetDetails = ({ route, navigation }) => {
  const { pet } = route.params; 
  const [petName, setPetName] = useState(pet.petName);
  const [species, setSpecies] = useState(pet.species);
  const [breed, setBreed] = useState(pet.breed);
  const [age, setAge] = useState(pet.age);
  const [gender, setGender] = useState(pet.gender);
  const [weight, setWeight] = useState(pet.weight);
  const [color, setColor] = useState(pet.color);
  const [imageBase64, setImageBase64] = useState(pet.imageBase64 || '');

  const handleSave = async () => {
    if (!petName || !species || !breed || !age || !gender || !weight || !color) {
      Alert.alert('Error', 'Please fill out all the fields.');
      return;
    }

    try {
      const petRef = doc(db, 'petdetails', pet.id);
      await updateDoc(petRef, {
        petName,
        species,
        breed,
        age,
        gender,
        weight,
        color,
        imageBase64,
      });
      Alert.alert('Success', 'Pet details updated successfully');
      navigation.navigate('ViewPetDetails');
    } catch (error) {
      console.error('Error updating pet details:', error);
      Alert.alert('Error', 'Failed to update pet details');
    }
  };

  const handleImagePick = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.IMAGES,
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });
  
      if (result.assets && result.assets.length > 0) {
        setImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.header}>Edit Pet Details</Text>

        {imageBase64 ? (
          <Image source={{ uri: imageBase64 }} style={styles.petImage} />
        ) : (
          <Text>No image selected</Text>
        )}

        <TouchableOpacity onPress={handleImagePick} style={styles.imageButton}>
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Pet Name:</Text>
        <TextInput style={styles.input} value={petName} onChangeText={setPetName} />

        <Text style={styles.label}>Species:</Text>
        <Picker selectedValue={species} onValueChange={setSpecies} style={styles.picker}>
          <Picker.Item label='Select Species' value='' />
          <Picker.Item label='Dog' value='dog' />
          <Picker.Item label='Cat' value='cat' />
          <Picker.Item label='Bird' value='bird' />
        </Picker>

        <Text style={styles.label}>Breed:</Text>
        <TextInput style={styles.input} value={breed} onChangeText={setBreed} />

        <Text style={styles.label}>Age:</Text>
        <TextInput style={styles.input} value={age} onChangeText={setAge} />

        <Text style={styles.label}>Gender:</Text>
        <View style={styles.radioGroup}>
          <RadioButton.Group onValueChange={setGender} value={gender}>
            <View style={styles.radioButtonContainer}>
              <RadioButton value='male' />
              <Text>Male</Text>
            </View>
            <View style={styles.radioButtonContainer}>
              <RadioButton value='female' />
              <Text>Female</Text>
            </View>
          </RadioButton.Group>
        </View>

        <Text style={styles.label}>Weight (kg):</Text>
        <TextInput style={styles.input} value={weight} onChangeText={setWeight} />

        <Text style={styles.label}>Color:</Text>
        <TextInput style={styles.input} value={color} onChangeText={setColor} />

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#9b59b6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  imageButton: {
    backgroundColor: '#9b59b6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
});

export default EditPetDetails;
