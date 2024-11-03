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
          Alert.alert('Erro', 'Falha ao buscar os detalhes do grupo.');
        }
      } catch (error) {
        Alert.alert('Erro', `Falha ao buscar os detalhes do grupo: ${error}`);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  const handleSaveChanges = () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza de que deseja salvar as alterações?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
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
                Alert.alert('Sucesso', 'Grupo atualizado com sucesso!');
                navigation.goBack();
              } else {
                Alert.alert('Erro', 'Falha ao atualizar o grupo.');
              }
            } catch (error) {
              Alert.alert('Erro', `Falha ao atualizar o grupo: ${error}`);
            }
          },
        },
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza de que deseja excluir o grupo? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`http://10.0.2.2:8080/groups/delete/${groupId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                Alert.alert('Sucesso', 'Grupo excluído com sucesso!');
                navigation.navigate('MainTabs');
              } else {
                Alert.alert('Erro', 'Falha ao excluir o grupo.');
              }
            } catch (error) {
              Alert.alert('Erro', `Erro ao excluir o grupo: ${error}`);
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
