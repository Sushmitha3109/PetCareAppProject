import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

const EditGroomingDetails = ({ route, navigation }) => {
  const { grooming } = route.params;
  const [petName, setPetName] = useState(grooming.petName);
  const [groomingType, setGroomingType] = useState(grooming.groomingType || "Bath");
  const [groomingDate, setGroomingDate] = useState(
    grooming.groomingDate?.seconds
      ? new Date(grooming.groomingDate.seconds * 1000).toISOString().split('T')[0]
      : ''
  );
  const [status, setStatus] = useState(grooming.status);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroomingDetails = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          Alert.alert("Error", "No user is logged in.");
          return;
        }

        const groomingRef = doc(db, "grooming", grooming.id);
        const groomingSnap = await getDoc(groomingRef);

        if (groomingSnap.exists()) {
          const data = groomingSnap.data();
          setPetName(data.petName);
          setGroomingType(data.groomingType || "Bath"); // Ensure valid default
          setGroomingDate(
            data.groomingDate?.seconds
              ? new Date(data.groomingDate.seconds * 1000).toISOString().split('T')[0]
              : ''
          );
          setStatus(data.status);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch grooming details.");
        console.error("Fetch Error:", error);
      }
    };

    fetchGroomingDetails();
  }, []);

  const handleUpdate = async () => {
    if (!petName || !groomingType || !groomingDate || !status) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const groomingRef = doc(db, "grooming", grooming.id);
      await updateDoc(groomingRef, {
        petName,
        groomingType, // Fixed field name
        groomingDate: Timestamp.fromDate(new Date(groomingDate)), // Firestore timestamp fix
        status,
      });

      Alert.alert("Success", "Grooming details updated successfully!");
      navigation.navigate('ViewGroomingDetails');
    } catch (error) {
      console.error("Update Error:", error);
      Alert.alert("Error", "Failed to update grooming details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Grooming Details</Text>

      <Text style={styles.label}>Pet Name:</Text>
      <TextInput
        style={styles.input}
        value={petName}
        onChangeText={setPetName}
      />

      <Text style={styles.label}>Grooming Type:</Text>
      <Picker
        selectedValue={groomingType}
        onValueChange={setGroomingType}
        style={styles.picker}
      >
        <Picker.Item label="Bath" value="Bath" />
        <Picker.Item label="Haircut" value="Haircut" />
        <Picker.Item label="Nail Trim" value="Nail Trim" />
        <Picker.Item label="Ear Cleaning" value="Ear Cleaning" />
        <Picker.Item label="Full Grooming" value="Full Grooming" />
      </Picker>

      <Text style={styles.label}>Grooming Date:</Text>
      <TextInput
        style={styles.input}
        value={groomingDate}
        onChangeText={setGroomingDate}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Status:</Text>
      <Picker
        selectedValue={status}
        onValueChange={setStatus}
        style={styles.picker}
      >
        <Picker.Item label="Pending" value="Pending" />
        <Picker.Item label="Completed" value="Completed" />
      </Picker>

      {loading ? (
        <ActivityIndicator size="large" color="#9b59b6" style={styles.loader} />
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#9b59b6",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  picker: {
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#9b59b6",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loader: {
    marginTop: 20,
  },
});

export default EditGroomingDetails;
