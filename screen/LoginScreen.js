import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, KeyboardAvoidingView, 
ScrollView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { auth } from '../config/firebaseConfig';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Only valid admin emails
  const adminEmails = ["petcareadmin@gmail.com"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (adminEmails.includes(user.email)) {
          navigation.replace("Admin");
        } else {
          navigation.replace("Home");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Logged In:", user.email);

      // Navigate based on user role
      navigation.replace(adminEmails.includes(user.email) ? "Admin" : "Home");
    } catch (error) {
      let message = "Invalid email or password.";
      if (error.code === "auth/user-not-found") message = "No user found with this email.";
      if (error.code === "auth/wrong-password") message = "Incorrect password.";
      Alert.alert('Login Error', message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Image source={require('../assets/dogoutline.jpg')} style={styles.image} />
            <Text style={styles.title}>Pet Care</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            <TextInput 
              style={styles.input} 
              placeholder="Email" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              secureTextEntry 
              value={password} 
              onChangeText={setPassword}
            />

            <TouchableOpacity 
              style={[styles.button, loading && { backgroundColor: '#bbb' }]} 
              onPress={handleLogin} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupText}>Don't have an account? Create</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    paddingHorizontal: 20,
  },
  image: { 
    width: 200, 
    height: 180, 
    resizeMode: 'contain', 
    marginBottom: 20,
  },
  title: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    color: '#333',
    marginBottom: 10,
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666', 
    marginBottom: 20,
  },
  input: { 
    width: '80%', 
    padding: 15, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 10, 
    marginVertical: 10, 
    backgroundColor: '#f9f9f9',
  },
  button: { 
    backgroundColor: '#9b59b6', 
    padding: 15, 
    borderRadius: 10, 
    marginVertical: 10, 
    width: '50%',
    alignItems: 'center',
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold',
  },
  signupText: { 
    marginTop: 20, 
    color: '#666',
  },
});
