import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/Screens/HomeScreen';
import SignUpScreen from './src/Screens/SignUpScreen';
import LoginScreen from './src/Screens/LoginScreen';
import MainScreen from './src/Screens/MainScreen';
import ProfileScreen from './src/Screens/ProfileScreen';
import TasksScreen from './src/Screens/TasksScreen';
import MoneyScreen from './src/Screens/MoneyScreen';
import NotifyScreen from './src/Screens/NotifyScreen';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from './constants/Theme';

SplashScreen.preventAutoHideAsync();

export type RootStackParamList = {
  SignUp: undefined;
  Home: undefined;
  Login: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          const iconName: keyof typeof Ionicons.glyphMap = (() => {
            switch (route.name) {
              case 'Groups':
                return focused ? 'home' : 'home-outline';
              case 'Profile':
                return focused ? 'person' : 'person-outline';
              case 'Tasks':
                return focused ? 'checkbox' : 'checkbox-outline';
              case 'Balance':
                return focused ? 'cash' : 'cash-outline';
              case 'Alerts':
                return focused ? 'notifications' : 'notifications-outline';
              default:
                return focused ? 'help' : 'help-circle-outline';
            }
          })();

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Theme.TERTIARY,
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 14,
          fontFamily: 'Poppins-Bold',
        },
        tabBarStyle: {
          height: 60,
          paddingTop: 10,
        },
        headerShown: false
      })}
    >
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Balance" component={MoneyScreen} />
      <Tab.Screen name="Groups" component={MainScreen} />
      <Tab.Screen name="Alerts" component={NotifyScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, error] = useFonts({
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Thin': require('./assets/fonts/Poppins-Thin.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen options={{ headerShown: false }} name="Home" component={HomeScreen} />
        <Stack.Screen options={{ headerShown: false }} name="SignUp" component={SignUpScreen} />
        <Stack.Screen options={{ headerShown: false }} name="Login" component={LoginScreen} />
        <Stack.Screen options={{ headerShown: false }} name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
      <StatusBar hidden={true} style="auto" /> 
    </NavigationContainer>
  );
}
