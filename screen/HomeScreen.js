import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { auth, db } from '../config/firebaseConfig';
import SearchScreen from './SearchScreen';
import NotificationsScreen from './NotificationsScreen';
import SettingsScreen from './SettingsScreen';
import { useRoute } from "@react-navigation/native";

const Dashboard = ({ navigation, }) => {
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
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('PetDetails')}>
          <Ionicons name="paw-outline" size={40} color="#9b59b6" />
          <Text style={styles.text}>Pet Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('TaskDetails')}>
          <Ionicons name="create-outline" size={40} color="#9b59b6" />
          <Text style={styles.text}>Add Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('GroomingDetails')}>
          <Ionicons name="cut-outline" size={40} color="#9b59b6" />
          <Text style={styles.text}>Grooming Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('HealthIssues')}>
          <Ionicons name="medkit-outline" size={40} color="#9b59b6" />
          <Text style={styles.text}>Add Health Issues</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('ViewTask')}>
          <Ionicons name="list-outline" size={40} color="#9b59b6" />
          <Text style={styles.text}>View Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={40} color="#9b59b6" />
          <Text style={styles.text}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Tab = createBottomTabNavigator();

const HomeScreen = () => {
  const route = useRoute();
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    if (route.params?.badgeCount !== undefined) {
      setBadgeCount(route.params.badgeCount);
    }
  }, [route.params?.badgeCount]);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Search') iconName = 'search-outline';
          else if (route.name === 'Notifications') iconName = 'notifications-outline';
          else if (route.name === 'Settings') iconName = 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#9b59b6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarBadge: route.params?.badgeCount > 0 ? route.params.badgeCount : null,
      })}
    >
      <Tab.Screen name="Home" component={Dashboard} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
      />
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

export default HomeScreen;