import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Theme } from '../../constants/Theme';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [modalVisible, setModalVisible] = useState(false);
  const [editField, setEditField] = useState<string>(''); // To track which field is being edited
  const [inputValue, setInputValue] = useState<string>(''); // To track input value
  const [userId, setUserId] = useState<string>(''); // To store userId

  // Fetch userId using email
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('userEmail');
        if (!userEmail) {
          Alert.alert('Error', 'User email not found');
          return;
        }

        const response = await fetch(`http://10.0.2.2:8080/user/findByEmail?email=${userEmail}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user ID');
        }

        const userData = await response.json();
        setUserId(userData.id); // Store userId in state
      } catch (error) {
        console.error('Error fetching user ID:', error);
        Alert.alert('Error', 'Failed to fetch user ID');
      }
    };

    fetchUserId();
  }, []);

  // Function to handle logout
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Logout canceled'),
          style: 'cancel',
        },
        {
          text: 'Log Out',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('userData');
            } catch (error) {
              console.error('Error clearing AsyncStorage:', error);
            }

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

  // Function to open modal
  const handleEdit = (field: string) => {
    setEditField(field);
    setInputValue(''); // Reset input value
    setModalVisible(true);
  };

  // Function to save changes
  const handleSave = async () => {
    try {
      if (!userId) {
        Alert.alert('Error', 'User ID not available');
        return;
      }
  
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }
  
      // Corrigir o campo para enviar no formato esperado
      const fieldName =
        editField.toLowerCase() === 'e-mail' ? 'email' : // Corrige o campo "e-mail" para "email"
        editField.toLowerCase() === 'change password' ? 'password' : // Mapeia "Change Password" para "password"
        editField.toLowerCase();
  
      const response = await fetch(`http://10.0.2.2:8080/user/update/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ [fieldName]: inputValue }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update user');
      }
  
      if (fieldName === 'email') {
        // Atualiza o e-mail no AsyncStorage se foi alterado
        await AsyncStorage.setItem('userEmail', inputValue);
      }
  
      Alert.alert('Success', `${editField} updated successfully!`);
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', `An error occurred while updating the user: ${error}`);
    }
  };
  
  
  
  
  return (
    <View style={styles.container}>
      <View style={styles.setting}>
        <Text style={styles.text}>My Profile</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => handleEdit('E-mail')}>
        <Text style={styles.buttontext}>Change E-mail</Text>
      </TouchableOpacity>
    
      <TouchableOpacity style={styles.button} onPress={() => handleEdit('Change Password')}>
        <Text style={styles.buttontext}>Change Password</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { justifyContent: 'center', borderBottomWidth: 0 }]}
        onPress={handleLogout}
      >
        <Text style={[styles.buttontext, { color: 'red', fontFamily: 'Poppins-SemiBold' }]}>
          Log Out
        </Text>
      </TouchableOpacity>

      {/* Modal for Editing */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>

          
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit {editField}</Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter new ${editField.toLowerCase()}`}
              value={inputValue}
              onChangeText={setInputValue}
            />
            <View style={styles.modalButtons}>
            <TouchableOpacity
                style={[styles.modalButton, {  borderWidth: 2, borderColor: Theme.INPUT  }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, {color: Theme.TERTIARY} ]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: Theme.TERTIARY}]} onPress={handleSave}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              
            </View>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: Theme.INPUT,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
});
