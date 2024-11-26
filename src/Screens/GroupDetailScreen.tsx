import React, { useEffect, useState } from 'react';
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Theme } from '../../constants/Theme';
import CustomButton from '../Components/CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type GroupDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GroupDetailScreen'>;
type GroupDetailRouteProp = RouteProp<RootStackParamList, 'GroupDetailScreen'>;

interface AssignedUser {
  isPaid: boolean;
  userId: string;
  valorInDebt: number;
}

interface Expense {
  id: string;
  description: string;
  balance: number;
  assignedUsers: AssignedUser[];
}

export default function GroupDetailScreen() {
  const route = useRoute<GroupDetailRouteProp>();
  const navigation = useNavigation<GroupDetailNavigationProp>();
  const { groupId } = route.params;

  const [groupName, setGroupName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [userEmails, setUserEmails] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchGroupDetails();
    }, [groupId])
  );
  

  const fetchGroupDetails = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:8080/groups/detail/${groupId}`);
      if (response.ok) {
        const groupData = await response.json();
        setGroupName(groupData.nameGroup);

        // Processar os e-mails dos usuários
        const emails: { [key: string]: string } = {};
        await Promise.all(
          groupData.groupMembers.map(async (userId: string) => {
            const userResponse = await fetch(`http://10.0.2.2:8080/user/findById/${userId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              emails[userId] = userData.email || 'Email not found';
            }
          })
        );

        setUserEmails(emails);
        setExpenses(groupData.expenses || []);
      } else {
        Alert.alert('Error', 'Fail searching for group details.');
      }
    } catch (error) {
      Alert.alert('Error', `Fail searching for group details.: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchGroupDetails();
    }, [groupId])
  );

  const handleEditName = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:8080/groups/update/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameGroup: groupName }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Group name updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update group name.');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to update group name: ${error}`);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteGroup = async () => {
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
                Alert.alert('Success', 'Group deleted successfully!');
                navigation.navigate('MainTabs');
              } else {
                Alert.alert('Error', 'Failed to delete the group.');
              }
            } catch (error) {
              Alert.alert('Error', `Failed to delete the group: ${error}`);
            }
          },
        },
      ]
    );
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toggleMenu} style={{  }}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color={Theme.SECONDARY} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, menuVisible]);

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity
    onPress={() =>
      navigation.navigate('ManageExpenseScreen', {
        expenseId: item.id, 
        groupId,
        description: item.description,
        balance: item.balance,
        isSplitEvenly: item.assignedUsers.length === 1,
        assignedUsers: item.assignedUsers.map((user) => ({
          userId: user.userId,
          value: user.valorInDebt,
          isPaid: user.isPaid, // Certifique-se de que este valor está correto
        })),
      })      
    }
    
    
      style={styles.item}
    >
      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.amount}>R$ {item.balance.toFixed(2)}</Text>
      </View>
      <Text style={styles.assignedLabel}>Attributed to:</Text>
      {item.assignedUsers.map((user) => (
        <View key={user.userId} style={styles.memberContainer}>
          <Text style={styles.memberText}>{userEmails[user.userId] || 'Unknown'}</Text>
          <Text style={styles.memberDebt}>R${user.valorInDebt.toFixed(2)}</Text>
        </View>
      ))}
    </TouchableOpacity>
  );
  
  
  
  

  return (
    <View style={styles.container}>
      <View style={styles.nameContainer}>
        
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.nameInput}
              value={groupName}
              onChangeText={setGroupName}
              autoFocus
            />
            <TouchableOpacity onPress={handleEditName} style={styles.iconButton}>
              <MaterialCommunityIcons name="check" size={24} color="green" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.nameDisplay}>
            <Text style={styles.groupName}>{groupName}</Text>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.iconButton}>
              <MaterialCommunityIcons name="pencil" size={24} color={Theme.PRIMARY} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <CustomButton
          title="Manage Members"
          color={Theme.TERTIARY}
          textColor={Theme.SECONDARY}
          onPress={() => navigation.navigate('ManageMembersScreen', { groupId })}
          buttonStyle={styles.flexButton} // Define largura flexível
          textStyle={{ fontSize: 14 }}
          />

        <CustomButton
          title="Add Expense"
          color={Theme.TERTIARY}
          textColor={Theme.SECONDARY}
          onPress={() => navigation.navigate('AddExpenseScreen', { groupId })}
          buttonStyle={styles.flexButton} // Define largura flexível
          textStyle={{ fontSize: 14 }}
          />
          <CustomButton
          title="Tasks"
          color={Theme.TERTIARY}
          textColor={Theme.SECONDARY}
          onPress={() => navigation.navigate('TasksScreen', { groupId })} // Navega para a tela de tarefas
          buttonStyle={styles.flexButton}
          textStyle={{ fontSize: 14 }}
        />

      </View>

      <Text style={{color: '#0000'}}>Expenses</Text>

      {loading ? (
        <Text>Loading expenses...</Text>
      ) : expenses.length === 0 ? (
        <Text>This group has no expenses.</Text>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id || item.description}
        />
      )}

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false); // Fecha o menu
                handleDeleteGroup(); // Exibe a confirmação
              }}
            >
              <Text style={styles.menuText}>Delete Group</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
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
  nameContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginRight: 10,
    color: Theme.PRIMARY,
  },
  nameDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10
  },
  groupName: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    flex: 1,
  },
  nameInput: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    borderBottomWidth: 1,
    borderBottomColor: Theme.INPUT,
    flex: 1,
  },
  iconButton: {
    marginLeft: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 50,
  },
  flexButton: {
      flex: 1,
      marginHorizontal: 5, // Espaço entre os botões
  },
    button: {
      flex: 1,
      marginHorizontal: 5,
  },
  
  item: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: Theme.INPUT,
    width: '100%',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  amount: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: 'green',
  },
  assignedLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 10,
  },
  memberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    width: '100%',
  },
  memberText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  memberDebt: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: 'red',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 30,
    paddingRight: 30,
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  menuItem: {
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    color: 'red',
  },
});
