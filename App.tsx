import { useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import HomeScreen from './src/Screens/HomeScreen';
import SignUpScreen from './src/Screens/SignUpScreen';
import LoginScreen from './src/Screens/LoginScreen';


SplashScreen.preventAutoHideAsync();

export default function App() {

  const[loaded, error] = useFonts({
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Thin': require('./assets/fonts/Poppins-Thin.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf')

  })

  useEffect(()=>{
    if(loaded || error){
      SplashScreen.hideAsync();
    }
  }, [loaded,error]);

  if(!loaded && !error){
    return null;
  }

  return (
    <View style={styles.container}>
      <HomeScreen/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
  }
});
