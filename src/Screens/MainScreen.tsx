import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native'; // Importe NavigationProp
import { RootStackParamList } from '../../App'; // Importe o tipo RootStackParamList
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Group {
  id: string;
  nameGroup: string;
  description: string;
}

export default function MainScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false); // Adicionando um estado de carregamento
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Tipagem correta do useNavigation

  // Função para buscar os grupos do usuário logado
  const fetchGroups = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('userEmail'); // Recupera o e-mail do usuário logado

      if (!userEmail) {
        Alert.alert('Erro', 'Não foi possível obter o email do usuário.');
        return;
      }

      setLoading(true); // Ativa o estado de carregamento

      const response = await fetch(`http://10.0.2.2:8080/groups/byEmail?email=${userEmail}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const fetchedGroups = await response.json();
        setGroups(fetchedGroups);
      } else {
        console.error('Erro ao buscar grupos do servidor:', await response.text());
        Alert.alert('Erro', 'Falha ao buscar os grupos do usuário.');
      }
    } catch (error) {
      console.error('Erro ao buscar grupos do servidor:', error);
      Alert.alert('Erro', `Falha ao buscar os grupos do usuário. Detalhe do erro: ${error}`);
    } finally {
      setLoading(false); // Desativa o estado de carregamento
    }
  };

  // Usa o useFocusEffect para buscar os grupos sempre que a tela for focada
  useFocusEffect(
    useCallback(() => {
      fetchGroups(); // Busca os grupos quando a tela ganha o foco
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.setting}>
        <Text style={styles.title}>Meus grupos</Text>
        <TouchableOpacity
          style={{ alignItems: 'center', justifyContent: 'center' }}
          onPress={() => navigation.navigate('CreateGroupScreen')} // Navegação para a tela de criação do grupo
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </View>

      <View style={{ width: '100%', flex: 1 }}>
        {loading ? ( // Exibe um texto de carregamento enquanto busca os grupos
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.group}>
                <Text style={styles.text}>{item.nameGroup}</Text>
                <Text style={styles.text}>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        )}
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
  group: {
    marginBottom: 1,
    backgroundColor: Theme.SECONDARY,
    width: '99%',
    margin: 1,
    alignSelf: 'center',
    alignItems: 'flex-start',
    padding: 16,
    justifyContent: 'center',
    height: 100,
  },
  text: {
    fontFamily: 'Poppins-Regular',
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    width: '100%',
    height: 60,
    backgroundColor: Theme.TERTIARY,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: Theme.SECONDARY,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: 20,
  },
});
