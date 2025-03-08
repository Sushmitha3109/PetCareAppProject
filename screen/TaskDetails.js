import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';

const TaskDetails = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Error', 'No user is logged in.');
          return;
        }

        const taskCollectionRef = collection(db, 'tasks');
        const q = query(taskCollectionRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const userTasks = querySnapshot.docs.map(doc => {
          const data = doc.data();
          let taskDate = data.taskDate;

          // Ensure taskDate is a valid Date object
          if (taskDate?.toDate) {
            taskDate = taskDate.toDate(); // Convert Firestore Timestamp
          } else if (typeof taskDate === 'string') {
            taskDate = new Date(taskDate); // Convert string date
          } else {
            taskDate = new Date(); // Default to current date if invalid
          }

          return {
            id: doc.id,
            ...data,
            taskDate,
          };
        });

        const validTasks = userTasks.filter(task => task.taskDate instanceof Date && !isNaN(task.taskDate));
        const sortedTasks = validTasks.sort((a, b) => b.taskDate - a.taskDate);

        setTasks(sortedTasks);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch tasks.');
        console.error('Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const markAsCompleted = async (taskId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);

      if (!taskDoc.exists()) {
        Alert.alert("Error", "Task not found!");
        return;
      }

      await updateDoc(taskRef, { taskStatus: 'Completed' });

      // Update notification status if exists
      const notificationQuery = query(
        collection(db, 'notifications'),
        where('taskId', '==', taskId)
      );
      const notificationSnapshot = await getDocs(notificationQuery);
      if (!notificationSnapshot.empty) {
        notificationSnapshot.forEach(async (notificationDoc) => {
          const notificationRef = doc(db, 'notifications', notificationDoc.id);
          await updateDoc(notificationRef, { status: 'Completed' });
        });
      }

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, taskStatus: 'Completed' } : task
        )
      );

      Alert.alert("Success", "Task marked as completed!");
    } catch (error) {
      console.error("🔥 Update Error:", error);
      Alert.alert("Error", "Failed to update task.");
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB');
  };

  const isPastDate = (taskDate) => {
    if (!(taskDate instanceof Date)) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return taskDate < today;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Task Details</Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('AddTaskDetails')}>
          <Ionicons name="add-circle" size={40} color="#9b59b6" />
          <Text style={styles.text}> Add Details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('ViewTaskDetails')}>
          <Ionicons name="eye" size={40} color="#9b59b6" />
          <Text style={styles.text}>View Details</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#9b59b6" style={styles.loader} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const pastTask = isPastDate(item.taskDate) && item.taskStatus === 'Pending';

            return (
              <View style={styles.taskCard}>
                <Text style={styles.taskText}> Task: {item.taskTitle}</Text>
                <Text style={styles.taskText}> Description: {item.taskDescription || 'No description provided'}</Text>
                <Text style={styles.taskText}> Date: {formatDate(item.taskDate)}</Text>
                <Text style={[styles.status, item.taskStatus === 'Completed' && styles.completed]}>
                  Status: {item.taskStatus}
                </Text>

                {pastTask && (
                  <Text style={styles.missedTask}>⚠️ Missed Task</Text>
                )}

                {/* Hide "Mark as Completed" button if task is from past */}
                {!pastTask && item.taskStatus === 'Pending' && (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => markAsCompleted(item.id)}
                  >
                    <Text style={styles.buttonText}>Mark as Completed</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No tasks available.</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#9b59b6',
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  box: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderRadius: 10,
    elevation: 3,
  },
  text: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  taskText: {
    fontSize: 16,
    color: '#2c3e50',
    marginVertical: 2,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'orange',
  },
  completed: {
    color: 'green',
  },
  missedTask: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
    marginTop: 5,
  },
  completeButton: {
    marginTop: 10,
    backgroundColor: '#27ae60',
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 20,
  },
});

export default TaskDetails;
