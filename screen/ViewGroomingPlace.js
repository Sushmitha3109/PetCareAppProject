import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from '@expo/vector-icons';

const ViewGroomingPlace = () => {
  const [groomingplace, setGroomingPlace] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    fetchGroomingPlace();
  }, []);

  const fetchGroomingPlace = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const q = query(collection(db, "groomingplace"));
      const querySnapshot = await getDocs(q);
      const groomingList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));


      setGroomingPlace(groomingList);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
      try {
        await deleteDoc(doc(db, "groomingplace", id));
        setGroomingData(prevData => prevData.filter(item => item.id !== id));
        Alert.alert("Deleted!", "Grooming details have been removed.");
      } catch (error) {
        console.error("Delete Error:", error);
        Alert.alert("Error", "Failed to delete grooming details.");
      }
    };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Shop Name: {item.shopName}</Text>
      <Text style={styles.date}>Contact Number: {item.contactNumber}</Text>
      <Text style={styles.date}>Location: {item.location}</Text>
      <Text style={styles.date}>Latitude: {item.geolocation.latitude}</Text>
      <Text style={styles.date}>Longitude: {item.geolocation.longitude}</Text>
      <Text style={styles.date}>Opening Hours: {item.openingHours}</Text>
      <Text style={styles.date}>Pricing Range: {item.pricingRange}</Text>
      <Text style={styles.date}>Services: {item.services}</Text>

      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("EditGroomingPlace", { groomingplace: item })}>
          <AntDesign name="edit" size={24} color="#9b59b6" /><Text>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <AntDesign name="delete" size={24} color="red" /><Text>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Grooming Place Details</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#9b59b6" />
      ) : groomingplace.length === 0 ? (
          <Text style={styles.nohealthissues}>No Grooming Updated Here.</Text>
      ) : (
        <FlatList
          data={groomingplace}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onRefresh={fetchGroomingPlace}
          refreshing={loading}
        />
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
    textAlign: "center",
    marginBottom: 15,
    color: "#9b59b6",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#9b59b6",
    marginTop: 5,
    marginBottom:20,
  },
  date: {
    fontSize: 16,

    color: "#2c3e50",
    marginTop: 10,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  nohealthissues:{
    textAlign: "center",
     fontSize: 16,
      color: "#7f8c8d" 
  },
});

export default ViewGroomingPlace;
