import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { db } from "../config/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

const EditHealthIssue = ({ route, navigation }) => {
    const { issueId } = route.params;

    const [petName, setPetName] = useState(issueId.petName || "");
    const [issueTitle, setIssueTitle] = useState(issueId.issueTitle || "");
    const [severity, setSeverity] = useState(issueId.severity || "");
    const [vetContact, setVetContact] = useState(issueId.vetContact || "");
    const [vetVisitDate, setVetVisitDate] = useState(issueId.vetVisitDate || ""); 
    const [status, setStatus] =useState(issueId.status|| " ");
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const formattedDate = selectedDate.toLocaleDateString("en-GB");
            setVetVisitDate(formattedDate);
        }
    };

    const handleSave = async () => {
        if (!petName || !issueTitle || !severity || !vetContact || !vetVisitDate || !status) {
            Alert.alert("Error", "Please fill out all the fields.");
            return;
        }

        const updatedHealthIssue = {
            petName,
            issueTitle,
            severity,
            vetContact,
            vetVisitDate,
            status,
        };

        try {
            const issueRef = doc(db, "healthissues", issueId.id);
            await updateDoc(issueRef, updatedHealthIssue);
            Alert.alert("Success", "Health details updated successfully");
            navigation.navigate("ViewHealthIssues");
        } catch (error) {
            console.error("Error updating health details: ", error);
            Alert.alert("Error", "Failed to update health details");
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp || !timestamp.seconds) return "No Date";
        const date = new Date(timestamp.seconds * 1000); // Convert Firestore timestamp to JS date
        return date.toLocaleString(); // Format as a readable date-time
      };      

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Edit Health Issue</Text>

            <Text style={styles.label}>Issue Title</Text>
            <TextInput style={styles.input} value={issueTitle} onChangeText={setIssueTitle} />

            <Text style={styles.label}>Pet Name</Text>
            <TextInput style={styles.input} value={petName} onChangeText={setPetName} />

            <Text style={styles.label}>Severity</Text>
            <Picker selectedValue={severity} onValueChange={setSeverity} value={severity} onChangeText={setSeverity} style={styles.picker}>
                <Picker.Item label="Select severity" value="" />
                <Picker.Item label="Mild" value="Mild" />
                <Picker.Item label="Moderate" value="Moderate" />
                <Picker.Item label="Severe" value="Severe" />
            </Picker>

            <Text style={styles.label}>Vet Contact</Text>
            <TextInput style={styles.input} value={vetContact} onChangeText={setVetContact} />

            <Text style={styles.label}>Vet Visit Date</Text>
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.datePickerText}>{formatTimestamp(vetVisitDate)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={vetVisitDate ? new Date(vetVisitDate) : new Date()} 
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}

        <Text style={styles.label}>Status</Text>
        <Picker selectedValue={status} onValueChange={setStatus} style={styles.picker}>
          <Picker.Item label="Pending" value="Pending" />
          <Picker.Item label="Completed" value="Completed" />
        </Picker>

            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
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
        fontSize: 24,
        fontWeight: "bold",
        color: "#9b59b6",
        marginBottom: 20,
        textAlign: "center",
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 10,
        borderRadius: 4,
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
        backgroundColor: "#9b59b6",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
});

export default EditHealthIssue;
