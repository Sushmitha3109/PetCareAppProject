import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { db, auth } from '../config/firebaseConfig'; // Import auth
import { doc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from '@react-native-picker/picker';

const EditTask = ({ route, navigation }) => {
    const { taskId = {} } = route.params || {};

    const [taskTitle, setTaskTitle] = useState(taskId?.taskTitle || '');
    const [selectedPet, setSelectedPet] = useState(taskId?.selectedPet || '');
    const [taskType, setTaskType] = useState(taskId?.taskType || '');
    const [taskDescription, setTaskDescription] = useState(taskId?.taskDescription || '');
    const [taskDate, setTaskDate] = useState(taskId?.taskDate ? new Date(taskId.taskDate) : new Date());
    const [taskStatus, setTaskStatus] = useState(taskId?.taskStatus || 'Pending');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [petList, setPetList] = useState([]);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    Alert.alert("Error", "User not logged in");
                    return;
                }

                const userId = user.uid; 
                const petQuery = query(collection(db, 'petdetails'), where('userId', '==', userId));
                const querySnapshot = await getDocs(petQuery);

                const pets = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().petName
                }));

                setPetList(pets);
            } catch (error) {
                console.error("Error fetching pets:", error);
            }
        };

        fetchPets();
    }, []);

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setTaskDate(selectedDate);
        }
    };

    const saveTask = async () => {
        if (!taskTitle || !selectedPet || !taskType || !taskDescription || !taskDate || !taskStatus) {
            Alert.alert("Error", "Please fill all required fields.");
            return;
        }

        const updatedTask = {
            taskTitle,
            selectedPet,
            taskType,
            taskDescription,
            taskDate: taskDate.toISOString(),
            taskStatus,
        };

        try {
            const taskRef = doc(db, 'tasks', taskId.id);
            await updateDoc(taskRef, updatedTask);
            Alert.alert('Success', 'Task details updated successfully');
            navigation.navigate('ViewTaskDetails');
        } catch (error) {
            console.error('Error updating Task details: ', error);
            Alert.alert('Error', 'Failed to update Task details');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Edit Task</Text>

            <Text style={styles.label}>Task Title</Text>
            <TextInput style={styles.input} value={taskTitle} onChangeText={setTaskTitle} />

            <Text style={styles.label}>Pet Name</Text>
            <Picker
                selectedValue={selectedPet}
                onValueChange={(itemValue) => setSelectedPet(itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="Select a Pet" value="" />
                {petList.map((pet) => (
                    <Picker.Item key={pet.id} label={pet.name} value={pet.name} />
                ))}
            </Picker>

            <Text style={styles.label}>Task Type</Text>
            <TextInput style={styles.input} value={taskType} onChangeText={setTaskType} />

            <Text style={styles.label}>Task Description</Text>
            <TextInput style={styles.input} value={taskDescription} onChangeText={setTaskDescription} />

            <Text style={styles.label}>Task Date</Text>
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.datePickerText}>{taskDate ? taskDate.toLocaleDateString("en-GB") : "Select Date"}</Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={taskDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}

            <Text style={styles.label}>Status:</Text>
            <Picker
                selectedValue={taskStatus}
                onValueChange={setTaskStatus}
                style={styles.picker}
            >
                <Picker.Item label="Pending" value="Pending" />
                <Picker.Item label="Completed" value="Completed" />
            </Picker>            

            <TouchableOpacity onPress={saveTask} style={styles.saveButton}>
                <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#9b59b6',
        marginBottom: 20,
        textAlign: 'center',
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
        marginBottom: 15,
        borderRadius: 5,
    },
    picker: {
        height: 50,
        backgroundColor: "#ecf0f1",
        marginBottom: 15,
        borderRadius: 8,
    },
    datePickerButton: {
        padding: 12,
        backgroundColor: "#ecf0f1",
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 15,
    },
    datePickerText: {
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#9b59b6',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default EditTask;
