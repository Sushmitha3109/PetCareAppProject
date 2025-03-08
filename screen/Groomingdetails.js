import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebaseConfig';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

const GroomingDetails = ({ navigation }) => {
  const [groomingData, setGroomingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fetchGroomingData = async () => {
    setRefreshing(true); // Ensure refresh indicator activates
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'No user is logged in.');
        return;
      }

      const groomingCollectionRef = collection(db, 'grooming');
      const querySnapshot = await getDocs(groomingCollectionRef);
      const userGroomingData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.userId === user.uid)
        .sort((a, b) => (b.groomingDate?.seconds || 0) - (a.groomingDate?.seconds || 0)); 

      setGroomingData(userGroomingData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch grooming details.');
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGroomingData();
  }, [navigation]); // Fetch data when navigating back

  const markAsCompleted = async (id, petName, groomingDate) => {
    try {
      const groomingRef = doc(db, 'grooming', id);
      await updateDoc(groomingRef, { status: 'Completed' });

      if (!groomingDate?.seconds) return;

      const notificationQuery = query(
        collection(db, 'notifications'),
        where('petName', '==', petName),
        where('groomingDate', '==', groomingDate.seconds),
        where('notificationType', '==', 'Grooming Reminder')
      );

      const notificationSnapshot = await getDocs(notificationQuery);

      if (!notificationSnapshot.empty) {
        notificationSnapshot.forEach(async (notificationDoc) => {
          const notificationRef = doc(db, 'notifications', notificationDoc.id);
          await updateDoc(notificationRef, { status: 'Completed' });
        });
      }

      setGroomingData(prevData => prevData.map(item => item.id === id ? { ...item, status: 'Completed' } : item));
      Alert.alert('Success', 'Grooming marked as completed!');
    } catch (error) {
      console.error('Update Error:', error);
      Alert.alert('Error', 'Failed to update grooming status.');
    }
  };

  if (loading) {
    return <ActivityIndicator size='large' color='#9b59b6' style={styles.loader} />;
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchGroomingData} />
      }
    >
      <Text style={styles.header}>Grooming Details</Text>
      
      <View style={styles.grid}>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('AddGroomingDetails')}>
          <Ionicons name='add-circle' size={40} color='#9b59b6' />
          <Text style={styles.text}>Add Grooming</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('ViewGroomingDetails')}>
          <Ionicons name='eye' size={40} color='#9b59b6' />
          <Text style={styles.text}>View Grooming</Text>
        </TouchableOpacity>
      </View>

      {groomingData.map((item) => {
        const groomingDate = item.groomingDate?.seconds
          ? new Date(item.groomingDate.seconds * 1000)
          : null;
        
        if (groomingDate) groomingDate.setHours(0, 0, 0, 0);

        const isToday = groomingDate && groomingDate.getTime() === today.getTime();
        const isPast = groomingDate && groomingDate.getTime() < today.getTime();

        return (
          <View key={item.id} style={styles.card}>
            <Text style={styles.infoText}>Pet Name: {item.petName}</Text>
            <Text style={styles.infoText}>Grooming Type: {item.groomingType}</Text>
            <Text style={styles.infoText}>
              Grooming Date: {groomingDate ? groomingDate.toLocaleDateString('en-GB') : 'Not Set'}
            </Text>
            <Text style={[styles.status, item.status === 'Completed' ? styles.completed : styles.pending]}>
              Status: {item.status}
            </Text>

            {item.status === 'Pending' && isPast ? (
              <Text style={styles.missedAlert}> ⚠️ Missed Grooming!</Text>
            ) : (
              item.status === 'Pending' && isToday && (
                <>
                  <TouchableOpacity style={styles.searchButton} onPress={() => navigation.navigate('SearchGrooming')}>
                    <Text style={styles.buttonText}>Search Nearby Grooming</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => markAsCompleted(item.id, item.petName, item.groomingDate)}>
                    <Text style={styles.buttonText}>Mark as Completed</Text>
                  </TouchableOpacity>
                </>
              )
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f9f9f9', flexGrow: 1 },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#9b59b6' },
  grid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  box: { backgroundColor: '#fff', padding: 20, alignItems: 'center', borderRadius: 10, elevation: 3 },
  text: { marginTop: 10, fontSize: 14, fontWeight: 'bold' },
  card: { padding: 15, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 10, backgroundColor: '#fff', elevation: 2 },
  infoText: { fontSize: 16, color: '#2c3e50', marginVertical: 2 },
  status: { fontSize: 16, fontWeight: 'bold' },
  completed: { color: 'green' },
  pending: { color: 'orange' },
  missedAlert: { fontSize: 16, fontWeight: 'bold', color: 'red', textAlign: 'center', marginTop: 10 },
  button: { backgroundColor: '#9b59b6', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' },
  searchButton: { backgroundColor: '#3498db', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default GroomingDetails;
