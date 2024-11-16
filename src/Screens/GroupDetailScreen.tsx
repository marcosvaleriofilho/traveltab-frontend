import React, { useEffect, useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Ajuste o caminho para onde seu RootStackParamList está definido.
import { Theme } from '../../constants/Theme';
import CustomButton from '../Components/CustomButton';
import { CustomInput } from '../Components/CustomInput';

type GroupDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GroupDetailScreen'>;
type GroupDetailRouteProp = RouteProp<RootStackParamList, 'GroupDetailScreen'>;

export default function GroupDetailScreen() {
  const route = useRoute<GroupDetailRouteProp>();
  const navigation = useNavigation<GroupDetailNavigationProp>();
  const { groupId } = route.params;

  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:8080/groups/detail/${groupId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const group = await response.json();
          setGroupName(group.nameGroup);
          setGroupMembers(group.groupMembers);
          setStartDate(group.startDate);
          setEndDate(group.endDate);
        } else {
          Alert.alert('Error', 'Fail searching for group details.');
        }
      } catch (error) {
        Alert.alert('Error', `Fail searching for group details.: ${error}`);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  const handleSaveChanges = () => {
    Alert.alert(
      'Confirmation',
      'Do you want to save the changes?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const updatedGroup = {
                nameGroup: groupName,
                startDate: startDate,
                endDate: endDate,
                groupMembers: groupMembers,
              };

              const response = await fetch(`http://10.0.2.2:8080/groups/update/${groupId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedGroup),
              });

              if (response.ok) {
                Alert.alert('Success', 'Group updated with success!');
                navigation.goBack();
              } else {
                Alert.alert('Error', 'Fail updating the group.');
              }
            } catch (error) {
              Alert.alert('Error', `Fail updating the group: ${error}`);
            }
          },
        },
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete the group? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://10.0.2.2:8080/groups/delete/${groupId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                Alert.alert('Success', 'Group deleted with success!');
                navigation.navigate('MainTabs');
              } else {
                Alert.alert('Error', 'Fail deleting the group.');
              }
            } catch (error) {
              Alert.alert('Error', `Fail deleting the group: ${error}`);
            }
          },
        },
      ]
    );
  };

  const handleAddMember = () => {
    navigation.navigate('ManageMembersScreen', { groupId });
  };

  const handleAddExpense = () => {
    navigation.navigate('AddExpenseScreen', { groupId });
  };

  const handleViewExpenses = () => {
    navigation.navigate('GroupExpensesScreen', { groupId });
  };

  return (
    <View style={styles.container}>
      <CustomInput label="Group Name" value={groupName} onChange={setGroupName} />

      <CustomButton
        title="Save Changes"
        color={Theme.TERTIARY}
        textColor={Theme.SECONDARY}
        onPress={handleSaveChanges}
      />

      <CustomButton
        title="Manage Members"
        color={Theme.TERTIARY}
        textColor={Theme.SECONDARY}
        onPress={handleAddMember}
      />

      <CustomButton
        title="Add expense"
        color={Theme.TERTIARY}
        textColor={Theme.SECONDARY}
        onPress={handleAddExpense}
      />

      <CustomButton
        title="Visualize expenses"
        color={Theme.TERTIARY}
        textColor={Theme.SECONDARY}
        onPress={handleViewExpenses}
      />

      <CustomButton
        title="Delete Group"
        color="red"
        textColor="white"
        onPress={handleDeleteGroup}
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
    backgroundColor: '#fff',
  },
});
