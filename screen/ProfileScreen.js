import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { collection, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";

const ProfileScreen = ({ navigation }) => {
  const [profileExists, setProfileExists] = useState(false);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    checkProfileExists();
  }, []);

  const checkProfileExists = async () => {
    if (!userId) return;
    const profileRef = doc(collection(db, "profiles"), userId);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      setProfileExists(true);
    } else {
      setProfileExists(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.box, profileExists && styles.disabledButton]}
          onPress={() => !profileExists && navigation.navigate("AddProfile")}
          disabled={profileExists}
        >
          <Ionicons name="person-add" size={40} color={profileExists ? "#95a5a6" : "#9b59b6"} />
          <Text style={styles.text}>{profileExists ? "Profile Exists" : "Add Profile"}</Text>
        </TouchableOpacity>

        {/* View Profile Button */}
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate("ViewProfile")}>
          <Ionicons name="eye" size={40} color="#9b59b6" />
          <Text style={styles.text}>View Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#9b59b6",
  },
  grid: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  box: {
    width: 150,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderRadius: 10,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: "#ecf0f1",
  },
  text: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
