import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db } from "../config/firebaseConfig";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const AddTask = ({ navigation }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [petList, setPetList] = useState([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [taskType, setTaskType] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDate, setTaskDate] = useState(null);
  const [taskReminder, setTaskReminder] = useState(false);
  const [taskStatus, setTaskStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "No user is logged in.");
        return;
      }

      const querySnapshot = await getDocs(collection(db, "petdetails"));
      const pets = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          name: doc.data().petName,
          userId: doc.data().userId,
        }))
        .filter((pet) => pet.userId === user.uid);

      if (pets.length > 0) {
        setPetList(pets);
        setSelectedPet(pets[0].name);
      } else {
        Alert.alert("No pets", "You don't have any pets added.");
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
      Alert.alert("Error", "There was an issue fetching pets.");
    }
  };

  const saveTask = async () => {
    if (!taskTitle || !selectedPet || !taskType || !taskDescription || !taskDate) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "No user is logged in.");
        setLoading(false);
        return;
      }

      const taskRef = await addDoc(collection(db, "tasks"), {
        userId: user.uid,
        taskTitle,
        selectedPet,
        taskType,
        taskDescription,
        taskDate: taskDate.toISOString(),
        taskReminder,
        taskStatus,
      });

      if (taskReminder) {
        await addDoc(collection(db, "notifications"), {
          userId: user.uid,
          taskId: taskRef.id,
          petName: selectedPet,
          notificationType: "Task Reminder",
          message: `Upcoming Task for ${selectedPet} is ${taskDescription} on ${taskDate.toDateString()}`,
          taskDate,
          isRead: false,
          status: "Pending",
        });
      }

      setLoading(false);
      Alert.alert("Success", "Task added successfully!");
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      console.error("Error saving task:", error);
      Alert.alert("Error", "Failed to save task: " + error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add New Task</Text>

      <Text style={styles.label}>Task Title</Text>
      <TextInput style={styles.input} placeholder="Enter Task Title" value={taskTitle} onChangeText={setTaskTitle} />

      <Text style={styles.label}>Select Pet</Text>
      <Picker selectedValue={selectedPet} onValueChange={setSelectedPet} style={styles.picker}>
        <Picker.Item label="Select Pet" value="" />
        {petList.map((pet) => (
          <Picker.Item key={pet.id} label={pet.name} value={pet.name} />
        ))}
      </Picker>

      <Text style={styles.label}>Task Type</Text>
      <TextInput style={styles.input} placeholder="Enter Task Type" value={taskType} onChangeText={setTaskType} />

      <Text style={styles.label}>Task Description</Text>
      <TextInput style={styles.input} placeholder="Enter Task Description" value={taskDescription} onChangeText={setTaskDescription} multiline />

      <Text style={styles.label}>Task Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput style={styles.input} placeholder="Select Task Date" editable={false} value={taskDate ? taskDate.toLocaleDateString() : ""} />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={taskDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            setTaskDate(selectedDate || taskDate);
          }}
        />
      )}

      <Text style={styles.label}>Task Reminder</Text>
      <Picker selectedValue={taskReminder ? "Yes" : "No"} onValueChange={(value) => setTaskReminder(value === "Yes")} style={styles.picker}>
        <Picker.Item label="No" value="No" />
        <Picker.Item label="Yes" value="Yes" />
      </Picker>

      <Text style={styles.label}>Task Status</Text>
      <Picker selectedValue={taskStatus} onValueChange={setTaskStatus} style={styles.picker}>
        <Picker.Item label="Pending" value="Pending" />
        <Picker.Item label="Completed" value="Completed" />
      </Picker>

      <View style={styles.buttonContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#9b59b6" />
        ) : (
          <>
            <TouchableOpacity style={styles.saveButton} onPress={saveTask}>
              <Text style={styles.buttonText}>Save Task</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
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
    marginBottom: 20,
    color:'#9b59b6',
    marginStart: 100,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingLeft: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  picker: {
    height: 55,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 5,
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

export default AddTask;
