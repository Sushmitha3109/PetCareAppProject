import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "../config/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const CompletedTask = () => {
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

        const taskQuery = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          where("taskStatus", "==", "Completed")
        );
        const taskSnapshot = await getDocs(taskQuery);
        const taskList = taskSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          taskDate: doc.data().taskDate ? new Date(doc.data().taskDate) : null,
        }));

        const groomingQuery = query(
          collection(db, "grooming"),
          where("userId", "==", user.uid),
          where("status", "==", "Completed")
        );
        const groomingSnapshot = await getDocs(groomingQuery);
        const groomingList = groomingSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          groomingDate: doc.data().groomingDate ? doc.data().groomingDate.toDate() : null,
        }));

        const healthQuery = query(
          collection(db, "healthissues"),
          where("userId", "==", user.uid),
          where("status", "==", "Completed")
        );
        const healthSnapshot = await getDocs(healthQuery);
        const healthList = healthSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          vetVisitDate: doc.data().vetVisitDate ? doc.data().vetVisitDate.toDate() : null,
        }));

        taskList.sort((a, b) => (b.taskDate ? b.taskDate - a.taskDate : -1));
        groomingList.sort((a, b) => (b.groomingDate ? b.groomingDate - a.groomingDate : -1));
        healthList.sort((a, b) => (b.vetVisitDate ? b.vetVisitDate - a.vetVisitDate : -1));

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

  const getFormattedDate = (date) => {
    return date ? date.toLocaleDateString("en-GB") : "No Date"; 
  };

  const getFilteredData = () => {
    switch (selectedCategory) {
      case "tasks":
        return tasks;
      case "grooming":
        return grooming;
      case "healthIssues":
        return healthIssues;
      default:
        return [];
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Completed Items</Text>

      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Completed Tasks" value="tasks" />
          <Picker.Item label="Completed Grooming" value="grooming" />
          <Picker.Item label="Completed Health Issues" value="healthIssues" />
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#9b59b6" />
      ) : (
        <>
          {getFilteredData().length === 0 ? (
            <Text style={styles.noDataText}>No completed items in this category</Text>
          ) : (
            <FlatList
              data={getFilteredData()}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.itemCard}>
                  {selectedCategory === "tasks" && (
                    <>
                      <Text style={styles.itemTitle}>{item.taskTitle}</Text>
                      <Text style={styles.itemDetails}>Pet Name: {item.selectedPet}</Text>
                      <Text style={styles.itemDetails}>Description: {item.taskDescription}</Text>
                      <Text style={styles.itemDetails}>Date: {getFormattedDate(item.taskDate)}</Text>
                      <Text style={styles.itemDetailsstatus}>Status: {item.taskStatus}</Text>
                    </>
                  )}
                  {selectedCategory === "grooming" && (
                    <>
                      <Text style={styles.itemTitle}>{item.petName || "No Name"}</Text>
                      <Text style={styles.itemDetails}>Grooming Type: {item.groomingType}</Text>
                      <Text style={styles.itemDetails}>Date: {getFormattedDate(item.groomingDate)}</Text>
                      <Text style={styles.itemDetailsstatus}>Status: {item.status}</Text>
                    </>
                  )}
                  {selectedCategory === "healthIssues" && (
                    <>
                      <Text style={styles.itemTitle}>{item.petName || "No Name"}</Text>
                      <Text style={styles.itemDetails}>Health Issue: {item.issueTitle}</Text>
                      <Text style={styles.itemDetails}>Next Vet Visit: {getFormattedDate(item.vetVisitDate)}</Text>
                      <Text style={styles.itemDetailsstatus}>Status: {item.status}</Text>
                    </>
                  )}
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </>
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
  picker: {
    height: 50,
    width: "100%",
  },
  noDataText: {
    fontSize: 16,
    color: "#7f8c8d",
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
    color: "#34495e",
    marginBottom: 3,
  },
  itemDetailsstatus: {
    fontSize: 16,
    color: "lightgreen",
    marginBottom: 3,
    fontWeight: "bold",
  },
});

export default CompletedTask;
