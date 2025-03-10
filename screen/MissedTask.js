import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "../config/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 

const MissedTask = () => {
  const [tasks, setTasks] = useState([]);
  const [grooming, setGrooming] = useState([]);
  const [healthIssues, setHealthIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("tasks");

  useEffect(() => {
    const fetchMissedData = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          Alert.alert("Error", "No user is logged in.");
          setLoading(false);
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const taskQuery = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          where("taskStatus", "==", "Pending")
        );
        const taskSnapshot = await getDocs(taskQuery);
        const missedTasks = taskSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((task) => new Date(task.taskDate) < today);

        const groomingQuery = query(
          collection(db, "grooming"),
          where("userId", "==", user.uid),
          where("status", "==", "Pending")
        );
        const groomingSnapshot = await getDocs(groomingQuery);
        const missedGrooming = groomingSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((groom) => groom.groomingDate?.toDate() < today);

        const healthQuery = query(
          collection(db, "healthissues"),
          where("userId", "==", user.uid),
          where("status", "==", "Pending")
        );
        const healthSnapshot = await getDocs(healthQuery);
        const missedHealthIssues = healthSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((issue) => issue.vetVisitDate?.toDate() < today);

        setTasks(missedTasks);
        setGrooming(missedGrooming);
        setHealthIssues(missedHealthIssues);
      } catch (error) {
        console.error("Error fetching missed data:", error);
        Alert.alert("Error", "There was an issue fetching the missed data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMissedData();
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getFilteredData = () => {
    let data = [];
    switch (selectedCategory) {
      case "tasks":
        data = tasks;
        break;
      case "grooming":
        data = grooming;
        break;
      case "healthIssues":
        data = healthIssues;
        break;
      default:
        return [];
    }

    return data.sort((a, b) => {
      const dateA =
        selectedCategory === "tasks"
          ? new Date(a.taskDate)
          : selectedCategory === "grooming"
          ? new Date(a.groomingDate.toDate())
          : new Date(a.vetVisitDate.toDate());

      const dateB =
        selectedCategory === "tasks"
          ? new Date(b.taskDate)
          : selectedCategory === "grooming"
          ? new Date(b.groomingDate.toDate())
          : new Date(b.vetVisitDate.toDate());

      return dateB - dateA; 
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Missed Items</Text>

      <View style={styles.dropdownContainer}>
        <Picker selectedValue={selectedCategory} onValueChange={(itemValue) => setSelectedCategory(itemValue)}>
          <Picker.Item label="Missed Tasks" value="tasks" />
          <Picker.Item label="Missed Grooming" value="grooming" />
          <Picker.Item label="Missed Health Issues" value="healthIssues" />
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#9b59b6" />
      ) : getFilteredData().length === 0 ? (
        <Text style={styles.noDataText}>No missed items in this category</Text>
      ) : (
        getFilteredData().map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Text style={styles.itemTitle}>{item.selectedPet || item.petName || "Unnamed"}</Text>
            <Text style={styles.itemDetails}>
              {selectedCategory === "tasks"
                ? `Task: ${item.taskDescription}`
                : selectedCategory === "grooming"
                ? `Grooming Type: ${item.groomingType}`
                : `Issue: ${item.issueTitle}`}
            </Text>
            <Text style={styles.itemDetails}>
              Date:{" "}
              {selectedCategory === "tasks"
                ? formatDate(item.taskDate)
                : selectedCategory === "grooming"
                ? formatDate(item.groomingDate.toDate())
                : formatDate(item.vetVisitDate.toDate())}
            </Text>
            <Text style={styles.itemDetailsStatus}>Status: ⚠️ Missed</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#9b59b6",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#9b59b6",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  noDataText: {
    fontSize: 16,
    color: "#9b59b6",
    textAlign: "center",
    marginVertical: 10,
  },
  itemCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9b59b6",
    marginBottom: 10,
  },
  itemDetails: {
    fontSize: 16,
    marginBottom: 5,
    color: "#34495e",
  },
  itemDetailsStatus: {
    fontSize: 16,
    marginBottom: 5,
    color: "red",
  },
});

export default MissedTask;
