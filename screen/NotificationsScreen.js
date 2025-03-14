import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { getAuth } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native"; 

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [badgeCount, setBadgeCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const fetchNotifications = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "User not logged in.");
        setLoading(false);
        return;
      }

      const date = new Date();
      const today = `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`;

      const q = query(collection(db, "notifications"), where("userId", "==", user.uid),where("isRead", "==", false),where("status","==","Pending"));
      const querySnapshot = await getDocs(q);
      const fetchedNotifications = [];
      let count = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        let taskDate = data.taskDate || data.vetVisitDate || data.groomingDate;
        let taskDateFormatted = "";

        if (taskDate instanceof Timestamp) {
          let taskDateObj = taskDate.toDate();
          taskDateFormatted = `${taskDateObj.getDate().toString().padStart(2, "0")}-${(taskDateObj.getMonth() + 1).toString().padStart(2, "0")}-${taskDateObj.getFullYear()}`;
        } else if (typeof taskDate === "string") {
          let taskDateObj = new Date(taskDate);
          taskDateFormatted = `${taskDateObj.getDate().toString().padStart(2, "0")}-${(taskDateObj.getMonth() + 1).toString().padStart(2, "0")}-${taskDateObj.getFullYear()}`;
        }

        let isCurrent = taskDateFormatted === today;

        if (isCurrent) {
          fetchedNotifications.push({
            id: doc.id,
            petName: data.petName,
            notificationType: data.notificationType,
            message: data.message,
            date: data.vetVisitDate || data.taskDate || data.groomingDate,
            isRead: data.isRead || false,
            status: data.status || "Pending",
          });

          if (!data.isRead) {
            count++;
          }
        }
      });

      setBadgeCount(count);
      setNotifications(fetchedNotifications);
      navigation.setParams({ badgeCount: count });

    } catch (error) {
      Alert.alert("Error", "Failed to fetch notifications: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "notifications", id), { isRead: true });
      fetchNotifications(); 
    } catch (error) {
      Alert.alert("Error", "Failed to mark as read: " + error.message);
    }
  };

  const getStatusColor = (status) => {
    if (status === "Pending") return "#e67e22"; // Orange
    if (status === "Completed") return "#27ae60"; // Green
    return "#2c3e50"; // Default color
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>({badgeCount} Unread) Notifications</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#8e44ad" style={styles.loader} />
      ) : notifications.length === 0 ? (
        <Text style={styles.noNotifications}>No notifications available today.</Text>
      ) : (
        <FlatList 
          data={notifications} 
          keyExtractor={(item) => item.id} 
          renderItem={({ item }) => (
            <View style={[styles.notificationCard, item.isRead ? styles.readNotification : styles.unreadNotification]}>
              <Text style={styles.notificationType}>{item.notificationType} ({item.petName})</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                Updated Status: {item.status}
              </Text>
              {!item.isRead && (
                <TouchableOpacity style={styles.markAsReadButton} onPress={() => markAsRead(item.id)}>
                  <Text style={styles.buttonText}>Mark as Read</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          onRefresh={fetchNotifications}
          refreshing={loading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#9b59b6" },
  loader: { marginTop: 20 },
  noNotifications: { textAlign: "center", fontSize: 16, color: "#7f8c8d" },
  notificationCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  unreadNotification: {
    backgroundColor: "#CBC3E3",
  },
  readNotification: {
    backgroundColor: "#d1d8e0",
  },
  notificationType: { fontSize: 19, fontWeight: "bold", color: "#8e44ad", marginBottom: 10 },
  message: { fontSize: 17, color: "#2c3e50", marginTop: 5, marginBottom: 10 },
  markAsReadButton: {
    marginTop: 10,
    backgroundColor: "#9b59b6",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  status: { 
    fontSize: 17, 
    fontWeight: "bold",
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
});

export default NotificationScreen;
