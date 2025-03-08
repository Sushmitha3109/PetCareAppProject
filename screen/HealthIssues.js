import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

const HealthIssues = ({ navigation }) => {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealthData = async () => {
    setRefreshing(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'No user is logged in.');
        return;
      }

      const healthCollectionRef = collection(db, 'healthissues');
      const q = query(healthCollectionRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const userHealthData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => {
          const dateA = a.vetVisitDate
            ? a.vetVisitDate instanceof Timestamp
              ? a.vetVisitDate.toDate()
              : new Date(a.vetVisitDate)
            : new Date(0);
          const dateB = b.vetVisitDate
            ? b.vetVisitDate instanceof Timestamp
              ? b.vetVisitDate.toDate()
              : new Date(b.vetVisitDate)
            : new Date(0);
          return dateB - dateA; // Sort descending (newest first)
        });

      setHealthData(userHealthData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch health issues.');
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchHealthData();
    }, [])
  );

  const onRefresh = () => {
    fetchHealthData();
  };

  const markAsResolved = async (id, petName, vetVisitDate) => {
    try {
      const healthRef = doc(db, 'healthissues', id);
      await updateDoc(healthRef, { status: 'Completed' });

      const notificationsRef = collection(db, 'notifications');
      const q = vetVisitDate
        ? query(
            notificationsRef,
            where('petName', '==', petName),
            where('notificationType', '==', 'Vet Visit Reminder'),
            where('vetVisitDate', '==', vetVisitDate)
          )
        : query(
            notificationsRef,
            where('petName', '==', petName),
            where('notificationType', '==', 'Vet Visit Reminder')
          );

      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (docSnapshot) => {
        const notificationRef = doc(db, 'notifications', docSnapshot.id);
        await updateDoc(notificationRef, { status: 'Completed' });
      });

      setHealthData(prevData =>
        prevData.map(item => (item.id === id ? { ...item, status: 'Completed' } : item))
      );

      Alert.alert('Success', 'Health issue and notification marked as Completed!');
    } catch (error) {
      console.error('Update Error:', error);
      Alert.alert('Error', 'Failed to update health status and notification.');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not Scheduled';

    let jsDate;
    if (date instanceof Timestamp) {
      jsDate = date.toDate();
    } else {
      jsDate = new Date(date);
    }

    return jsDate.toLocaleDateString('en-GB');
  };

  const isPastDate = (date) => {
    if (!date) return false;
    if (date instanceof Timestamp) {
      date = date.toDate();
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isToday = (date) => {
    if (date instanceof Timestamp) {
      date = date.toDate();
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.toDateString() === today.toDateString();
  };

  if (loading) {
    return <ActivityIndicator size='large' color='#9b59b6' style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Health Issues</Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('AddHealthIssues')}>
          <Ionicons name='add-circle' size={40} color='#9b59b6' />
          <Text style={styles.text}>Add Health Issue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('ViewHealthIssues')}>
          <Ionicons name='eye' size={40} color='#9b59b6' />
          <Text style={styles.text}>View Health Issues</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={healthData}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const vetVisitDate = item.vetVisitDate instanceof Timestamp ? item.vetVisitDate.toDate() : new Date(item.vetVisitDate);
          return (
            <View style={styles.card}>
              <Text style={styles.infoText}> Pet Name: {item.petName}</Text>
              <Text style={styles.infoText}> Issue: {item.issueTitle}</Text>
              <Text style={styles.infoText}> Next Vet Visit: {formatDate(item.vetVisitDate)}</Text>
              {isPastDate(vetVisitDate) && item.status === 'Pending' ? (
                <Text style={[styles.status, styles.missed]}> ⚠️ Missed Vet Visit</Text>
              ) : (
                <Text style={[styles.status, item.status === 'Completed' ? styles.completed : styles.pending]}>
                  Status: {item.status}
                </Text>
              )}
              {isToday(vetVisitDate) && item.status === 'Pending' && (
                <TouchableOpacity style={styles.button} onPress={() => markAsResolved(item.id, item.petName, item.vetVisitDate)}>
                  <Text style={styles.buttonText}>Mark as Completed</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No health issues found.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#9b59b6' },
  grid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  box: { backgroundColor: '#fff', padding: 20, alignItems: 'center', borderRadius: 10, elevation: 3 },
  text: { marginTop: 10, fontSize: 14, fontWeight: 'bold' },
  card: { padding: 15, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 10, backgroundColor: '#fff', elevation: 2 },
  infoText: { fontSize: 16, color: '#2c3e50', marginVertical: 2 },
  status: { fontSize: 16, fontWeight: 'bold' },
  pending: { color: 'orange' },
  completed: { color: 'green' },
  missed: { color: 'red' },
  button: { backgroundColor: '#9b59b6', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#7f8c8d', marginTop: 20 },
});

export default HealthIssues;
