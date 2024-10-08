import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Group {
  id: string;
  nameGroup: string;
  groupMembers: string[]; // Array de IDs dos membros
  startDate?: string;
  endDate?: string;
}

export default function MainScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Data não definida';
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(date).toLocaleDateString('pt-BR', options);
  };

  const fetchGroups = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');

      if (!userEmail) {
        Alert.alert('Erro', 'Não foi possível obter o email do usuário.');
        return;
      }

      setLoading(true);

      const response = await fetch(`http://10.0.2.2:8080/groups/byEmail?email=${userEmail}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const fetchedGroups = await response.json();
        const updatedGroups = fetchedGroups.map((group: Group) => ({
          ...group,
          groupMembers: group.groupMembers || [],
        }));
        setGroups(updatedGroups);
      } else {
        console.error('Erro ao buscar grupos do servidor:', await response.text());
        Alert.alert('Erro', 'Falha ao buscar os grupos do usuário.');
      }
    } catch (error) {
      console.error('Erro ao buscar grupos do servidor:', error);
      Alert.alert('Erro', `Falha ao buscar os grupos do usuário. Detalhe do erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.setting}>
        <Text style={styles.title}>Meus grupos</Text>
        <TouchableOpacity
          style={{ alignItems: 'center', justifyContent: 'center' }}
          onPress={() => navigation.navigate('CreateGroupScreen')}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </View>

      <View style={{ width: '100%', flex: 1 }}>
        {loading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.group}
                onPress={() => navigation.navigate('GroupDetailScreen', { groupId: item.id })} // Navegar para a nova tela
              >
                <Text style={styles.text}>{item.nameGroup}</Text>
                {item.startDate && item.endDate ? (
                  <Text style={styles.dates}>
                    {formatDate(item.startDate)} - {formatDate(item.endDate)}
                  </Text>
                ) : (
                  <Text style={styles.dates}>Data não definida</Text>
                )}
                <Text style={styles.memberCount}>Número de membros: {item.groupMembers?.length || 0}</Text>

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
  memberCount: {
    fontFamily: 'Poppins-Bold',
    marginTop: 8,
  },
  dates: {
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
    color: 'gray',
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
