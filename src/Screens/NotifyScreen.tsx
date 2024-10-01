// src/Screens/HomeTab.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants/Theme';

interface Group {
  id: number;
  name: string;
  description: string;
  value: number;
}

export default function NotifyScreen() {

  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    // Dados mockados
    const mockGroups: Group[] = [
      // { id: 1, name: 'Pagamento recebido', description: 'Grupo 1', value: 400 },
      // { id: 2, name: 'Dívida', description: 'Grupo 2', value: 0 },
      // { id: 3, name: 'A receber', description: 'Grupo 3', value: 0 },
    ];

    // Simula uma chamada à API
    setTimeout(() => {
      setGroups(mockGroups);
    }, 100); // Simula um delay de 1 segundo
  }, []);



  return (
    <View style={styles.container}>
      <View style={styles.setting}>
        <Text style={styles.title}>My Alerts</Text>
      </View>
      <View style={{ width: '100%', flex: 1 }}>
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.group} onPress={() => {/* Navegar para GroupScreen */ }}>
              <Text style={styles.text}>{item.name}</Text>
              <Text style={styles.text}>{item.description}</Text>
              <Text style={styles.text}>R$ {item.value}</Text>
            </TouchableOpacity>
          )}
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
    color: Theme.SECONDARY
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    width: '100%',
    height: 60,
    backgroundColor: Theme.TERTIARY
  },
  group: {
    marginBottom: 1,
    backgroundColor: Theme.SECONDARY,
    width: 420,
    margin: 1,
    alignItems: 'flex-start',
    padding: 16,
    justifyContent: 'center',
    height: 100
  },
  text: {
    fontFamily: 'Poppins-Regular',
  }
});

