import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import CustomButton from '../Components/CustomButton';
import { CustomInput } from '../Components/CustomInput';
import { Theme } from '../../constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddExpenseScreen({ route, navigation }: any) {
  const { groupId } = route.params;
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [groupMembers, setGroupMembers] = useState<{ id: string; email: string }[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<{ id: string; email: string; value?: string }[]>([]);
  const [isSplitEvenly, setIsSplitEvenly] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
        const membersWithDetails = await Promise.all(
          group.groupMembers.map(async (userId: string) => {
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
          })
        );
        setGroupMembers(membersWithDetails);
      } else {
        Alert.alert('Error', 'Failed to load group members.');
      }
    } catch (error) {
      Alert.alert('Error', `Error loading members: ${error}`);
    }
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
      selectedMembers.forEach((member) => {
        const value = parseFloat(member.value || '0');
        assignedUsers[member.id] = value;
      });
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

  const toggleMemberSelection = (member: { id: string; email: string }) => {
    const isSelected = selectedMembers.some((m) => m.id === member.id);

    if (isSelected) {
      setSelectedMembers((prevSelected) => prevSelected.filter((m) => m.id !== member.id));
    } else {
      setSelectedMembers((prevSelected) => [...prevSelected, { ...member }]);
    }
  };

  const renderMemberItem = ({ item }: { item: { id: string; email: string } }) => {
    const isSelected = selectedMembers.some((m) => m.id === item.id);
    return (
        <View
            style={[
                styles.memberContainer,
                isSelected && { backgroundColor: Theme.PASTEL}, // Aplica o fundo quando selecionado
            ]}
        >
            <TouchableOpacity style={{width:'80%'}} onPress={() => toggleMemberSelection(item)}>
                <Text style={styles.memberText}>{item.email}</Text>
            </TouchableOpacity>
            {!isSplitEvenly && isSelected && (
                <CustomInput
                    value={selectedMembers.find((m) => m.id === item.id)?.value || ''}
                    type="numeric"
                    restrictNumeric={true}
                    containerStyle={{ width: -50, paddingRight: 10  }}
                    inputStyle={{ fontSize: 14, padding: 0 }}
                    onChange={(value) =>
                        setSelectedMembers((prevSelected) =>
                            prevSelected.map((m) =>
                                m.id === item.id ? { ...m, value } : m
                            )
                        )
                    }
                />
            )}
        </View>
    );
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
          <View style={{ width: '2.5%' }}></View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30
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
    borderRadius: 12,
    color: Theme.TERTIARY,
    borderColor: Theme.INPUT,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    textAlignVertical: 'center',
},
  selectedRadio: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: Theme.TERTIARY,
    color: Theme.SECONDARY,
  },
  memberContainer: {
    flexDirection: 'row',
    alignContent:'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Theme.INPUT,
    height: 75,
    width: 450,
    padding: 10
  },
  memberText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlignVertical: 'center',
    flex: 1, // Alinha o texto corretamente
    
  },
  inputSmall: {
    width: 80, // Tamanho reduzido

  },
  selected: {
    width: '45%',
    fontSize: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.TERTIARY,
    backgroundColor: Theme.PASTEL,
    color: Theme.TERTIARY,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    textAlignVertical: 'center',
},

});
