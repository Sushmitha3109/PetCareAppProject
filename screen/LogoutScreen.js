import { signOut } from "firebase/auth";
import { Alert } from "react-native";
import { auth } from "../config/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

// Store Firestore listener unsubscribe functions
let unsubscribeListeners = [];

// Function to track Firestore listeners
export const trackListener = (unsubscribeFunction) => {
  unsubscribeListeners.push(unsubscribeFunction);
};

// Function to unsubscribe all listeners
const unsubscribeAllListeners = () => {
  unsubscribeListeners.forEach((unsubscribe) => unsubscribe());
  unsubscribeListeners = []; // Clear the array
};

// Logout function
const handleLogout = async () => {
  const navigation = useNavigation();

  Alert.alert(
    "Logout Confirmation",
    "Are you sure you want to logout?",
    [
      {
        text: "Cancel",
        onPress: () => console.log("Logout Cancelled"),
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            // Unsubscribe all Firestore listeners before logout
            unsubscribeAllListeners();

            await signOut(auth);
            console.log("User Logged out");
            navigation.replace("Login");
          } catch (error) {
            console.error("Logout Error:", error.message);
          }
        },
      },
    ],
    { cancelable: false }
  );
};

export default handleLogout;
