import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { Theme } from '../../constants/Theme';

export default function GroupExpensesScreen({ route }: any) {
  const { groupId } = route.params;
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:8080/groups/detail/${groupId}`);
        if (response.ok) {
          const groupData = await response.json();
          setExpenses(groupData.expenses);
        } else {
          Alert.alert('Erro', 'Não foi possível carregar as despesas.');
        }
      } catch (error) {
        Alert.alert('Erro', `Erro ao carregar despesas: ${error}`);
      }
    };

    fetchExpenses();
  }, [groupId]);

  const renderExpenseItem = ({ item }: any) => (
    <View style={styles.item}>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.amount}>R$ {item.balance.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Despesas do Grupo</Text>
      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
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
});
