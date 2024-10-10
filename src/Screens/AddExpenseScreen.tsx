import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import CustomButton from '../Components/CustomButton';
import { Theme } from '../../constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function AddExpenseScreen({ route, navigation }: any) {
  const { groupId } = route.params;
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [groupMembers, setGroupMembers] = useState<{ id: string; email: string }[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<{ id: string; email: string; value?: string }[]>([]);
  const [isSplitEvenly, setIsSplitEvenly] = useState(true); // Controle de divisão igualitária ou personalizada
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Carregar os membros do grupo ao montar o componente
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

  // Função para buscar membros do grupo
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
            return { id: userId, email: 'Desconhecido' };
          })
        );
        setGroupMembers(membersWithDetails);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os membros do grupo.');
      }
    } catch (error) {
      Alert.alert('Erro', `Erro ao carregar membros: ${error}`);
    }
  };

  // Função para lidar com a adição de despesa
  // Função para lidar com a adição de despesa
const handleAddExpense = async () => {
  if (!description || !amount || selectedMembers.length === 0) {
    Alert.alert('Erro', 'Preencha todos os campos e selecione os membros.');
    return;
  }

  // Estrutura dos dados a serem enviados ao backend
  const membersInvolved = selectedMembers.map((member) => member.id);
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

  // Atualização para incluir o campo `assignedGroups`
  const expenseData = {
    description,
    balance: parseFloat(amount),
    groupId, // Enviando o `groupId` como parte do payload
    assignedUsers, // Mapeamento de usuário e suas dívidas
    assignedGroups: [groupId], // Incluindo `assignedGroups` com o `groupId`
    isSplitEvenly,
  };

  console.log('Dados da despesa a serem enviados:', expenseData);

  try {
    const response = await fetch(`http://10.0.2.2:8080/expenses/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData),
    });

    if (response.ok) {
      Alert.alert('Sucesso', 'Despesa adicionada com sucesso!');
      navigation.goBack();
    } else {
      const errorMessage = await response.text();
      console.error('Erro do servidor:', errorMessage);
      Alert.alert('Erro', errorMessage || 'Não foi possível adicionar a despesa.');
    }
  } catch (error) {
    console.error('Erro ao adicionar despesa:', error);
    Alert.alert('Erro', `Erro ao adicionar despesa: ${error}`);
  }
};


  // Função para selecionar/deselecionar membros e atribuir valores personalizados
  const toggleMemberSelection = (member: { id: string; email: string }) => {
    const isSelected = selectedMembers.some((m) => m.id === member.id);

    if (isSelected) {
      setSelectedMembers((prevSelected) => prevSelected.filter((m) => m.id !== member.id));
    } else {
      setSelectedMembers((prevSelected) => [...prevSelected, { ...member }]);
    }
  };

  // Renderização de cada membro na lista
  const renderMemberItem = ({ item }: { item: { id: string; email: string } }) => {
    const isSelected = selectedMembers.some((m) => m.id === item.id);
    return (
      <View style={styles.memberContainer}>
        <TouchableOpacity onPress={() => toggleMemberSelection(item)}>
          <Text style={[styles.memberText, isSelected ? styles.selected : {}]}>{item.email}</Text>
        </TouchableOpacity>
        {!isSplitEvenly && isSelected && (
          <TextInput
            style={styles.inputAmount}
            placeholder="Valor"
            keyboardType="numeric"
            onChangeText={(value) =>
              setSelectedMembers((prevSelected) =>
                prevSelected.map((m) => (m.id === item.id ? { ...m, value } : m))
              )
            }
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Adicionar Despesa</Text>
      <TextInput
        style={styles.input}
        placeholder="Descrição da despesa"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Valor"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <Text style={styles.label}>Dividir Despesa:</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity onPress={() => setIsSplitEvenly(true)}>
          <Text style={isSplitEvenly ? styles.selectedRadio : styles.radio}>Dividir Igual</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsSplitEvenly(false)}>
          <Text style={!isSplitEvenly ? styles.selectedRadio : styles.radio}>Dividir Customizado</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Selecione os Membros:</Text>
      <FlatList
        data={groupMembers}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.id}
      />

      <CustomButton
        title="Adicionar Despesa"
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: Theme.INPUT,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  radio: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: Theme.INPUT,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Theme.INPUT,
    paddingVertical: 10,
    width: '100%',
  },
  memberText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  selected: {
    backgroundColor: Theme.PASTEL,
  },
  inputAmount: {
    width: 80,
    padding: 5,
    borderColor: Theme.INPUT,
    borderWidth: 1,
    borderRadius: 8,
  },
});
