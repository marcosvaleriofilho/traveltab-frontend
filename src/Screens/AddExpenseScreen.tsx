import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native';
import CustomButton from '../Components/CustomButton';
import { CustomInput } from '../Components/CustomInput';
import { Theme } from '../../constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AddExpenseScreen({ route, navigation }: any) {
  const { groupId } = route.params;
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [groupMembers, setGroupMembers] = useState<{ id: string; email: string }[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<{ id: string; email: string; value?: string }[]>([]);
  const [isSplitEvenly, setIsSplitEvenly] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentEditUser, setCurrentEditUser] = useState<{ id: string; value: string } | null>(null);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    fetchGroupMembers();
  }, []);

  const fetchGroupMembers = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:8080/groups/detail/${groupId}`);
      if (response.ok) {
        const group = await response.json();
        setGroupMembers(
          group.groupMembers.map((userId: string) => ({ id: userId, email: 'Loading...' }))
        );

        await Promise.all(
          group.groupMembers.map(async (userId: string) => {
            const userResponse = await fetch(`http://10.0.2.2:8080/user/findById/${userId}`);
            if (userResponse.ok) {
              const user = await userResponse.json();
              setGroupMembers((prev) =>
                prev.map((member) => (member.id === userId ? { ...member, email: user.email } : member))
              );
            }
          })
        );
      } else {
        Alert.alert('Error', 'Failed to load group members.');
      }
    } catch (error) {
      Alert.alert('Error', `Error loading members: ${error}`);
    }
  };

  const toggleMemberSelection = (member: { id: string; email: string }) => {
    const isSelected = selectedMembers.some((m) => m.id === member.id);

    if (isSelected) {
      setSelectedMembers((prevSelected) => prevSelected.filter((m) => m.id !== member.id));
    } else {
      setSelectedMembers((prevSelected) => [...prevSelected, { ...member, value: '' }]);
    }
  };

  const handleOpenEditModal = (memberId: string) => {
    const member = selectedMembers.find((m) => m.id === memberId);
    if (!member) return;
    setCurrentEditUser({ id: member.id, value: member.value || '' });
    setTempValue(member.value || '');
    setIsModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!currentEditUser) return;

    setSelectedMembers((prevSelected) =>
      prevSelected.map((m) =>
        m.id === currentEditUser.id ? { ...m, value: parseFloat(tempValue).toFixed(2) } : m
      )
    );

    setIsModalVisible(false);
  };

  const renderMemberItem = ({ item }: { item: { id: string; email: string } }) => {
    const isSelected = selectedMembers.some((m) => m.id === item.id);
    const selectedMember = selectedMembers.find((m) => m.id === item.id);
    const userValue = selectedMember?.value || '0.00';
  
    return (
      <View style={[styles.memberContainer]}>
        {/* Checkmark */}
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          onPress={() => toggleMemberSelection(item)}
        >
          <MaterialCommunityIcons
            name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={isSelected ? Theme.TERTIARY : 'gray'}
          />
          <Text style={[styles.memberText, { marginLeft: 10 }]}>{item.email}</Text>
        </TouchableOpacity>
  
        {/* Valor e Três Pontinhos: Apenas no Custom Split */}
        {isSelected && !isSplitEvenly && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.memberValue}>R$ {userValue}</Text>
            <TouchableOpacity onPress={() => handleOpenEditModal(item.id)} style={styles.editIconContainer}>
              <MaterialCommunityIcons name="dots-horizontal" size={24} color="gray" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  

  const handleAddExpense = async () => {
    if (!description || !amount || selectedMembers.length === 0) {
      Alert.alert('Error', 'Please fill all fields and select members.');
      return;
    }

    const assignedUsers: { [key: string]: number } = {};

    if (isSplitEvenly) {
      const splitValue = parseFloat(amount) / selectedMembers.length;
      selectedMembers.forEach((member) => {
        assignedUsers[member.id] = splitValue;
      });
    } else {
      let totalSplit = 0;

      selectedMembers.forEach((member) => {
        const value = parseFloat(member.value || '0');
        assignedUsers[member.id] = value;
        totalSplit += value;
      });

      if (totalSplit !== parseFloat(amount)) {
        Alert.alert(
          'Error',
          `The total split amount (${totalSplit.toFixed(2)}) does not match the expense amount (${parseFloat(amount).toFixed(2)}).`
        );
        return;
      }
    }

    const expenseData = {
      description,
      balance: parseFloat(amount),
      groupId,
      assignedUsers,
      assignedGroups: [groupId],
      isSplitEvenly,
    };

    console.log('Expense data to be sent:', expenseData);

    try {
      const response = await fetch(`http://10.0.2.2:8080/expenses/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Expense successfully added!');
        navigation.goBack();
      } else {
        const errorMessage = await response.text();
        console.error('Server error:', errorMessage);
        Alert.alert('Error', errorMessage || 'Failed to add expense.');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', `Error adding expense: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <CustomInput
        label="Expense Description"
        value={description}
        onChange={setDescription}
      />
      <CustomInput
        label="Amount"
        value={amount}
        type="numeric"
        restrictNumeric={true}
        onChange={setAmount}
      />
      <Text style={styles.label}>Split Expense:</Text>
      <View style={styles.radioContainer}>
        <Text
          onPress={() => setIsSplitEvenly(true)}
          style={isSplitEvenly ? styles.selected : styles.radio}
        >
          Equal Split
        </Text>
        <Text
          onPress={() => setIsSplitEvenly(false)}
          style={!isSplitEvenly ? styles.selected : styles.radio}
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

      <CustomButton
        title="Add Expense"
        onPress={handleAddExpense}
        color={Theme.TERTIARY}
        textColor={Theme.SECONDARY}
      />

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Value</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={tempValue}
              onChangeText={setTempValue}
              placeholder="Enter new value"
            />
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
    borderRadius: 10,
    color: Theme.TERTIARY,
    borderColor: Theme.INPUT,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 20,
  },
  selected: {
    height: 50,
    width: '45%',
    fontSize: 16,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: Theme.PASTEL,
    borderColor: Theme.TERTIARY,
    color: Theme.TERTIARY,
    marginRight: 20,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    textAlignVertical: 'center',
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
  },
  editIconContainer: {
    marginLeft: 10,
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
});
