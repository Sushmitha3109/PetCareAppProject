import React, { useState, useEffect } from 'react';
import { 
  View, Text, Image, TouchableOpacity, FlatList, 
  StyleSheet, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const UserDetails = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'profiles'));
        const userData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          showMore: false, 
        }));
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching user profiles:', error);
      }
      setLoading(false); // Stop loading after fetching data
    };

    fetchUsers();
  }, []);

  const toggleMoreDetails = (id) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, showMore: !user.showMore } : user
      )
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Details</Text>

      {loading ? ( 
        <ActivityIndicator size="large" color="#9b59b6" style={styles.loader} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.imageUrl }} style={styles.profileImage} />
              <View style={styles.infoContainer}>
                <Text style={styles.email}>{item.email}</Text>
                <TouchableOpacity style={styles.moreicon} onPress={() => toggleMoreDetails(item.id)}>
                  <Ionicons name="ellipsis-horizontal-circle-outline" size={30} color="#9b59b6" />
                  <Text>More</Text>
                </TouchableOpacity>
              </View>

              {item.showMore && (
                <View style={styles.moreDetails}>
                  <Text style={styles.detailText}>Name: {item.username}</Text>
                  <Text style={styles.detailText}>Age: {item.age}</Text>
                  <Text style={styles.detailText}>Gender: {item.gender}</Text>
                  <Text style={styles.detailText}>Phone: {item.phoneNumber}</Text>
                  <Text style={styles.detailText}>Address: {item.address}</Text>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#9b59b6' },
  loader: { marginTop: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 3,
    flexDirection: 'column',
  },
  profileImage: { width: 120, height: 120, borderRadius: 40, marginBottom: 10 },
  infoContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  email: { fontSize: 18, fontWeight: 'bold' },
  moreDetails: { marginTop: 20 },
  moreicon: { marginBottom: 12, marginRight: 110 },
  detailText: { fontSize: 14, color: '#555' },
});

export default UserDetails;
