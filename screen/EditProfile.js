import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db, auth } from '../config/firebaseConfig';
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const EditProfile = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({
        username: '',
        age: '',
        gender: '',
        address: '',
        phoneNumber: '',
        imageUrl: '',
    });
    const [docId, setDocId] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
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
                const docData = querySnapshot.docs[0];
                setProfile(docData.data());
                setDocId(docData.id);
            } else {
                console.log("No profile found for this user.");
            }
        } catch (error) {
            console.error("Error fetching profile: ", error);
        }
    };

    const handleUpdateProfile = async () => {
        if (!docId) {
            Alert.alert("Error", "Profile not found.");
            return;
        }

        try {
            const profileRef = doc(db, "profiles", docId);
            await updateDoc(profileRef, profile);

            Alert.alert("Success", "Profile updated successfully!");
            navigation.goBack();
        } catch (error) {
            console.error("Error updating profile: ", error);
            Alert.alert("Error", "Could not update profile.");
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Denied", "We need access to your gallery.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.IMAGE, 
            allowsEditing: true,
            aspect: [1, 1],
            base64: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            const newImageUrl = `data:image/jpeg;base64,${result.assets[0].base64}`;

            setProfile({ ...profile, imageUrl: newImageUrl });

            if (docId) {
                try {
                    const profileRef = doc(db, "profiles", docId);
                    await updateDoc(profileRef, { imageUrl: newImageUrl });
                } catch (error) {
                    console.error("Error updating image in Firestore: ", error);
                    Alert.alert("Error", "Could not update image.");
                }
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Edit Profile</Text>

            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                <Image
                    source={profile.imageUrl ? { uri: profile.imageUrl } : require('../assets/default.jpg')}
                    style={styles.profileImage}
                />
                <Text style={styles.changeText}>Change Profile Picture</Text>
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                placeholder="Username"
                value={profile.username}
                onChangeText={(text) => setProfile({ ...profile, username: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Age"
                value={profile.age}
                onChangeText={(text) => setProfile({ ...profile, age: text })}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Gender"
                value={profile.gender}
                onChangeText={(text) => setProfile({ ...profile, gender: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Address"
                value={profile.address}
                onChangeText={(text) => setProfile({ ...profile, address: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={profile.phoneNumber}
                onChangeText={(text) => setProfile({ ...profile, phoneNumber: text })}
                keyboardType="phone-pad"
                maxLength={10}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#9b59b6',
        marginBottom: 20,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#9b59b6',
    },
    changeText: {
        fontSize: 14,
        color: '#9b59b6',
        marginTop: 5,
    },
    input: {
        width: '90%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    saveButton: {
        marginTop: 20,
        backgroundColor: '#9b59b6',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        width: '80%',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditProfile;
