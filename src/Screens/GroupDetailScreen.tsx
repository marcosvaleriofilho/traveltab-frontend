import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App'; // Certifique-se de ajustar o caminho para onde seu RootStackParamList está definido.
import { Theme } from '../../constants/Theme';

// Defina o tipo para a rota
type GroupDetailRouteProp = RouteProp<RootStackParamList, 'GroupDetailScreen'>;

export default function GroupDetailScreen() {
  const route = useRoute<GroupDetailRouteProp>(); // Use o tipo correto aqui
  const navigation = useNavigation();
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

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={groupName}
        onChangeText={setGroupName}
        placeholder="Nome do grupo"
      />

      <Button title="Salvar Alterações" onPress={handleSaveChanges} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: Theme.INPUT,
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
});
