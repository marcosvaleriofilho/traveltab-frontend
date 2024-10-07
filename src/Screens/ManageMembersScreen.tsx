import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, FlatList, TouchableOpacity } from 'react-native';
import CustomButton from '../Components/CustomButton';
import { Theme } from '../../constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ManageMembersScreen({ route, navigation }: any) {
  const { groupId } = route.params;
  const [memberEmail, setMemberEmail] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<{ id: string, email: string }[]>([]);

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

  // Função para buscar os membros do grupo e obter os e-mails associados
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

        // Verificar se 'groupMembers' contém apenas IDs ou objetos com { id, email }
        const membersWithDetails = await Promise.all(group.groupMembers.map(async (userId: string) => {
          // Busca detalhes de cada usuário pelo ID
          const userResponse = await fetch(`http://10.0.2.2:8080/user/findById/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (userResponse.ok) {
            const user = await userResponse.json();
            return { id: user.id, email: user.email }; // Retorna o ID e e-mail do usuário
          }

          return { id: userId, email: 'Desconhecido' }; // Se não encontrar o usuário, retorna email desconhecido
        }));

        setGroupMembers(membersWithDetails);
      } else {
        Alert.alert('Erro', 'Falha ao buscar os membros do grupo.');
      }
    } catch (error) {
      Alert.alert('Erro', `Erro ao buscar membros: ${error}`);
    }
  };

  const addMemberByEmail = async (email: string) => {
    const emailExists = groupMembers.some((member) => member.email === email);
    if (emailExists) {
      Alert.alert('Atenção', 'Este e-mail já foi adicionado ao grupo.');
      return;
    }

    if (email === userEmail) {
      Alert.alert('Atenção', 'Você já está incluído no grupo automaticamente.');
      return;
    }

    try {
      const response = await fetch(`http://10.0.2.2:8080/user/findByEmail?email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const user = await response.json();
        const userId = user.id;

        const addResponse = await fetch(`http://10.0.2.2:8080/groups/addMembers/${groupId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([userId]),
        });

        if (addResponse.ok) {
          Alert.alert('Sucesso', 'Membro adicionado com sucesso!');
          fetchGroupMembers(); // Recarrega a lista de membros após adicionar
          setMemberEmail(''); // Limpa o campo de e-mail
        } else {
          const errorMessage = await addResponse.text();
          console.error('Erro do servidor:', errorMessage);
          Alert.alert('Erro', errorMessage || 'Falha ao adicionar o membro ao grupo.');
        }
      } else {
        const errorMessage = await response.text();
        console.error('Erro ao buscar o ID do usuário:', errorMessage);
        Alert.alert('Erro', 'Usuário não encontrado ou erro ao buscar o ID.');
      }
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o membro.');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      // Verifique se o usuário está tentando se remover
      const currentUser = groupMembers.find((member) => member.email === userEmail);
      
      if (currentUser && currentUser.id === userId) {
        Alert.alert('Erro', 'Você não pode se remover do grupo.');
        return; // Impede a remoção do próprio usuário
      }
    
      const response = await fetch(`http://10.0.2.2:8080/groups/removeMember/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
  
      if (response.ok) {
        Alert.alert('Sucesso', 'Membro removido com sucesso!');
        fetchGroupMembers(); // Atualiza a lista de membros
      } else {
        const errorMessage = await response.text();
        console.error('Erro ao remover o membro:', errorMessage);
        Alert.alert('Erro', 'Falha ao remover o membro do grupo.');
      }
    } catch (error) {
      console.error('Erro ao remover o membro:', error);
      Alert.alert('Erro', `Erro ao remover o membro: ${error}`);
    }
  };

  const handleAddMember = async () => {
    if (memberEmail) {
      await addMemberByEmail(memberEmail);
    } else {
      Alert.alert('Erro', 'O campo de e-mail está vazio.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Gerenciar Membros do Grupo</Text>

      {/* Campo para adicionar novo membro */}
      <TextInput
        style={styles.input}
        placeholder="E-mail do membro"
        value={memberEmail}
        onChangeText={setMemberEmail}
      />
      <CustomButton
        title="Adicionar Membro"
        onPress={handleAddMember}
        color={Theme.TERTIARY}
        textColor={Theme.SECONDARY}
      />

      {/* Lista de membros atuais */}
      <FlatList
        data={groupMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.memberContainer}>
            <Text style={styles.memberText}>{item.email}</Text>
            <TouchableOpacity onPress={() => handleRemoveMember(item.id)}>
              <Ionicons name="remove" size={32} color={Theme.TERTIARY} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>Nenhum membro encontrado.</Text>}
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
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: Theme.INPUT,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  memberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: Theme.INPUT,
  },
  memberText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});
