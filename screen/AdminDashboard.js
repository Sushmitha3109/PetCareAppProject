import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../config/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import SearchScreen from './SearchScreen';
import SettingsScreen from './SettingsScreen';

const Dashboard = ({ navigation }) => {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title1}>Welcome {email}</Text>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('UserDetails')}>
          <Ionicons name="person-circle-outline" size={50} color="#9b59b6" />
          <Text style={styles.text}>User Details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('FoodDetails')}>
          <Ionicons name="fast-food-outline" size={50} color="#9b59b6" />
          <Text style={styles.text}>Add Food Details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('GroomingPlaceDetails')}>
          <Ionicons name="cut-outline" size={50} color="#9b59b6" />
          <Text style={styles.text}>Grooming Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Tab = createBottomTabNavigator();

const AdminDashboard = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(() => {
    const user = auth.currentUser;
    if (!user) return;

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, "0")}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getFullYear()}`;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todayNotifications = snapshot.docs.filter((doc) => {
        const data = doc.data();
        const notificationDate = data.taskDate || data.vetVisitDate || data.groomingDate;
        const dateObj = notificationDate instanceof Date ? notificationDate : new Date(notificationDate);
        const notificationFormattedDate = `${dateObj.getDate().toString().padStart(2, "0")}-${(dateObj.getMonth() + 1).toString().padStart(2, "0")}-${dateObj.getFullYear()}`;

        return notificationFormattedDate === formattedDate;
      });
      setUnreadCount(todayNotifications.length);
    });

    return () => unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Search') iconName = 'search-outline';
          else if (route.name === 'Settings') iconName = 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#9b59b6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Dashboard} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#f8f9fa', flex: 1, padding: 20 },
  title: { fontSize: 25, fontWeight: 'bold', textAlign: 'center', color: '#9b59b6' },
  title1: { fontSize: 17, fontWeight: 'bold', marginBottom: 10, color: 'black' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  box: {
    width: '40%',
    backgroundColor: '#fff',
    padding: 20,
    margin: 10,
    alignItems: 'center',
    borderRadius: 10,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: { marginTop: 10, fontSize: 16, fontWeight: 'bold' },
});

export default AdminDashboard;
