import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet } from 'react-native';
import CustomButton from '../Components/CustomButton';
import { Theme } from '../../constants/Theme';

export default function AddExpenseScreen({ route, navigation }: any) {
  const { groupId } = route.params;
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleAddExpense = async () => {
    if (!description || !amount) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    const expenseData = {
      description,
      balance: parseFloat(amount),
      groupId,
    };

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
        Alert.alert('Erro', 'Não foi possível adicionar a despesa.');
      }
    } catch (error) {
      Alert.alert('Erro', `Erro ao adicionar despesa: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Adicionar Despesa ao Grupo</Text>
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
});
