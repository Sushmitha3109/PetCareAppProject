import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList, KeyboardAvoidingView } from "react-native";
import { collection, addDoc, GeoPoint } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

const AddGroomingPlace = ({ navigation }) => {
  const [shopName, setShopName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [pricingRange, setPricingRange] = useState("");
  const [services, setServices] = useState([]);

  const availableServices = ["Bath", "Haircut", "Nail Trim", "Ear Cleaning", "Full Grooming"];

  const toggleService = (service) => {
    setServices((prevServices) =>
      prevServices.includes(service)
        ? prevServices.filter((s) => s !== service)
        : [...prevServices, service]
    );
  };

  const handleSubmit = async () => {
    if (!shopName || !contactNumber || !location || !latitude || !longitude || !openingHours || !pricingRange) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert("Error", "Latitude and Longitude must be numbers.");
      return;
    }

    try {
      await addDoc(collection(db, "groomingplace"), {
        shopName,
        contactNumber,
        location,
        geolocation: new GeoPoint(lat, lng),
        openingHours,
        pricingRange,
        services,
      });

      Alert.alert("Success", "Grooming Place saved successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save data: " + error.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <FlatList
        data={availableServices}
        keyExtractor={(item) => item}
        numColumns={2}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.container}>
            <Text style={styles.header}>Add Grooming Place</Text>

            <Text style={styles.label}>Shop Name:</Text>
            <TextInput style={styles.input} placeholder="Shop Name" value={shopName} onChangeText={setShopName} />

            <Text style={styles.label}>Contact Number:</Text>
            <TextInput style={styles.input} placeholder="Contact Number" keyboardType="phone-pad" value={contactNumber} onChangeText={setContactNumber} maxLength={10} />

            <Text style={styles.label}>Location (Address):</Text>
            <TextInput style={styles.input} placeholder="Enter Location" value={location} onChangeText={setLocation} />

            <Text style={styles.label}>Latitude:</Text>
            <TextInput style={styles.input} placeholder="Enter Latitude" keyboardType="numeric" value={latitude} onChangeText={setLatitude} />

            <Text style={styles.label}>Longitude:</Text>
            <TextInput style={styles.input} placeholder="Enter Longitude" keyboardType="numeric" value={longitude} onChangeText={setLongitude} />

            <Text style={styles.label}>Opening Hours:</Text>
            <TextInput style={styles.input} placeholder="Opening Hours (e.g., 9 AM - 7 PM)" value={openingHours} onChangeText={setOpeningHours} />

            <Text style={styles.label}>Price Range:</Text>
            <TextInput style={styles.input} placeholder="Pricing Range" value={pricingRange} onChangeText={setPricingRange} />

            <Text style={styles.label}>Select Services Offered:</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.serviceButton, services.includes(item) && styles.selectedService]}
            onPress={() => toggleService(item)}
          >
            <Text style={styles.serviceText}>{item}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        }
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#9b59b6",
  },
  input: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#9b59b6",
  },
  serviceButton: {
    flex: 2,
    padding: 10,
    margin: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    alignItems: "center",
  },
  selectedService: {
    backgroundColor: "#9b59b6",
  },
  serviceText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#9b59b6",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width:120,
    marginStart: 120,
    marginBottom: 10,
  },
  submitButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default AddGroomingPlace;
