import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "../config/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const PendingTask = () => {
  const [tasks, setTasks] = useState([]);
  const [grooming, setGrooming] = useState([]);
  const [healthIssues, setHealthIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("tasks"); 

  useEffect(() => {
    const fetchData = async () => {
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
        const taskList = taskSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((task) => {
            const taskDate = new Date(task.taskDate);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime();
          });

        const groomingQuery = query(
          collection(db, "grooming"),
          where("userId", "==", user.uid),
          where("status", "==", "Pending")
        );
        const groomingSnapshot = await getDocs(groomingQuery);
        const groomingList = groomingSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((grooming) => {
            const groomingDate = grooming.groomingDate?.toDate(); 
            if (!groomingDate) return false; 
            groomingDate.setHours(0, 0, 0, 0);
            return groomingDate.getTime() === today.getTime();
          });

        const healthQuery = query(
          collection(db, "healthissues"),
          where("userId", "==", user.uid),
          where("status", "==", "Pending")
        );

        const healthSnapshot = await getDocs(healthQuery);
        const healthList = healthSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((issue) => {
            if (!issue.vetVisitDate) return false; 
            const vetVisitDate = issue.vetVisitDate.toDate(); 
            vetVisitDate.setHours(0, 0, 0, 0);
            return vetVisitDate.getTime() === today.getTime();
          });

        setTasks(taskList);
        setGrooming(groomingList);
        setHealthIssues(healthList);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "There was an issue fetching the data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Today's Pending Items</Text>
      <View style={styles.dropdownContainer}>
        <Picker selectedValue={selectedCategory} onValueChange={(itemValue) => setSelectedCategory(itemValue)} style={styles.picker}>
          <Picker.Item label="Pending Tasks" value="tasks" />
          <Picker.Item label="Pending Grooming" value="grooming" />
          <Picker.Item label="Pending Health Issues" value="healthIssues" />
        </Picker>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#9b59b6" />
      ) : (
        <FlatList
          data={selectedCategory === "tasks" ? tasks : selectedCategory === "grooming" ? grooming : healthIssues}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <Text style={styles.itemTitle}>{item.petName || item.taskTitle || "No Name"}</Text>
              <Text style={styles.itemDetails}>Description: {item.taskDescription || item.issueTitle || item.groomingType}</Text>
              <Text style={styles.itemDetails}>Date: {formatDate(item.taskDate || item.groomingDate?.toDate() || item.vetVisitDate?.toDate())}</Text>
              <Text style={styles.itemDetailsStatus}>Status: {item.status || item.taskStatus}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#9b59b6" },
  dropdownContainer: { borderWidth: 1, borderColor: "#9b59b6", borderRadius: 8, marginBottom: 15, backgroundColor: "#fff" },
  picker: { height: 50, width: "100%" },
  itemCard: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  itemTitle: { fontSize: 18, fontWeight: "bold", color: "#9b59b6", marginBottom: 10 },
  itemDetails: { fontSize: 16, color: "#34495e", marginBottom: 3 },
  itemDetailsStatus: { fontSize: 16, color: "orange", marginBottom: 3 },
});

export default PendingTask;