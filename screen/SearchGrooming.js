import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Alert, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig"; 
import { getDistance } from "geolib";

const SearchGrooming = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [groomingShops, setGroomingShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNearbyGroomingShops();
  }, []);

  const fetchNearbyGroomingShops = async () => {
    setLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Enable location to find nearby shops.");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });

      console.log("User Location:", latitude, longitude);

      const shopsRef = collection(db, "groomingplace");
      const snapshot = await getDocs(shopsRef);

      let shopsList = [];
      snapshot.forEach((doc) => {
        let data = doc.data();
        if (data.geolocation && data.geolocation.latitude && data.geolocation.longitude) {
          let shopLat = data.geolocation.latitude;
          let shopLng = data.geolocation.longitude;
          let distance = getDistance(
            { latitude, longitude },
            { latitude: shopLat, longitude: shopLng }
          );

          shopsList.push({ id: doc.id, ...data, distance });
        } else {
          console.warn(`Skipping shop ${doc.id}: Missing geolocation`);
        }
      });

      if (shopsList.length === 0) {
        Alert.alert("No Nearby Shops", "No grooming shops found in your area.");
      }

      shopsList.sort((a, b) => a.distance - b.distance);
      setGroomingShops(shopsList);
    } catch (error) {
      Alert.alert("Error", "Something went wrong while fetching data.");
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Nearby Grooming Places</Text>

      {loading && <ActivityIndicator size="large" color="#9b59b6" style={styles.loader} />}

      {userLocation && (
        <Text style={styles.locationText}>
          Your Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
        </Text>
      )}

      <FlatList
        data={groomingShops}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.shopName}>{item.shopName}</Text>
            <Text>Distance: {(item.distance / 1000).toFixed(2)} km</Text>
            <Text>Location: {item.location}</Text>
            <Text>Contact: {item.contactNumber}</Text>
            <Text>Opening Hours: {item.openingHours}</Text>
            <Text>Pricing: {item.pricingRange}</Text>
            <Text>Services: {item.services}</Text>
          </View>
        )}
        ListEmptyComponent={!loading && <Text style={styles.noShopsText}>No grooming shops found nearby.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#9b59b6" },
  loader: { marginVertical: 20 },
  locationText: { fontSize: 16, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  card: { padding: 15, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 10, backgroundColor: "#fff", elevation: 2 },
  shopName: { fontSize: 18, fontWeight: "bold", color: "#9b59b6",marginBottom: 15 },
  noShopsText: { fontSize: 16, textAlign: "center", color: "#777" },
});

export default SearchGrooming;
