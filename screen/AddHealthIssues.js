import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, Switch, ActivityIndicator, RefreshControl } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db } from "../config/firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const AddHealthIssue = ({ navigation }) => {
  const [petList, setPetList] = useState([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [issueTitle, setIssueTitle] = useState("");
  const [severity, setSeverity] = useState("");
  const [treatment, setTreatment] = useState("");
  const [vetContact, setVetContact] = useState("");
  const [ongoingTreatment, setOngoingTreatment] = useState(false);
  const [vetVisitDate, setVetVisitDate] = useState(new Date());
  const [status, setStatus] = useState("Pending");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserPets();
  }, []);

  const fetchUserPets = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "User not logged in.");
        setLoading(false);
        return;
      }

      const q = query(collection(db, "petdetails"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const pets = [];

      querySnapshot.forEach((doc) => {
        pets.push({ id: doc.id, petName: doc.data().petName });
      });

      setPetList(pets);
    } catch (error) {
      Alert.alert("Error", "Failed to load pets.");
    }
    setLoading(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserPets().then(() => setRefreshing(false));
  }, []);

  const saveHealthIssue = async () => {
    if (!selectedPet || !issueTitle || !severity || !vetContact) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      await addDoc(collection(db, "healthissues"), {
        userId: user.uid,
        petName: selectedPet,
        issueTitle,
        severity,
        treatment,
        vetContact,
        ongoingTreatment,
        vetVisitDate,
        status,
      });

      if (vetVisitDate) {
        await addDoc(collection(db, "notifications"), {
          userId: user.uid,
          petName: selectedPet,
          notificationType: "Vet Visit Reminder",
          message: `Upcoming vet visit for ${selectedPet} on ${vetVisitDate.toDateString()}`,
          vetVisitDate,
          isRead: false,
          status: "Pending",
        });
      }

      Alert.alert("Success", "Health issue saved successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save data: " + error.message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.header}>Add Health Issue</Text>

      {loading && <ActivityIndicator size="large" color="#9b59b6" style={{ marginBottom: 10 }} />}

      <Text style={styles.label}>Select Pet</Text>
      <Picker selectedValue={selectedPet} onValueChange={setSelectedPet} style={styles.picker}>
        <Picker.Item label="Choose a pet" value="" />
        {petList.map((pet) => (
          <Picker.Item key={pet.id} label={pet.petName} value={pet.petName} />
        ))}
      </Picker>

      <Text style={styles.label}>Issue Title</Text>
      <TextInput style={styles.input} placeholder="E.g. Skin Allergy" value={issueTitle} onChangeText={setIssueTitle} />

      <Text style={styles.label}>Severity</Text>
      <Picker selectedValue={severity} onValueChange={setSeverity} style={styles.picker}>
        <Picker.Item label="Select severity" value="" />
        <Picker.Item label="Mild" value="Mild" />
        <Picker.Item label="Moderate" value="Moderate" />
        <Picker.Item label="Severe" value="Severe" />
      </Picker>

      <Text style={styles.label}>Treatment Given</Text>
      <TextInput style={styles.input} placeholder="Enter medication or home remedy" value={treatment} onChangeText={setTreatment} />

      <Text style={styles.label}>Vet Contact Info</Text>
      <TextInput style={styles.input} placeholder="Vet Name & Phone" value={vetContact} onChangeText={setVetContact} />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Ongoing Treatment</Text>
        <Switch value={ongoingTreatment} onValueChange={setOngoingTreatment} />
      </View>

      <Text style={styles.label}>Next Vet Visit Date</Text>
      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.datePickerText}>{vetVisitDate.toDateString()}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Status</Text>
      <Picker selectedValue={status} onValueChange={setStatus} style={styles.picker}>
        <Picker.Item label="Pending" value="Pending" />
        <Picker.Item label="Completed" value="Completed" />
      </Picker>

      {showDatePicker && (
        <DateTimePicker
          value={vetVisitDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setVetVisitDate(date);
          }}
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={saveHealthIssue}>
        <Text style={styles.buttonText}>Save Health Issue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f9f9f9", flexGrow: 1 },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#9b59b6" },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 5, color: "#34495e" },
  input: { height: 45, borderColor: "#bdc3c7", borderWidth: 1, borderRadius: 8, paddingLeft: 10, backgroundColor: "#fff", marginBottom: 15 },
  picker: { height: 52, backgroundColor: "#fff", borderColor: "#bdc3c7", borderWidth: 1, borderRadius: 8, marginBottom: 15 },
  datePickerButton: { padding: 12, backgroundColor: "#ecf0f1", borderRadius: 8, alignItems: "center", marginBottom: 15 },
  switchContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  saveButton: { backgroundColor: "#9b59b6", padding: 12, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default AddHealthIssue;
