import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const ViewPetDetails = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) {
          Alert.alert("Error", "User not logged in.");
          return;
        }

        const collectionRef = collection(db, "petdetails");
        const querySnapshot = await getDocs(collectionRef);

        const userPets = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(pet => pet.userId === user.uid);

        setData(userPets);
      } catch (e) {
        Alert.alert("Error", "Failed to fetch pet details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "petdetails", id));
      setData(prevData => prevData.filter(pet => pet.id !== id));
      Alert.alert("Success", "Pet details deleted.");
    } catch (error) {
      Alert.alert("Error", "Could not delete pet.");
    }
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedCard === item.id;

    return (
      <View style={styles.card}>
        <Image
          source={item.imageBase64 ? { uri: item.imageBase64 } : require('../assets/defaultpet.jpg')}
          style={styles.petImage}
        />
        <Text style={styles.petName}>{item.petName}</Text>

        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => setExpandedCard(isExpanded ? null : item.id)}>
            <AntDesign name="ellipsis1" size={24} color="#9b59b6" /><Text>More</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("EditPetDetails", { pet: item })}>
            <AntDesign name="edit" size={24} color="#9b59b6" /><Text>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <AntDesign name="delete" size={24} color="red" /><Text>Delete</Text>
          </TouchableOpacity>
        </View>

        {isExpanded && (
          <View style={styles.detailsContainer}>
            {item.species && <Text style={styles.field}>Species: {item.species}</Text>}
            {item.breed && <Text style={styles.field}>Breed: {item.breed}</Text>}
            {item.age && <Text style={styles.field}>Age: {item.age}</Text>}
            {item.gender && <Text style={styles.field}>Gender: {item.gender}</Text>}
            {item.weight && <Text style={styles.field}>Weight: {item.weight}</Text>}
            {item.color && <Text style={styles.field}>Color: {item.color}</Text>}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pet Details</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#9b59b6" style={styles.loader} />
      ) : (
        <FlatList data={data} keyExtractor={(item) => item.id} renderItem={renderItem} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f9f9f9" },
  header: { fontSize: 24, fontWeight: "bold", color: "#9b59b6", textAlign: "center" },
  card: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 15, marginBottom: 10, backgroundColor: "#fff", elevation: 2 },
  petImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 15, borderWidth: 2, borderColor: '#9b59b6', alignSelf: "center" },
  petName: { fontSize: 18, fontWeight: "bold", color: "#34495e", textAlign: "center" },
  iconContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  detailsContainer: { marginTop: 10, borderTopWidth: 1, borderTopColor: "#ccc", paddingTop: 10 },
  field: { fontSize: 16, color: "#34495e" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default ViewPetDetails;
