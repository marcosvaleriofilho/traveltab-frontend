import React, { useEffect, useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Certifique-se de ajustar o caminho para onde seu RootStackParamList está definido.
import { Theme } from '../../constants/Theme';
import CustomButton from '../Components/CustomButton';
import { CustomInput } from '../Components/CustomInput';

// Defina o tipo para a navegação
type GroupDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GroupDetailScreen'>;
type GroupDetailRouteProp = RouteProp<RootStackParamList, 'GroupDetailScreen'>;

export default function GroupDetailScreen() {
  const route = useRoute<GroupDetailRouteProp>(); // Use o tipo correto aqui
  const navigation = useNavigation<GroupDetailNavigationProp>(); // Corrigido para usar o tipo correto
  const { groupId } = route.params; // Agora o TypeScript sabe que groupId existe

  const [groupName, setGroupName] = useState(''); // Nome do grupo
  const [groupMembers, setGroupMembers] = useState([]); // Membros do grupo
  const [startDate, setStartDate] = useState<Date | undefined>(undefined); // Data de início
  const [endDate, setEndDate] = useState<Date | undefined>(undefined); // Data de término

  useEffect(() => {
    // Função para buscar os detalhes do grupo pelo ID
    const fetchGroupDetails = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:8080/groups/detail/${groupId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const group = await response.json();
          setGroupName(group.nameGroup); // Define o nome do grupo no estado
          setGroupMembers(group.groupMembers); // Define os membros do grupo no estado
          setStartDate(group.startDate); // Define a data de início, se aplicável
          setEndDate(group.endDate); // Define a data de término, se aplicável
        } else {
          Alert.alert('Erro', 'Falha ao buscar os detalhes do grupo.');
        }
      } catch (error) {
        Alert.alert('Erro', `Falha ao buscar os detalhes do grupo: ${error}`);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  const handleSaveChanges = async () => {
    try {
      const updatedGroup = {
        nameGroup: groupName,
        startDate: startDate,
        endDate: endDate,
        groupMembers: groupMembers,
      };

      const response = await fetch(`http://10.0.2.2:8080/groups/update/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedGroup),
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Grupo atualizado com sucesso!');
        navigation.goBack();
      } else {
        Alert.alert('Erro', 'Falha ao atualizar o grupo.');
      }
    } catch (error) {
      Alert.alert('Erro', `Falha ao atualizar o grupo: ${error}`);
    }
  };

  const handleAddMember = () => {
    navigation.navigate('ManageMembersScreen', { groupId }); // Navegar para a tela de adicionar membro
  };

  const handleAddExpense = () => {
    navigation.navigate('AddExpenseScreen', { groupId }); // Navegar para a tela de adicionar despesa
  };

  const handleViewExpenses = () => {
    navigation.navigate('GroupExpensesScreen', { groupId }); // Navegar para a tela de visualização de despesas
  };

  const handleDeleteGroup = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:8080/groups/delete/${groupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Grupo excluído com sucesso!');
        navigation.navigate('MainTabs'); // Voltar para a tela principal após exclusão
      } else {
        Alert.alert('Erro', 'Falha ao excluir o grupo.');
      }
    } catch (error) {
      Alert.alert('Erro', `Erro ao excluir o grupo: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <CustomInput
        label="Group Name"
        value={groupName}
        onChange={setGroupName}
      />

      {/* Botão para salvar alterações */}
      <CustomButton
        title="Save Changes"
        color={Theme.TERTIARY}
        textColor={Theme.SECONDARY}
        onPress={handleSaveChanges}
      />

      {/* Botão para adicionar membros */}
      <CustomButton
        title="Manage Members"
        color={Theme.TERTIARY}
        textColor={Theme.SECONDARY}
        onPress={handleAddMember}
      />

      {/* Botão para adicionar despesas */}
      <CustomButton
        title="Add expense"
        color={Theme.TERTIARY}
        textColor={Theme.SECONDARY}
        onPress={handleAddExpense}
      />

      {/* Botão para visualizar despesas */}
      <CustomButton
        title="Visualize expenses"
        color={Theme.TERTIARY}
        textColor={Theme.SECONDARY}
        onPress={handleViewExpenses}
      />

      {/* Botão para excluir o grupo */}
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
