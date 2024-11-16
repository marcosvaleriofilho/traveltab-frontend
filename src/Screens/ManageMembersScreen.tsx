import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, FlatList, TouchableOpacity } from 'react-native';
import CustomButton from '../Components/CustomButton';
import { Theme } from '../../constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ManageMembersScreen({ route, navigation }: any) {
  const { groupId } = route.params;
  const [memberEmail, setMemberEmail] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<{ id: string, email: string }[]>([]);

  useEffect(() => {
    const getUserEmail = async () => {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      if (storedEmail) {
        setUserEmail(storedEmail);
      }
    };
    getUserEmail();
    fetchGroupMembers();
  }, []);

  const fetchGroupMembers = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:8080/groups/detail/${groupId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const group = await response.json();

        const membersWithDetails = await Promise.all(group.groupMembers.map(async (userId: string) => {
          const userResponse = await fetch(`http://10.0.2.2:8080/user/findById/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (userResponse.ok) {
            const user = await userResponse.json();
            return { id: user.id, email: user.email };
          }

          return { id: userId, email: 'Unknown' };
        }));

        setGroupMembers(membersWithDetails);
      } else {
        Alert.alert('Error', 'Failed to fetch group members.');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to fetch members: ${error}`);
    }
  };

  const addMemberByEmail = async (email: string) => {
    const emailExists = groupMembers.some((member) => member.email === email);
    if (emailExists) {
      Alert.alert('Attention', 'This email is already in the group.');
      return;
    }

    if (email === userEmail) {
      Alert.alert('Attention', 'You are automatically included in the group.');
      return;
    }

    try {
      const response = await fetch(`http://10.0.2.2:8080/user/findByEmail?email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const user = await response.json();
        const userId = user.id;

        const addResponse = await fetch(`http://10.0.2.2:8080/groups/addMembers/${groupId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([userId]),
        });

        if (addResponse.ok) {
          Alert.alert('Success', 'Member successfully added!');
          fetchGroupMembers();
          setMemberEmail('');
        } else {
          const errorMessage = await addResponse.text();
          console.error('Server error:', errorMessage);
          Alert.alert('Error', errorMessage || 'Failed to add member to the group.');
        }
      } else {
        const errorMessage = await response.text();
        console.error('Error fetching user ID:', errorMessage);
        Alert.alert('Error', 'User not found or failed to fetch the ID.');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      Alert.alert('Error', 'Could not add the member.');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const currentUser = groupMembers.find((member) => member.email === userEmail);
      
      if (currentUser && currentUser.id === userId) {
        Alert.alert('Error', 'You cannot remove yourself from the group.');
        return;
      }
    
      const response = await fetch(`http://10.0.2.2:8080/groups/removeMember/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
  
      if (response.ok) {
        Alert.alert('Success', 'Member successfully removed!');
        fetchGroupMembers();
      } else {
        const errorMessage = await response.text();
        console.error('Error removing member:', errorMessage);
        Alert.alert('Error', 'Failed to remove member from the group.');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      Alert.alert('Error', `Failed to remove member: ${error}`);
    }
  };

  const handleAddMember = async () => {
    if (memberEmail) {
      await addMemberByEmail(memberEmail);
    } else {
      Alert.alert('Error', 'The email field is empty.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Manage Group Members</Text>

      <TextInput
        style={styles.input}
        placeholder="Member email"
        value={memberEmail}
        onChangeText={setMemberEmail}
      />
      <CustomButton
        title="Add Member"
        onPress={handleAddMember}
        color={Theme.TERTIARY}
        textColor={Theme.SECONDARY}
      />

      <FlatList
        data={groupMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.memberContainer}>
            <Text style={styles.memberText}>{item.email}</Text>
            <TouchableOpacity onPress={() => handleRemoveMember(item.id)}>
              <Ionicons name="remove" size={32} color={Theme.TERTIARY} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>No members found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: Theme.INPUT,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  memberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: Theme.INPUT,
  },
  memberText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});
