import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { onSnapshot } from 'firebase/firestore';

let unsubscribeFirestore = null; // Store the listener reference

const SettingsScreen = ({ navigation }) => {

  useEffect(() => {
    // 🔴 Stop Firestore listener when component unmounts (optional)
    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      Alert.alert(
        "Logout Confirmation",
        "Are you sure you want to logout?",
        [
          { text: "Cancel", onPress: () => console.log("Logout Cancelled") },
          {
            text: "Logout",
            onPress: async () => {
              try {
                // ✅ Unsubscribe Firestore before logging out
                if (unsubscribeFirestore) {
                  unsubscribeFirestore();
                  unsubscribeFirestore = null;
                }
                
                await signOut(auth);
                console.log("User Logged out");
                navigation.replace('Login'); 
              } catch (error) {
                console.error("Logout Error:", error.message);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  return (
    <View>
      <TouchableOpacity>
        <Text style={styles.Text}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  Text: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 70,
    marginStart: 140,
    color: '#9b59b6',
  },
  button: { 
    backgroundColor: '#9b59b6', 
    padding: 15, 
    borderRadius: 10, 
    marginVertical: 10, 
    width: '40%',
    alignItems: 'center',
    marginTop: 120,
    marginStart: 120,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
