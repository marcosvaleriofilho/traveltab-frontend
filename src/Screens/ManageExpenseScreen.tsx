import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
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

  useEffect(() => {
    console.log('Assigned Users:', assignedUsers);
    console.log('Selected Members State:', selectedMembers);
  }, [selectedMembers]);


  useEffect(() => {
    if (assignedUsers) {
      setSelectedMembers(
        assignedUsers.map((user) => ({
          id: user.userId,
          email: 'Loading...',
          value: user.value.toFixed(2),
          isPaid: user.isPaid, // Atualiza o estado inicial com base no MongoDB
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
            isPaid: member.isPaid, // Certifique-se de manter o estado de pagamento
          }))
        );
      } else {
        Alert.alert('Error', 'Failed to load group members.');
      }
    } catch (error) {
      Alert.alert('Error', `Error fetching members: ${error}`);
    }
  };

  const handleMarkPaid = async (userId: string) => {
    const user = selectedMembers.find((member) => member.id === userId);
    if (!user) return;

    const newPaidStatus = !user.isPaid; // Inverte o estado atual

    console.log(`Tentando atualizar o status de pagamento para ${newPaidStatus}:`, {
      expenseId,
      userId,
    });

    setLoadingUserId(userId);

    try {
      const response = await fetch(
        `http://10.0.2.2:8080/expenses/markPaid/${expenseId}/${userId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPaid: newPaidStatus }), // Passa o novo status no corpo
        }
      );

      if (response.ok) {
        console.log(
          `Usuário ${newPaidStatus ? 'marcado como pago' : 'desmarcado'} com sucesso:`,
          userId
        );
        Alert.alert('Success', `User ${newPaidStatus ? 'marked as paid' : 'marked as unpaid'}!`);

        // Atualiza o estado localmente
        setSelectedMembers((prevMembers) =>
          prevMembers.map((member) =>
            member.id === userId ? { ...member, isPaid: newPaidStatus } : member
          )
        );
      } else {
        const errorText = await response.text();
        console.error('Erro ao atualizar status de pagamento:', errorText);
        Alert.alert('Error', `Failed to update payment status: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro na função handleMarkPaid:', error);
      Alert.alert('Error', `Failed to update payment status: ${error}`);
    } finally {
      setLoadingUserId(null);
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
                // Navegar de volta para os detalhes do grupo após deletar a despesa
                navigation.navigate('GroupDetailScreen', { groupId });
              } else {
                const errorText = await response.text();
                console.error('Erro do backend ao deletar despesa:', errorText);
                Alert.alert('Error', `Failed to delete expense: ${errorText}`);
              }
            } catch (error) {
              console.error('Erro na função handleDeleteExpense:', error);
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
        `The total assigned amount (${totalAssigned.toFixed(2)}) must match the expense amount (${amount}).`
      );
      return;
    }

    // Verifique se todos os usuários atribuídos estão pagos
    const allUsersPaid = selectedMembers.every((member) => member.isPaid);

    const updatedExpensePayload = {
      updateExpensesRequestDTO: {
        description: expenseDescription.trim(),
        balance: parseFloat(amount),
        isPaid: allUsersPaid, // Envia o estado correto
      },
      newAssignedUsersMap,
      splitEvenly: isEvenSplit,
    };


    console.log('Payload enviado:', updatedExpensePayload);

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
        console.error('Erro no backend:', errorText);
        Alert.alert('Error', `Failed to update expense: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      Alert.alert('Error', `Failed to update expense: ${error}`);
    } finally {
      setLoading(false);
    }
  };



  const renderMemberItem = ({ item }: { item: { id: string; email: string } }) => {
    const userStatus = selectedMembers.find((m) => m.id === item.id)?.isPaid;

    return (
      <View style={styles.memberContainer}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          onPress={() => handleMarkPaid(item.id)}
          disabled={loadingUserId === item.id}
        >
          <MaterialCommunityIcons
            name={userStatus ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={userStatus ? 'green' : 'gray'}
          />
          <Text style={[styles.memberText, { marginLeft: 10 }]}>{item.email}</Text>
          {loadingUserId === item.id && (
            <ActivityIndicator size="small" color="gray" style={{ marginLeft: 10 }} />
          )}
        </TouchableOpacity>

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
          onPress={() => setIsEvenSplit(true)}
          style={isEvenSplit ? styles.selected : styles.radio}
        >
          Equal Split
        </Text>
        <Text
          onPress={() => setIsEvenSplit(false)}
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
          <CustomButton
            title="Delete Expense"
            onPress={handleDeleteExpense}
            color="red"
            textColor="#fff"
          />
        </>
      )}

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
    borderRadius: 12,
    color: Theme.TERTIARY,
    borderColor: Theme.INPUT,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  selected: {
    fontSize: 16,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: Theme.TERTIARY,
    backgroundColor: Theme.PASTEL,
    color: Theme.TERTIARY,
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 50,
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
});
