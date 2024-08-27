import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Theme } from '../../constants/Theme';

interface Group {
  id: number;
  name: string;
  description: string;
}

export default function HomeScreen() {
  // Especifica o tipo de estado como um array de objetos 'Grupo'
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    // Dados mockados
    const mockGroups: Group[] = [
      { id: 1, name: 'Grupo de Viagem 1', description: 'Viagem para a praia' },
      { id: 2, name: 'Grupo de Viagem 2', description: 'Viagem para as montanhas' },
      { id: 3, name: 'Grupo de Viagem 3', description: 'Viagem para o exterior' },
    ];

    // Simula uma chamada à API
    setTimeout(() => {
      setGroups(mockGroups);
    }, 100); // Simula um delay de 1 segundo
  }, []);

  return (
    <View style={styles.container}>
      <View style={{flexDirection:'row',justifyContent: 'space-between', padding: 16, width: '100%', height: 55, backgroundColor: 'white'}}>
        <Text style={{fontFamily: 'Poppins-Bold', color: Theme.TERTIARY}}>My groups</Text>
        <Text>Criar Grupo</Text>
        
      </View>
      <FlatList 
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.group} onPress={() => {/* Navegar para GroupScreen */}}>
            <Text style={styles.text}>{item.name}</Text>
            <Text style={styles.text}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
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
    group:{
      marginBottom:1,
      backgroundColor: Theme.SECONDARY,
      width: 375,
      margin: 5,
      borderWidth: 2,
      borderColor: Theme.TERTIARY,
      borderRadius: 15,
      alignItems: 'flex-start',
      padding: 16,
      justifyContent: 'center',
      height: 75
    },
    text:{
      fontFamily: 'Poppins-Regular',
    }
});

