import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import { db } from "../config/firebaseConfig";
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 
import { AntDesign } from '@expo/vector-icons';

const ViewTaskDetails = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          Alert.alert("Error", "No user is logged in.");
          return;
        }

        const taskQuery = query(collection(db, "tasks"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(taskQuery);

        const taskList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          taskDate: doc.data().taskDate ? new Date(doc.data().taskDate) : null,
        }));
        taskList.sort((a, b) => (b.taskDate ? b.taskDate - a.taskDate : -1));
        setTasks(taskList);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        Alert.alert("Error", "There was an issue fetching tasks.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchTasks();
  }, []);
  

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      Alert.alert("Success", "Task deleted successfully!");
      setTasks(tasks.filter((task) => task.id !== taskId)); 
    } catch (error) {
      console.error("Error deleting task:", error);
      Alert.alert("Error", "There was an issue deleting the task.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>View Tasks</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#9b59b6" />
      ) : tasks.length === 0 ? (
        <Text style={styles.noTasksText}>No tasks available</Text>
      ) : (
        tasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <Text style={styles.taskTitle}>{task.taskTitle}</Text>
            <Text style={styles.taskDetails}>Pet: {task.selectedPet}</Text>
            <Text style={styles.taskDetails}>Type: {task.taskType}</Text>
            <Text style={styles.taskDetails}>Description: {task.taskDescription}</Text>
            <Text style={styles.taskDetails}>Date: {new Date(task.taskDate).toLocaleDateString("en-GB")}</Text>
            <Text style={styles.taskDetails}>Status: {task.taskStatus}</Text>

        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("EditTaskDetails", {taskId:task})}>
            <AntDesign name="edit" size={24} color="#9b59b6" /><Text>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteTask(task.id)}>
            <AntDesign name="delete" size={24} color="red" /><Text>Delete</Text>
          </TouchableOpacity>
        </View>
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
  noTasksText: {
    fontSize: 18,
    color: "#34495e",
    textAlign: "center",
    marginTop: 30,
  },
  taskCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9b59b6",
    marginBottom: 10,
  },
  taskDetails: {
    fontSize: 14,
    marginBottom: 5,
    color: "#34495e",
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});

export default ViewTaskDetails;
