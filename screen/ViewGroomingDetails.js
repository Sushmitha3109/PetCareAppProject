import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator 
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const ViewGroomingDetails = ({ navigation }) => {
  const [groomingData, setGroomingData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch grooming data
  const fetchGroomingData = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "No user is logged in.");
        return;
      }

      const groomingCollectionRef = collection(db, "grooming");
      const querySnapshot = await getDocs(groomingCollectionRef);

      const userGroomingData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(item => item.userId === user.uid)
        .sort((a, b) => (b.groomingDate?.seconds || 0) - (a.groomingDate?.seconds || 0)); // Reverse sorting by date

      setGroomingData(userGroomingData);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch grooming details.");
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the screen is focused (ensures real-time updates)
  useFocusEffect(
    useCallback(() => {
      fetchGroomingData();
    }, [])
  );

  // Delete grooming record
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "grooming", id));
      fetchGroomingData(); // Refresh data after deletion
      Alert.alert("Deleted!", "Grooming details have been removed.");
    } catch (error) {
      console.error("Delete Error:", error);
      Alert.alert("Error", "Failed to delete grooming details.");
    }
  };

  // Render each grooming appointment
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.infoText}>Pet Name: {item.petName}</Text>
      <Text style={styles.infoText}>Grooming Type: {item.groomingType}</Text>
      <Text style={styles.infoText}>
        Grooming Date: 
        {item.groomingDate && item.groomingDate.seconds
          ? new Date(item.groomingDate.seconds * 1000).toLocaleDateString('en-GB')
          : "N/A"}
      </Text>
      <Text style={[styles.status, styles[item.status?.toLowerCase() || "Pending"]]}>
        Grooming Status: {item.status}
      </Text>

      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("EditGroomingDetails", { grooming: item })}>
          <AntDesign name="edit" size={24} color="#9b59b6" /><Text>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <AntDesign name="delete" size={24} color="red" /><Text>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#9b59b6" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Grooming Appointments</Text>
      <FlatList
        data={groomingData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9b59b6",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    color: "#2c3e50",
    marginVertical: 2,
  },
  status: {
    fontSize: 16,
    fontWeight: "bold",
    borderRadius: 5,
    padding: 5,
    marginTop: 5,
  },
  pending: { color: "orange" },
  completed: { color: "green" },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ViewGroomingDetails;