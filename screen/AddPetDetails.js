import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { RadioButton } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { db } from "../config/firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const AddPetDetails = ({ navigation }) => {
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState("");
  const [color, setColor] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.IMAGES,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (result.assets && result.assets.length > 0) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const checkExistingPet = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return false;

    const petQuery = query(
      collection(db, "petdetails"),
      where("userId", "==", user.uid),
      where("petName", "==", petName)
    );

    const querySnapshot = await getDocs(petQuery);
    return !querySnapshot.empty;
  };

  const savePetDetails = async () => {
    if (!petName || !species || !breed || !weight || !color || !age || !gender || !image) {
      Alert.alert("Error", "Please fill all fields and select an image.");
      return;
    }

    setLoading(true);

    try {
      const petExists = await checkExistingPet();
      if (petExists) {
        Alert.alert("Error", "A pet with this name already exists!");
        setLoading(false);
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "User not logged in.");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "petdetails"), {
        userId: user.uid,
        petName,
        species,
        breed,
        age,
        gender,
        weight,
        color,
        imageBase64: image,
      });

      setLoading(false);
      Alert.alert("Success", "Pet details saved successfully!");
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Failed to save data: " + error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add New Pet Details</Text>

      <Text style={styles.label}>Pet Name</Text>
      <TextInput style={styles.input} placeholder="Enter Pet Name" value={petName} onChangeText={setPetName} />

      <Text style={styles.label}>Species</Text>
      <Picker selectedValue={species} onValueChange={(itemValue) => setSpecies(itemValue)} style={styles.picker}>
        <Picker.Item label="Select Species" value="" />
        <Picker.Item label="Dog" value="dog" />
        <Picker.Item label="Cat" value="cat" />
        <Picker.Item label="Bird" value="bird" />
      </Picker>

      <Text style={styles.label}>Breed</Text>
      <TextInput style={styles.input} placeholder="Enter Breed" value={breed} onChangeText={setBreed} />

      <Text style={styles.label}>Age</Text>
      <TextInput style={styles.input} placeholder="Enter Age" value={age} onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))} keyboardType="numeric" />

      <Text style={styles.label}>Gender</Text>
      <RadioButton.Group onValueChange={setGender} value={gender}>
        <RadioButton.Item label="Male" value="male" />
        <RadioButton.Item label="Female" value="female" />
      </RadioButton.Group>

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput style={styles.input} placeholder="Enter Weight" value={weight} onChangeText={(text) => setWeight(text.replace(/[^0-9.]/g, ''))} keyboardType="numeric" />

      <Text style={styles.label}>Color</Text>
      <TextInput style={styles.input} placeholder="Enter Color" value={color} onChangeText={setColor} />

      <Text style={styles.label}>Pet Image</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? <Image source={{ uri: image }} style={styles.image} /> : <Text>Select Image</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={savePetDetails}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f9f9f9", flexGrow: 1 },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#9b59b6" },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 5, color: "#34495e" },
  input: { height: 45, borderColor: "#bdc3c7", borderWidth: 1, borderRadius: 8, paddingLeft: 10, backgroundColor: "#fff", marginBottom: 15 },
  picker: { height: 52, backgroundColor: "#fff", borderColor: "#bdc3c7", borderWidth: 1, borderRadius: 8, marginBottom: 15 },
  radioGroup: { flexDirection: "row", marginBottom: 20 },
  radioButtonContainer: { flexDirection: "row", alignItems: "center", marginRight: 15 },
  radioText: { marginLeft: 10, fontSize: 16 },
  imagePicker: { borderWidth: 1, borderColor: "#bdc3c7", padding: 20, alignItems: "center", marginBottom: 10 },
  image: { width: 100, height: 100, borderRadius: 50 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
  saveButton: { backgroundColor: "#9b59b6", padding: 12, borderRadius: 8, flex: 1, marginRight: 10, alignItems: "center" },
  cancelButton: { backgroundColor: "#9b59b6", padding: 12, borderRadius: 8, flex: 1, alignItems: "center" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default AddPetDetails;
