import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { RadioButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { db } from "../config/firebaseConfig";
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

const AddProfile = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [profileId, setProfileId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const profilesRef = collection(db, "profiles");
      const q = query(profilesRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const profileDoc = querySnapshot.docs[0];
        const profileData = profileDoc.data();

        setProfileId(profileDoc.id);
        setUsername(profileData.username || '');
        setAge(profileData.age ? profileData.age.toString() : '');
        setGender(profileData.gender || 'male');
        setAddress(profileData.address || '');
        setPhoneNumber(profileData.phoneNumber || '');
        setImageUrl(profileData.imageUrl || '');

        setIsEditing(false); 
      } else {
        setIsEditing(true); 
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Failed to fetch profile data.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.IMAGES,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const saveProfileDetails = async () => {
    if (!username || !age || !address || !phoneNumber || !imageUrl) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    try {
      if (profileId) {
        const profileRef = doc(db, "profiles", profileId);
        await updateDoc(profileRef, {
          username,
          age,
          gender,
          address,
          phoneNumber,
          imageUrl,
        });

        Alert.alert("Success", "Profile updated!");
      } else {
        await addDoc(collection(db, "profiles"), {
          email: user.email,
          username,
          age,
          gender,
          address,
          phoneNumber,
          imageUrl,
        });

        Alert.alert("Success", "Profile created!");
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Profile Details</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#9b59b6" />
      ) : (
        <>
          <TouchableOpacity style={styles.imagePicker} onPress={isEditing ? pickImage : null}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.profileImage} />
            ) : (
              <Text style={styles.placeholderText}>Pick Profile Image</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} editable={false} />

          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} editable={isEditing} />

          <Text style={styles.label}>Age</Text>
          <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" editable={isEditing} />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.radioGroup}>
            <RadioButton.Group onValueChange={setGender} value={gender}>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="male" disabled={!isEditing} />
                <Text>Male</Text>
              </View>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="female" disabled={!isEditing} />
                <Text>Female</Text>
              </View>
            </RadioButton.Group>
          </View>

          <Text style={styles.label}>Address</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} editable={isEditing} />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" editable={isEditing} maxLength={10} />

          <View style={styles.buttonContainer}>
            {isEditing ? (
              <TouchableOpacity style={styles.saveButton} onPress={saveProfileDetails}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  imagePicker: {
    height: 150,
    width: 150,
    backgroundColor: '#ecf0f1',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  placeholderText: {
    color: '#7f8c8d',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#34495e',
  },
  input: {
    height: 45,
    borderColor: '#bdc3c7',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#9b59b6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  editButton:{
    backgroundColor: "#9b59b6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: "#9b59b6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddProfile;
