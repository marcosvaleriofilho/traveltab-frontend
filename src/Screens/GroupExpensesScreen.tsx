import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { Theme } from '../../constants/Theme';

interface AssignedUser {
  userId: string;
  valorInDebt: number;
}

interface Expense {
  _id: string;
  description: string;
  balance: number;
  assignedUsers: AssignedUser[];
}

export default function GroupExpensesScreen({ route }: any) {
  const { groupId } = route.params;
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento
  const [userEmails, setUserEmails] = useState<{ [key: string]: string }>({}); // Mapeamento de userId para email

  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:8080/groups/detail/${groupId}`);
        if (response.ok) {
          const groupData = await response.json();
          const groupMembers = groupData.groupMembers;

          // Buscar e-mails dos membros do grupo
          const emails: { [key: string]: string } = {};
          await Promise.all(
            groupMembers.map(async (userId: string) => {
              const userResponse = await fetch(`http://10.0.2.2:8080/user/findById/${userId}`);
              if (userResponse.ok) {
                const userData = await userResponse.json();
                emails[userId] = userData.email || 'Email não encontrado';
              }
            })
          );

          setUserEmails(emails);
          setExpenses(groupData.expenses);
        } else {
          Alert.alert('Erro', 'Não foi possível carregar as despesas.');
        }
      } catch (error) {
        Alert.alert('Erro', `Erro ao carregar despesas: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupMembers();
  }, [groupId]);

  // Renderizar cada item de despesa
  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.item}>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.amount}>R$ {item.balance.toFixed(2)}</Text>

      {/* Mostrar os membros atribuídos à despesa */}
      <Text style={styles.assignedLabel}>Atribuído a:</Text>
      {item.assignedUsers.map((user) => (
        <View key={user.userId} style={styles.memberContainer}>
          <Text style={styles.memberText}>Usuário: {userEmails[user.userId] || 'Desconhecido'}</Text>
          <Text style={styles.memberDebt}>Dívida: R$ {user.valorInDebt.toFixed(2)}</Text>
        </View>
      ))}
    </View>
  );

  // Renderização condicional para mostrar o carregamento ou a lista de despesas
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Despesas do Grupo</Text>
      {loading ? (
        <Text>Carregando...</Text> // Mensagem de carregamento
      ) : expenses.length === 0 ? (
        <Text>Nenhuma despesa encontrada para este grupo.</Text> // Mensagem caso não haja despesas
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item._id} // Corrigindo a chave para cada despesa
        />
      )}
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
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    marginBottom: 20,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.INPUT,
    width: '100%',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
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
});
