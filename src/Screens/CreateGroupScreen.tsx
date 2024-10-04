import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GroupType } from '../../constants/enums'; // Certifique-se de que o enum GroupType está corretamente importado
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateGroupScreen() {
  const [name, setName] = useState('');
  const [type, setType] = useState<GroupType>(GroupType.OUTROS); // Inicializa com "OUTROS"
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [members, setMembers] = useState<string[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null); // Armazena o email do usuário logado

  useEffect(() => {
    // Recupera o email do usuário logado no AsyncStorage e o adiciona ao array de membros
    const getUserEmail = async () => {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      if (storedEmail) {
        setUserEmail(storedEmail);
        addMemberByEmail(storedEmail);
      }
    };
    getUserEmail();
  }, []);

  // Controladores para mostrar/ocultar DateTimePicker
  const showStartDatePicker = () => setShowStartPicker(true);
  const showEndDatePicker = () => setShowEndPicker(true);

  // Manipuladores de mudança de data
  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // Função para adicionar membro ao grupo buscando o ID pelo e-mail
  const addMemberByEmail = async (email: string) => {
    try {
      const response = await fetch(`http://10.0.2.2:8080/user/findByEmail?email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const user = await response.json();
        const userId = user.id; // Supondo que o ID do usuário seja retornado como `user.id`
        setMembers((prevMembers) => [...prevMembers, userId]); // Adiciona o ID ao array de membros
      } else {
        Alert.alert('Erro', 'Usuário não encontrado ou erro ao buscar o ID.');
      }
    } catch (error) {
      console.error('Erro ao buscar o ID do usuário:', error);
      Alert.alert('Erro', 'Não foi possível buscar o ID do usuário.');
    }
  };

  const handleAddMember = async () => {
    if (newMemberEmail) {
      await addMemberByEmail(newMemberEmail);
      setNewMemberEmail(''); // Limpa o campo de entrada após adicionar o membro
    }
  };

  // Função para criar o grupo
  const handleCreateGroup = async () => {
    if (!name) {
      Alert.alert('Erro', 'O nome do grupo é obrigatório.');
      return;
    }

    if (type === GroupType.VIAGEM && (!startDate || !endDate)) {
      Alert.alert('Erro', 'Grupos do tipo "Viagem" precisam de datas de início e fim.');
      return;
    }

    const group = {
      nameGroup: name,
      typeGroup: type,
      startDate: type === GroupType.VIAGEM ? startDate : undefined,
      endDate: type === GroupType.VIAGEM ? endDate : undefined,
      groupMembers: members, // IDs dos membros
    };

    console.log('Dados enviados ao backend:', group);

    try {
      const response = await fetch('http://10.0.2.2:8080/groups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(group),
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Grupo criado com sucesso!');
      } else {
        const errorMessage = await response.text();
        console.log('Erro do servidor:', errorMessage); // Log do erro do servidor
        Alert.alert('Erro', errorMessage || 'Falha ao criar o grupo.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome do Grupo</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Digite o nome do grupo"
      />

      <Text style={styles.label}>Tipo do Grupo</Text>
      <View style={styles.radioContainer}>
        <Text onPress={() => setType(GroupType.VIAGEM)} style={type === GroupType.VIAGEM ? styles.selected : styles.radio}>
          Viagem
        </Text>
        <Text onPress={() => setType(GroupType.OUTROS)} style={type === GroupType.OUTROS ? styles.selected : styles.radio}>
          Outros
        </Text>
      </View>

      {type === GroupType.VIAGEM && (
        <>
          <Button title="Selecionar Data de Início" onPress={showStartDatePicker} />
          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={onStartDateChange}
            />
          )}

          <Button title="Selecionar Data de Fim" onPress={showEndDatePicker} />
          {showEndPicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="default"
              onChange={onEndDateChange}
            />
          )}
        </>
      )}

      <Text style={styles.label}>Adicionar Membros</Text>
      <TextInput
        style={styles.input}
        value={newMemberEmail}
        onChangeText={setNewMemberEmail}
        placeholder="Digite o e-mail do membro"
      />
      <Button title="Adicionar Membro" onPress={handleAddMember} />

      <Button title="Criar Grupo" onPress={handleCreateGroup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  label: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 8,
    marginTop: 4,
  },
  radioContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  radio: {
    marginRight: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selected: {
    marginRight: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#007BFF',
    backgroundColor: '#007BFF',
    color: '#fff',
  },
});
