import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';

const AddGroomingDetails = ({ navigation }) => {
  const [petName, setPetName] = useState('');
  const [groomingType, setGroomingType] = useState('');
  const [groomingDate, setGroomingDate] = useState(new Date());
  const [status, setStatus] = useState('Pending'); 
  const [pets, setPets] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    fetchUserPets();
  }, []);

  const fetchUserPets = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'petdetails'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const petList = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().petName }));
    setPets(petList);
  };

  const handleSave = async () => {
    if (!petName || !groomingType) {
      Alert.alert('Error', 'Please select a pet and grooming type.');
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);

    const groomingData = {
      userId: user.uid,
      petName,
      groomingType,
      groomingDate: Timestamp.fromDate(groomingDate),  // Convert to Firestore Timestamp
      status,
    };

    try {
      await addDoc(collection(db, 'grooming'), groomingData);

      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        petName,
        notificationType: 'Grooming Reminder',
        message: `Grooming appointment for ${petName} on ${groomingDate.toDateString()}`,
        groomingDate: Timestamp.fromDate(groomingDate), 
        isRead: false,
        status: 'Pending',
      });

      Alert.alert('Success', 'Grooming appointment added!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save grooming details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Pet</Text>
      <Picker selectedValue={petName} onValueChange={(itemValue) => setPetName(itemValue)}>
        <Picker.Item label="Select a Pet" value="" />
        {pets.map((pet) => (
          <Picker.Item key={pet.id} label={pet.name} value={pet.name} />
        ))}
      </Picker>

      <Text style={styles.label}>Grooming Type</Text>
      <Picker selectedValue={groomingType} onValueChange={(itemValue) => setGroomingType(itemValue)}>
        <Picker.Item label="Select Grooming Type" value="" />
        <Picker.Item label="Bath" value="Bath" />
        <Picker.Item label="Haircut" value="Haircut" />
        <Picker.Item label="Nail Trim" value="Nail Trim" />
        <Picker.Item label="Ear Cleaning" value="Ear Cleaning" />
        <Picker.Item label="Full Grooming" value="Full Grooming" />
      </Picker>

      <Text style={styles.label}>Grooming Date & Time</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text>{groomingDate.toISOString().split('T')[0]}</Text> 
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={groomingDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setGroomingDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Grooming Status</Text>
      <Picker selectedValue={status} onValueChange={(itemValue) => setStatus(itemValue)}>
        <Picker.Item label="Pending" value="Pending" />
        <Picker.Item label="Completed" value="Completed" />
      </Picker>

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add Grooming</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, padding: 20, backgroundColor: '#f9f9f9' 
  },
  label: { 
    fontSize: 16, fontWeight: 'bold', marginTop: 10 
  },
  input: { 
    borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginTop: 5 
  },
  dateButton: { 
    padding: 12, backgroundColor: '#eee', borderRadius: 8, marginTop: 5, alignItems: 'center' 
  },
  button: { 
    backgroundColor: '#6a1b9a', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 
  },
  buttonText: { 
    color: '#fff', fontSize: 16, fontWeight: 'bold' 
  },
});

export default AddGroomingDetails;
