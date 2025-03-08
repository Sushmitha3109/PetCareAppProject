import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Switch, Alert, ScrollView, StyleSheet } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

const predefinedServices = ["Bath", "Haircut", "Nail Trimming", "Ear Cleaning", "Teeth Cleaning", "Full Grooming"];

const EditGroomingPlace = ({ route }) => {
  const navigation = useNavigation();
  const { groomingplace } = route.params;

  const [shopName, setShopName] = useState(groomingplace.shopName || "");
  const [contactNumber, setContactNumber] = useState(groomingplace.contactNumber || "");
  const [location, setLocation] = useState(groomingplace.location || "");
  const [latitude, setLatitude] = useState(groomingplace.geolocation?.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(groomingplace.geolocation?.longitude?.toString() || "");
  const [openingHours, setOpeningHours] = useState(groomingplace.openingHours || "");
  const [pricingRange, setPricingRange] = useState(groomingplace.pricingRange || "");
  const [services, setServices] = useState(
    predefinedServices.reduce((acc, service) => {
      acc[service] = groomingplace.services?.includes(service) || false;
      return acc;
    }, {})
  );

  useEffect(() => {
    setServices(
      predefinedServices.reduce((acc, service) => {
        acc[service] = groomingplace.services?.includes(service) || false;
        return acc;
      }, {})
    );
  }, [groomingplace.services]);

  const toggleService = (service) => {
    setServices((prevServices) => ({
      ...prevServices,
      [service]: !prevServices[service],
    }));
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        shopName,
        contactNumber,
        location,
        geolocation: {
          latitude: parseFloat(latitude) || 0,
          longitude: parseFloat(longitude) || 0,
        },
        openingHours,
        pricingRange,
        services: Object.keys(services).filter((service) => services[service]),
      };

      await updateDoc(doc(db, "groomingplace", groomingplace.id), updatedData);
      Alert.alert("Success", "Grooming place updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating grooming place:", error);
      Alert.alert("Error", "Failed to update grooming place.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edit Grooming Place</Text>

      <Text style={styles.subHeader}>Shop Name </Text>
      <TextInput style={styles.input} value={shopName} onChangeText={setShopName} />

      <Text style={styles.subHeader}>Contact Number</Text>
      <TextInput style={styles.input} value={contactNumber} onChangeText={setContactNumber} placeholder="Contact Number" keyboardType="phone-pad" maxLength={10} />

      <Text style={styles.subHeader}>Location </Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Location" />

      <Text style={styles.subHeader}>Latitude </Text>
      <TextInput style={styles.input} value={latitude} onChangeText={setLatitude} placeholder="Latitude" keyboardType="numeric" />

      <Text style={styles.subHeader}>Longitude </Text>
      <TextInput style={styles.input} value={longitude} onChangeText={setLongitude} placeholder="Longitude" keyboardType="numeric" />

      <Text style={styles.subHeader}>Opening Hours </Text>
      <TextInput style={styles.input} value={openingHours} onChangeText={setOpeningHours} placeholder="Opening Hours (e.g., 9AM - 5PM)" />

      <Text style={styles.subHeader}>Pricing Range </Text>
      <TextInput style={styles.input} value={pricingRange} onChangeText={setPricingRange} placeholder="Pricing Range" />

      <Text style={styles.subHeader}>Services Offered</Text>
      {predefinedServices.map((service) => (
        <View key={service} style={styles.serviceItem}>
          <Text style={styles.serviceText}>{service}</Text>
          <Switch value={services[service]} onValueChange={() => toggleService(service)} />
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
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
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  subHeader: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#34495e",
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  serviceText: {
    fontSize: 14,
    color: "#2c3e50",
  },
  saveButton: {
    backgroundColor: "#9b59b6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditGroomingPlace;
