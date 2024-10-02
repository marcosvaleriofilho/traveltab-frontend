import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Theme } from '../../constants/Theme';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Função para lidar com o logout
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Você tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Logout cancelado'),
          style: 'cancel',
        },
        {
          text: 'Sair',
          onPress: async () => {
            // Limpa o token e os dados de usuário do AsyncStorage
            try {
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('userData');
            } catch (error) {
              console.error('Erro ao limpar AsyncStorage:', error);
            }
            
            // Redefine a navegação para a tela de Login
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.setting}>
        <Text style={styles.text}>My Profile</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttontext}>E-mail</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttontext}>Name</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttontext}>Change Password</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttontext}>Phone</Text>
      </TouchableOpacity>
      {/* Botão de Logout */}
      <TouchableOpacity
        style={[styles.button, { justifyContent: 'center', borderBottomWidth: 0 }]}
        onPress={handleLogout}
      >
        <Text style={[styles.buttontext, { color: 'red', fontFamily: 'Poppins-SemiBold' }]}>
          Log Out
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  text: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: Theme.SECONDARY,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    width: '100%',
    height: 60,
    backgroundColor: Theme.TERTIARY,
  },
  button: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Theme.SECONDARY,
    marginBottom: 1,
    margin: 1,
  },
  buttontext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
});
