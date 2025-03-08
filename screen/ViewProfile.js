import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { db, auth } from '../config/firebaseConfig'; 
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ViewProfile = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true); 
    
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
          setProfile(null); 
        }
      });

      return () => unsubscribe();
    }, []);

    useEffect(() => {
      if (user) {
        fetchProfileDetails(user.email);
      }
    }, [user]);

    const fetchProfileDetails = async (userEmail) => {
      if (!userEmail) return;

      try {
        const q = query(collection(db, "profiles"), where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setProfile(querySnapshot.docs[0].data());
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error fetching profile: ", error);
      } finally {
        setLoading(false); 
      }
    };

    return (
        <View style={styles.container}>
          {loading ? (  
            <ActivityIndicator size="large" color="#9b59b6" />
          ) : (
            profile ? (
              <View style={styles.card}>
                  <Text style={styles.header}>Profile Details</Text>

                  {profile.imageUrl ? (
                    <Image source={{ uri: profile.imageUrl }} style={styles.profileImage} />
                  ) : (
                    <Image source={require('../assets/default.jpg')} style={styles.profileImage} />
                  )}

                  <View style={styles.row}>
                    <Text style={styles.label}>Username:</Text>
                    <Text style={styles.value}>{profile.username}</Text>
                  </View>
                  
                  <View style={styles.row}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{profile.email}</Text>
                  </View>
      
                  <View style={styles.row}>
                    <Text style={styles.label}>Age:</Text>
                    <Text style={styles.value}>{profile.age}</Text>
                  </View>
      
                  <View style={styles.row}>
                    <Text style={styles.label}>Gender:</Text>
                    <Text style={styles.value}>{profile.gender}</Text>
                  </View>
      
                  <View style={styles.row}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value}>{profile.address}</Text>
                  </View>
      
                  <View style={styles.row}>
                    <Text style={styles.label}>Phone:</Text>
                    <Text style={styles.value}>{profile.phoneNumber}</Text>
                  </View>
              </View>
            ) : (
              <Text style={styles.noProfileText}>No profile found. Please add details.</Text>
            )
          )}
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4,
    marginTop: 130,
    marginBottom: 190,
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#9b59b6',
    textAlign: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#9b59b6',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 2,
  },
  noProfileText: {
    fontSize: 16,
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
  editButton: {
    marginTop: 20,
    backgroundColor: '#9b59b6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: 170,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ViewProfile;
