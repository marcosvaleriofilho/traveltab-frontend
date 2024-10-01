import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Theme } from '../../constants/Theme';

// Interface para definir o tipo dos pagamentos
interface PaymentHistory {
  id: number;
  description: string;
  amount: number;
  date: string;
}

// Dados simulados para o histórico de pagamentos
const paymentHistory: PaymentHistory[] = [
  // {
  //   id: 1,
  //   description: 'Supermercado',
  //   amount: -150.75,
  //   date: '12/09/2024',
  // },
  // {
  //   id: 2,
  //   description: 'Salário',
  //   amount: 3000,
  //   date: '10/09/2024',
  // },
  // {
  //   id: 3,
  //   description: 'Netflix',
  //   amount: -30,
  //   date: '05/09/2024',
  // },
  // {
  //   id: 6,
  //   description: 'Netflix',
  //   amount: -30,
  //   date: '05/09/2024',
  // },
  // {
  //   id: 5,
  //   description: 'Netflix',
  //   amount: -30,
  //   date: '05/09/2024',
  // },
  // {
  //   id: 4,
  //   description: 'Netflix',
  //   amount: -30,
  //   date: '05/09/2024',
  // },
];

export default function MoneyScreen() {
  // Função para renderizar cada item do histórico de pagamentos
  const renderPaymentItem = ({ item }: { item: PaymentHistory }) => (
    <TouchableOpacity style={styles.historyItem}>
      <View style={{flexDirection: 'column'}}>
        <Text style={styles.historyDescription}>{item.description}</Text>
        <Text style={styles.historyDate}>{item.date}</Text>
      </View>
      <Text style={[styles.historyAmount, { color: item.amount < 0 ? 'red' : 'green' }]}>
        {item.amount < 0 ? `- R$ ${Math.abs(item.amount).toFixed(2)}` : `R$ ${item.amount.toFixed(2)}`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.setting}>
        <Text style={styles.title}>My Balance</Text>
      </View>
      <View style={styles.balanceWrapper}>
        <TouchableOpacity style={styles.balanceTouchable}>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceText}>Balance</Text>
            <Text style={styles.balanceValue}>R$ 0,00</Text>
          </View>
          <Ionicons style={styles.icon} name="chevron-forward-outline" size={28} color={Theme.TERTIARY} />
        </TouchableOpacity>

        <View style={styles.receiveandpay}>
          <TouchableOpacity style={styles.payment}>
            <View style={styles.iconContainer}>
              <FontAwesome6 name="money-bill-transfer" size={32} color={Theme.TERTIARY} />
            </View>
            <Text style={styles.balanceText}>Cash in and Cash out</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.payment}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="list-alt" size={32} color={Theme.TERTIARY} />
          </View>
          <Text style={styles.balanceText}>History</Text>
        </View>
        <FlatList
          data={paymentHistory}
          renderItem={renderPaymentItem}
          keyExtractor={item => item.id.toString()}
          style={styles.historyList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: Theme.SECONDARY,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    width: '100%',
    height: 60,
    backgroundColor: Theme.TERTIARY,
  },
  balanceWrapper: {
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  balanceTouchable: {
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Theme.SECONDARY,
    height: '20%',
    width: '100%',
    flexDirection: 'row',
  },
  balanceContainer: {
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
  },
  balanceText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: Theme.TERTIARY,
  },
  balanceValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 28,
  },
  icon: {
    alignSelf: 'center',
  },
  payment: {
    width: '100%',
    padding: 16,
    backgroundColor: Theme.SECONDARY,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: Theme.PASTEL,
    borderRadius: 12,
    width: 75,
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  receiveandpay: {
    padding: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyList: {
    marginTop: 2,
    width: '100%',
  },
  historyItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 25,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.INPUT,
    backgroundColor: Theme.SECONDARY
  },
  historyDescription: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  historyDate: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  historyAmount: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});
