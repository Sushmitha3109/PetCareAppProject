import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screen/LoginScreen';
import RegisterScreen from './screen/RegisterScreen';
import HomeScreen from './screen/HomeScreen';
import AdminDashboard from './screen/AdminDashboard';
import UserDetails from './screen/UserDetails';
import FoodDetails from './screen/FoodDetails';
import AddFoodDetails from './screen/AddFoodDetails';
import ViewFoodDetails from './screen/ViewFoodDetails';
import EditFoodDetails from './screen/EditFoodDetails';
import GroomingPlaceDetails from './screen/GroomingPlaceDetails';
import AddGroomingPlace from './screen/AddGroomingPlace';
import ViewGroomingPlace from './screen/ViewGroomingPlace';
import EditGroomingPlace from './screen/EditGroomingPlace';
import SearchScreen from './screen/SearchScreen';
import NotificationScreen from './screen/NotificationsScreen';
import PetDetailsScreen from './screen/PetDetailsScreen';
import AddPetDetails from './screen/AddPetDetails';
import ViewPetDetails from './screen/ViewPetDetails';
import EditPetDetails from './screen/EditPetDetails';
import ProfileScreen from './screen/ProfileScreen';
import AddProfile from './screen/AddProfile';
import ViewProfile from './screen/ViewProfile';
import EditProfile from './screen/EditProfile';
import TaskDetails from './screen/TaskDetails';
import AddTaskDetails from './screen/AddTaskDetails';
import ViewTaskDetails from './screen/ViewTaskDetails';
import EditTaskDetails from './screen/EditTask';
import GroomingDetails from './screen/Groomingdetails';
import AddGroomingDetails from './screen/AddGroomingDetails';
import ViewGroomingDetails from './screen/ViewGroomingDetails';
import EditGroomingDetails from './screen/EditGroomingDetails';
import SearchGrooming from './screen/SearchGrooming';
import HealthIssues from './screen/HealthIssues';
import AddHealthIssues from './screen/AddHealthIssues';
import ViewHealthIssues from './screen/ViewHealthIssues';
import EditHealthIssues from './screen/EditHealthIssues';
import ViewTask from './screen/ViewTask';
import PendingTask from './screen/PendingTask';
import CompletedTask from './screen/CompletedTask';
import MissedTask from './screen/MissedTask';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Admin" component={AdminDashboard} />
        <Stack.Screen name="UserDetails" component={UserDetails} />
        <Stack.Screen name="FoodDetails" component={FoodDetails} />
        <Stack.Screen name="AddFoodDetails" component={AddFoodDetails} />
        <Stack.Screen name="ViewFoodDetails" component={ViewFoodDetails} />
        <Stack.Screen name="EditFoodDetails" component={EditFoodDetails} />
        <Stack.Screen name="GroomingPlaceDetails" component={GroomingPlaceDetails} />
        <Stack.Screen name="AddGroomingPlace" component={AddGroomingPlace} />
        <Stack.Screen name="ViewGroomingPlace" component={ViewGroomingPlace} />
        <Stack.Screen name="EditGroomingPlace" component={EditGroomingPlace} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
        <Stack.Screen name="PetDetails" component={PetDetailsScreen} />
        <Stack.Screen name="AddPetDetails" component={AddPetDetails} />
        <Stack.Screen name="ViewPetDetails" component={ViewPetDetails} />
        <Stack.Screen name="EditPetDetails" component={EditPetDetails} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="AddProfile" component={AddProfile} />
        <Stack.Screen name="ViewProfile" component={ViewProfile} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="TaskDetails" component={TaskDetails}/>
        <Stack.Screen name="AddTaskDetails" component={AddTaskDetails}/>
        <Stack.Screen name="ViewTaskDetails" component={ViewTaskDetails}/>
        <Stack.Screen name="EditTaskDetails" component={EditTaskDetails} />
        <Stack.Screen name="GroomingDetails" component={GroomingDetails} />
        <Stack.Screen name="AddGroomingDetails" component={AddGroomingDetails} />
        <Stack.Screen name="ViewGroomingDetails" component={ViewGroomingDetails} />
        <Stack.Screen name="EditGroomingDetails" component={EditGroomingDetails}/>
        <Stack.Screen name="SearchGrooming" component={SearchGrooming} />
        <Stack.Screen name="HealthIssues" component={HealthIssues}/>
        <Stack.Screen name="AddHealthIssues" component={AddHealthIssues}/>
        <Stack.Screen name="ViewHealthIssues" component={ViewHealthIssues}/>
        <Stack.Screen name="EditHealthIssues" component={EditHealthIssues}/>
        <Stack.Screen name="ViewTask" component={ViewTask} />
        <Stack.Screen name="PendingTask" component={PendingTask}/>
        <Stack.Screen name="CompletedTask" component={CompletedTask}/>
        <Stack.Screen name="MissedTask" component={MissedTask}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}
