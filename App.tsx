import React, { useEffect, useState } from 'react';
import { StatusBar, SafeAreaView, TouchableOpacity } from 'react-native';
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
import CreateGroupScreen from './src/Screens/CreateGroupScreen';
import GroupDetailScreen from './src/Screens/GroupDetailScreen';
import ManageMembersScreen from './src/Screens/ManageMembersScreen'; // Renomeado para "Gerenciar Membros"
import AddExpenseScreen from './src/Screens/AddExpenseScreen';
import GroupExpensesScreen from './src/Screens/GroupExpensesScreen';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from './constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export type RootStackParamList = {
  SignUp: undefined;
  Home: undefined;
  Login: undefined;
  MainTabs: undefined;
  CreateGroupScreen: undefined;
  GroupDetailScreen: { groupId: string };
  ManageMembersScreen: { groupId: string }; // Renomeado para "Gerenciar Membros"
  AddExpenseScreen: { groupId: string };
  GroupExpensesScreen: { groupId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconName = (() => {
            switch (route.name) {
              case 'Groups':
                return 'home-outline';
              case 'Profile':
                return 'person-outline';
              case 'Tasks':
                return 'checkbox-outline';
              case 'Balance':
                return 'cash-outline';
              case 'Alerts':
                return 'notifications-outline';
              default:
                return 'help-circle-outline';
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
        headerShown: false,
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fontsLoaded, error] = useFonts({
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Thin': require('./assets/fonts/Poppins-Thin.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    checkToken();
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Navigator initialRouteName={isAuthenticated ? "MainTabs" : "Home"}>
          <Stack.Screen
            options={{ headerShown: false }}
            name="Home"
            component={HomeScreen}
          />
          <Stack.Screen
            options={{ headerShown: false }}
            name="SignUp"
            component={SignUpScreen}
          />
          <Stack.Screen
            options={{ headerShown: false }}
            name="Login"
            component={LoginScreen}
          />
          <Stack.Screen
            options={{ headerShown: false }}
            name="MainTabs"
            component={MainTabs}
          />
          <Stack.Screen
            name="CreateGroupScreen"
            component={CreateGroupScreen}
            options={{
              title: 'Criar Grupo',
              headerStyle: {
                backgroundColor: Theme.TERTIARY,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontFamily: 'Poppins-Bold',
              },
            }}
          />
          <Stack.Screen
            name="GroupDetailScreen"
            component={GroupDetailScreen}
            options={{
              title: 'Detalhes do Grupo',
              headerStyle: {
                backgroundColor: Theme.TERTIARY,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontFamily: 'Poppins-Bold',
              },
            }}
          />
          <Stack.Screen
            name="ManageMembersScreen" // Novo nome da tela
            component={ManageMembersScreen} // Atualizado para refletir o novo nome
            options={{
              title: 'Gerenciar Membros', // Alterar o título
              headerStyle: {
                backgroundColor: Theme.TERTIARY,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontFamily: 'Poppins-Bold',
              },
            }}
          />
          <Stack.Screen
            name="AddExpenseScreen"
            component={AddExpenseScreen}
            options={{
              title: 'Adicionar Despesa',
              headerStyle: {
                backgroundColor: Theme.TERTIARY,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontFamily: 'Poppins-Bold',
              },
            }}
          />
          <Stack.Screen
            name="GroupExpensesScreen"
            component={GroupExpensesScreen}
            options={{
              title: 'Despesas do Grupo',
              headerStyle: {
                backgroundColor: Theme.TERTIARY,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontFamily: 'Poppins-Bold',
              },
            }}
          />
        </Stack.Navigator>
      </SafeAreaView>
      <StatusBar hidden={true} />
    </NavigationContainer>
  );
}
