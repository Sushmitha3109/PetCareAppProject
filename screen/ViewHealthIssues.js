import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from '@expo/vector-icons';
import { Timestamp } from "firebase/firestore";

const ViewHealthIssues = () => {
  const [healthIssues, setHealthIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    fetchHealthIssues();
  }, []);

  const fetchHealthIssues = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const q = query(collection(db, "healthissues"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const issuesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        vetVisitDate: doc.data().vetVisitDate ? doc.data().vetVisitDate.toDate() : null,
      }));

      issuesList.sort((a, b) => (b.vetVisitDate ? b.vetVisitDate - a.vetVisitDate : -1));

      setHealthIssues(issuesList);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteHealthIssue = async (id) => {
    Alert.alert("Delete Issue", "Are you sure you want to delete this issue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "healthissues", id));
            Alert.alert("Success", "Health issue deleted successfully!");
            fetchHealthIssues();
          } catch (error) {
            Alert.alert("Error", "Failed to delete issue: " + error.message);
          }
        },
      },
    ]);
  };

  const formatDate = (date) => {
    if (!date) return "Not Scheduled";

    let jsDate;
    if (date instanceof Timestamp) {
      jsDate = date.toDate(); // Convert Firestore Timestamp to JS Date
    } else {
      jsDate = new Date(date);
    }

    return jsDate.toLocaleDateString("en-GB"); // Format: DD-MM-YYYY
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.petName} ({item.issueTitle})</Text>
      <Text style={styles.description}>{item.issueDescription}</Text>
      <Text style={styles.date}>Severity: {item.severity}</Text>
      <Text style={styles.date}>Vet Name: {item.vetContact}</Text>
      <Text style={styles.date}>Status: {item.status}</Text>
      <Text style={styles.date}>Next Vet Visit: {formatDate(item.vetVisitDate)}</Text>

      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("EditHealthIssues", { issueId: item })}>
          <AntDesign name="edit" size={24} color="#9b59b6" /><Text>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteHealthIssue(item.id)}>
          <AntDesign name="delete" size={24} color="red" /><Text>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Health Issues</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#9b59b6" />
      ) : healthIssues.length === 0 ? (
          <Text style={styles.nohealthissues}>No HealthIssues Updated Here.</Text>
      ) : (
        <FlatList
          data={healthIssues}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onRefresh={fetchHealthIssues}
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#9b59b6",
    marginTop: 5,
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  date: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 5,
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

export default ViewHealthIssues; 