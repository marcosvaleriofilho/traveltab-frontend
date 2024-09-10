import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons'; // Importe Ionicons


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
      <View style={{flexDirection:'row',
        justifyContent: 'space-between',alignItems:'center', padding: 16, width: '100%', height: 60, backgroundColor: Theme.TERTIARY}}>
        <Text style={{fontFamily: 'Poppins-Bold', color: 'white', fontSize: 18}}>My groups</Text>
        <TouchableOpacity style={{alignItems: 'center', justifyContent: 'center'}}>
          <Ionicons name="add" size={32} color="white" />      
        </TouchableOpacity> 
        
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
      width: 420,
      margin: 1,
      alignItems: 'flex-start',
      padding: 16,
      justifyContent: 'center',
      height: 100
    },
    text:{
      fontFamily: 'Poppins-Regular',
    }
});

