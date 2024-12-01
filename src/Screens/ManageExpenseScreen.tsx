import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import CustomButton from '../Components/CustomButton';
import { CustomInput } from '../Components/CustomInput';
import { Theme } from '../../constants/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ManageExpenseRouteProp = RouteProp<RootStackParamList, 'ManageExpenseScreen'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ManageExpenseScreen'>;

interface AssignedUser {
  id: string;
  email: string;
  value?: string;
  isPaid?: boolean;
}

export default function ManageExpenseScreen() {
  const route = useRoute<ManageExpenseRouteProp>();
  const navigation = useNavigation<NavigationProp>();

  const { expenseId, groupId, description, balance, isSplitEvenly, assignedUsers } = route.params;

  const [expenseDescription, setExpenseDescription] = useState(description || '');
  const [amount, setAmount] = useState(balance?.toString() || '');
  const [groupMembers, setGroupMembers] = useState<{ id: string; email: string }[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<AssignedUser[]>([]);
  const [isEvenSplit, setIsEvenSplit] = useState<boolean>(isSplitEvenly || true);
  const [loading, setLoading] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentEditUser, setCurrentEditUser] = useState<AssignedUser | null>(null);
  const [tempValue, setTempValue] = useState('');

  const handleOpenEditModal = (user: AssignedUser) => {
    setCurrentEditUser(user);
    setTempValue(user.value || '');
    setIsModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!currentEditUser) return;

    const updatedValue = parseFloat(tempValue);

    if (isNaN(updatedValue) || updatedValue < 0) {
      Alert.alert('Invalid Value', 'Please enter a valid positive number.');
      return;
    }

    setSelectedMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === currentEditUser.id ? { ...member, value: tempValue } : member
      )
    );
    setIsModalVisible(false);
  };

  useEffect(() => {
    if (assignedUsers) {
      const isSplitEvenlyCalculated = assignedUsers.every(
        (user) => user.value === balance / assignedUsers.length
      );
      setIsEvenSplit(isSplitEvenlyCalculated);

      setSelectedMembers(
        assignedUsers.map((user) => ({
          id: user.userId,
          email: 'Loading...',
          value: user.value.toFixed(2),
          isPaid: user.isPaid,
        }))
      );
    }
    fetchGroupMembers();
  }, []);

  const fetchGroupMembers = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:8080/groups/detail/${groupId}`);
      if (response.ok) {
        const group = await response.json();
        const membersWithDetails = await Promise.all(
          group.groupMembers.map(async (userId: string) => {
            const userResponse = await fetch(`http://10.0.2.2:8080/user/findById/${userId}`);
            if (userResponse.ok) {
              const user = await userResponse.json();
              return { id: user.id, email: user.email };
            }
            return { id: userId, email: 'Unknown' };
          })
        );
        setGroupMembers(membersWithDetails);

        setSelectedMembers((prevSelected) =>
          prevSelected.map((member) => ({
            ...member,
            email: membersWithDetails.find((m) => m.id === member.id)?.email || 'Unknown',
            isPaid: member.isPaid,
          }))
        );
      } else {
        Alert.alert('Error', 'Failed to load group members.');
      }
    } catch (error) {
      Alert.alert('Error', `Error fetching members: ${error}`);
    }
  };

  // Add the useEffect for recalculating per-person amounts
  useEffect(() => {
    if (isEvenSplit) {
      const totalAmount = parseFloat(amount) || 0;
      const numMembers = selectedMembers.length;

      if (numMembers > 0) {
        const splitAmount = (totalAmount / numMembers).toFixed(2);

        setSelectedMembers((prevMembers) =>
          prevMembers.map((member) => ({
            ...member,
            value: splitAmount,
          }))
        );
      }
    }
  }, [amount, isEvenSplit, selectedMembers.length]);

  const handleMarkPaid = async (userId: string) => {
    const user = selectedMembers.find((member) => member.id === userId);

    if (!user) {
      Alert.alert('Error', 'User must be added to the expense before marking as paid.');
      return;
    }

    const newPaidStatus = !user.isPaid;

    try {
      const response = await fetch(
        `http://10.0.2.2:8080/expenses/markPaid/${expenseId}/${userId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPaid: newPaidStatus }),
        }
      );

      if (response.ok) {
        setSelectedMembers((prevMembers) =>
          prevMembers.map((member) =>
            member.id === userId ? { ...member, isPaid: newPaidStatus } : member
          )
        );
      } else {
        const errorText = await response.text();
        console.error('Error marking as paid:', errorText);
        Alert.alert('Error', `Failed to mark as paid: ${errorText}`);
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      Alert.alert('Error', `Failed to mark as paid: ${error}`);
    }
  };

  const handleDeleteExpense = async () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(`http://10.0.2.2:8080/expenses/delete/${expenseId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                Alert.alert('Success', 'Expense deleted successfully!');
                navigation.navigate('GroupDetailScreen', { groupId });
              } else {
                const errorText = await response.text();
                console.error('Backend error deleting expense:', errorText);
                Alert.alert('Error', `Failed to delete expense: ${errorText}`);
              }
            } catch (error) {
              console.error('Error in handleDeleteExpense:', error);
              Alert.alert('Error', `Failed to delete expense: ${error}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSaveExpense = async () => {
    if (!expenseDescription || !amount) {
      Alert.alert('Error', 'Description and amount are required.');
      return;
    }

    if (!selectedMembers.length) {
      Alert.alert('Error', 'At least one member must be selected.');
      return;
    }

    const newAssignedUsersMap: { [key: string]: number } = {};
    selectedMembers.forEach((member) => {
      const value = parseFloat(member.value || '0');
      newAssignedUsersMap[member.id] = value;
    });

    const totalAssigned = Object.values(newAssignedUsersMap).reduce((sum, value) => sum + value, 0);

    if (!isEvenSplit && totalAssigned !== parseFloat(amount)) {
      Alert.alert(
        'Error',
        `The total assigned amount (${totalAssigned.toFixed(
          2
        )}) must match the expense amount (${amount}).`
      );
      return;
    }

    // Check if all assigned users have paid
    const allUsersPaid = selectedMembers.every((member) => member.isPaid);

    const updatedExpensePayload = {
      updateExpensesRequestDTO: {
        description: expenseDescription.trim(),
        balance: parseFloat(amount),
        isPaid: allUsersPaid,
      },
      newAssignedUsersMap,
      splitEvenly: isEvenSplit,
    };

    console.log('Payload sent:', updatedExpensePayload);

    setLoading(true);
    try {
      const response = await fetch(`http://10.0.2.2:8080/expenses/update/${expenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedExpensePayload),
      });

      if (response.ok) {
        Alert.alert('Success', 'Expense updated successfully!');
        navigation.goBack();
      } else {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        Alert.alert('Error', `Failed to update expense: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      Alert.alert('Error', `Failed to update expense: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpense = (userId: string) => {
    const userInExpense = selectedMembers.some((member) => member.id === userId);

    const updatedMembers = userInExpense
      ? selectedMembers.filter((member) => member.id !== userId) // Remove the user
      : [...selectedMembers, { id: userId, email: '', value: '0.00', isPaid: false }]; // Add the user

    setSelectedMembers(updatedMembers);
  };

  const renderMemberItem = ({ item }: { item: { id: string; email: string } }) => {
    const user = selectedMembers.find((m) => m.id === item.id);
    const isInExpense = !!user;
    const isPaid = user?.isPaid || false;
    const userValue = user?.value || '0.00';

    return (
      <View style={styles.memberContainer}>
        {/* Checkmark */}
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          onPress={() => handleToggleExpense(item.id)}
        >
          <MaterialCommunityIcons
            name={isInExpense ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={isInExpense ? Theme.TERTIARY : 'gray'}
          />
          <Text style={[styles.memberText, { marginLeft: 10 }]}>{item.email}</Text>
        </TouchableOpacity>

        {/* Value and Is Paid */}
        {isInExpense && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.memberValue}>R$ {userValue}</Text>

            {/* Is Paid */}
            <TouchableOpacity
              style={styles.paymentIconContainer}
              onPress={() => handleMarkPaid(item.id)}
              disabled={loadingUserId === item.id}
            >
              <MaterialCommunityIcons name="cash" size={24} color={isPaid ? 'green' : 'red'} />
            </TouchableOpacity>

            {/* Edit Value */}
            {!isEvenSplit && (
              <TouchableOpacity
                onPress={() => handleOpenEditModal(user!)}
                style={styles.editIconContainer}
              >
                <MaterialCommunityIcons name="dots-horizontal" size={24} color="gray" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomInput
        label="Expense Description"
        value={expenseDescription}
        onChange={setExpenseDescription}
      />
      <CustomInput
        label="Amount"
        value={amount}
        type="numeric"
        restrictNumeric
        onChange={setAmount}
      />
      <Text style={styles.label}>Split Expense:</Text>
      <View style={styles.radioContainer}>
        <Text
          onPress={() => {
            setIsEvenSplit(true);
          }}
          style={isEvenSplit ? styles.selected : styles.radio}
        >
          Equal Split
        </Text>
        <Text
          onPress={() => {
            setIsEvenSplit(false);
          }}
          style={!isEvenSplit ? styles.selected : styles.radio}
        >
          Custom Split
        </Text>
      </View>

      <Text style={styles.label}>Select Members:</Text>
      <FlatList
        data={groupMembers}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.id}
      />

      {loading ? (
        <ActivityIndicator size="large" color={Theme.TERTIARY} />
      ) : (
        <>
          <CustomButton
            title="Save Expense"
            onPress={handleSaveExpense}
            color={Theme.TERTIARY}
            textColor={Theme.SECONDARY}
          />
          <CustomButton title="Delete Expense" onPress={handleDeleteExpense} color="red" textColor="#fff" />
        </>
      )}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Value</Text>
            {/* Simple input to edit the value */}
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={tempValue}
              onChangeText={setTempValue}
              placeholder="Enter new value"
            />
            {/* Action buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={[styles.modalButton, { borderWidth: 2, borderColor: Theme.INPUT }]}
              >
                <Text style={[styles.modalButtonText, { color: Theme.TERTIARY }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveEdit}
                style={[styles.modalButton, { backgroundColor: Theme.TERTIARY }]}
              >
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
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  radio: {
    height: 50,
    width: '45%',
    fontSize: 16,
    borderWidth: 2,
    marginRight: 20,
    borderRadius: 10,
    color: Theme.TERTIARY,
    borderColor: Theme.INPUT,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  selected: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    borderWidth: 2,
    borderRadius: 10,
    borderColor: Theme.TERTIARY,
    backgroundColor: Theme.PASTEL,
    color: Theme.TERTIARY,
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 50,
    marginRight: 20,
    width: '45%',
  },
  memberContainer: {
    flexDirection: 'row',
    alignContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Theme.INPUT,
    height: 75,
    padding: 10,
  },
  memberText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  memberValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Theme.TERTIARY,
    marginRight: 15,
  },
  editIconContainer: {
    marginLeft: 15,
    justifyContent: 'center',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Theme.INPUT,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: Theme.TERTIARY,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  paymentIconContainer: {
    marginLeft: 15,
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Theme.TERTIARY,
  },
  checkmarkIconContainer: {
    justifyContent: 'center',
  },
  
  
});
