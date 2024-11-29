import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../../constants/Theme';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

interface AssignedUser {
  userId: string;
  valorInDebt: number;
  isPaid: boolean;
}

interface Expense {
  id: string;
  description: string;
  balance: number;
  assignedUsers: AssignedUser[];
  assignedGroups: string[];
  isSplitEvenly: boolean;
}

type MoneyScreenNavigationProp = NavigationProp<RootStackParamList, 'ManageExpenseScreen'>;

export default function MoneyScreen() {
  const [userExpenses, setUserExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDebt, setTotalDebt] = useState(0);
  const [userId, setUserId] = useState<string>('');
  const navigation = useNavigation<MoneyScreenNavigationProp>();

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const fetchUserExpenses = async () => {
        try {
          const userEmail = await AsyncStorage.getItem('userEmail');
          if (!userEmail) {
            Alert.alert('Error', 'Could not retrieve user email.');
            return;
          }

          // Fetch the user ID using the email
          const userResponse = await fetch(
            `http://10.0.2.2:8080/user/findByEmail?email=${userEmail}`
          );
          if (!userResponse.ok) {
            throw new Error('Failed to fetch user ID.');
          }
          const userData = await userResponse.json();
          const userId = userData.id;

          setUserId(userId); // Store userId in state

          const token = await AsyncStorage.getItem('authToken');
          if (!token) {
            Alert.alert('Error', 'Authentication token not found. Please log in again.');
            return;
          }

          // Use the userId in the request
          const response = await fetch(`http://10.0.2.2:8080/expenses/user/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`, // Include the token in the header
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user expenses.');
          }

          const expenses: Expense[] = await response.json();
          console.log('Despesas recebidas:', expenses);

          if (isActive) {
            setUserExpenses(expenses);

            // Calculate the total debt
            const totalDebt = expenses.reduce((total, expense) => {
              const userAssignment = expense.assignedUsers.find(
                (user) => user.userId === userId
              );
              if (userAssignment && !userAssignment.isPaid) {
                return total + userAssignment.valorInDebt;
              }
              return total;
            }, 0);
            setTotalDebt(totalDebt);
          }
        } catch (error) {
          console.error('Error fetching expenses:', error);
          Alert.alert('Error', `Failed to fetch user expenses: ${error}`);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchUserExpenses();

      return () => {
        isActive = false;
      };
    }, [])
  );
  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const userAssignment = item.assignedUsers.find((user) => user.userId === userId);
    if (!userAssignment) {
      return null; // User is not part of this expense
    }
  
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ManageExpenseScreen', {
            expenseId: item.id,
            groupId: item.assignedGroups[0], // Ensure this is valid
            description: item.description,
            balance: item.balance,
            isSplitEvenly: item.isSplitEvenly,
            assignedUsers: item.assignedUsers.map((user) => ({
              userId: user.userId,
              value: user.valorInDebt,
              isPaid: user.isPaid,
            })),
          })
        }
        style={styles.historyItem}
      >
        <View style={{ flexDirection: 'column' }}>
          <Text style={styles.historyDescription}>{item.description}</Text>
          <Text style={styles.historyDate}>{`R$${userAssignment.valorInDebt.toFixed(2)}`}</Text>
        </View>
        <Text
        style={[
          styles.historyAmount,
          userAssignment.isPaid ? styles.paidText : styles.unpaidText,
        ]}
      >          {userAssignment.isPaid ? 'Paid' : 'Unpaid'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.setting}>
        <Text style={styles.title}>My Balance</Text>
      </View>
      <View style={styles.balanceWrapper}>
        {loading ? (
          <ActivityIndicator size="large" color={Theme.TERTIARY} />
        ) : (
          <View style={styles.balanceTouchable}>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceText}>My Expenses Total Debt</Text>
              <Text style={styles.balanceValue}>{`R$${totalDebt.toFixed(2)}`}</Text>
            </View>
           
          </View>
        )}

        <View style={styles.receiveandpay}>
          <View style={styles.payment}>
            <View style={styles.iconContainer}>
              <FontAwesome6 name="money-bill-transfer" size={32} color={Theme.TERTIARY} />
            </View>
            <Text style={styles.balanceText}>Cash In & Out</Text>
          </View>
        </View>
        
        <FlatList
          data={userExpenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          style={styles.historyList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  title: {
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
  balanceWrapper: {
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  balanceTouchable: {
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Theme.SECONDARY,
    height: '20%',
    width: '100%',
    flexDirection: 'row',
  },
  balanceContainer: {
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
  },
  balanceText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: Theme.TERTIARY,
  },
  balanceValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 28,
  },
  icon: {
    alignSelf: 'center',
  },
  payment: {
    width: '100%',
    padding: 16,
    backgroundColor: Theme.SECONDARY,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: Theme.PASTEL,
    borderRadius: 12,
    width: 75,
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  receiveandpay: {
    padding: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyList: {
    marginTop: 2,
    width: '100%',
  },
  historyItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 25,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.INPUT,
    backgroundColor: Theme.SECONDARY,
  },
  historyDescription: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  historyDate: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  historyAmount: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  paidText: {
    color: 'green',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  unpaidText: {
    color: 'red',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});
