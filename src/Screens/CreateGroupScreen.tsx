import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GroupType } from '../../constants/enums';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../constants/Theme';
import CustomButton from '../Components/CustomButton';
import { CustomInput } from '../Components/CustomInput';

export default function CreateGroupScreen() {
    const [name, setName] = useState('');
    const [type, setType] = useState<GroupType>(GroupType.OUTROS);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [members, setMembers] = useState<{ id: string; email: string }[]>([]);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const navigation = useNavigation();

    useEffect(() => {
        const getUserEmail = async () => {
            const storedEmail = await AsyncStorage.getItem('userEmail');
            if (storedEmail) {
                setUserEmail(storedEmail);
                addMemberByEmail(storedEmail);
            }
        };
        getUserEmail();
    }, []);

    const formatDate = (date: Date | undefined) => {
        return date ? date.toLocaleDateString('pt-BR') : 'Selecione a data';
    };

    const showStartDatePicker = () => setShowStartPicker(true);
    const showEndDatePicker = () => setShowEndPicker(true);

    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(false);
        if (selectedDate) {
            setEndDate(selectedDate);
        }
    };

    const addMemberByEmail = async (email: string) => {
        const emailExists = members.some((member) => member.email === email);
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
                setMembers((prevMembers) => [...prevMembers, { id: userId, email }]);
            } else {
                Alert.alert('Erro', 'Usuário não encontrado ou erro ao buscar o ID.');
            }
        } catch (error) {
            console.error('Erro ao buscar o ID do usuário:', error);
            Alert.alert('Erro', 'Não foi possível buscar o ID do usuário.');
        }
    };

    const handleAddMember = async () => {
        if (newMemberEmail) {
            await addMemberByEmail(newMemberEmail);
            setNewMemberEmail('');
        }
    };

    const handleRemoveMember = (id: string) => {
        const memberToRemove = members.find((member) => member.id === id);
        if (memberToRemove && memberToRemove.email === userEmail) {
            Alert.alert('Atenção', 'Você não pode remover você mesmo.');
            return;
        }
        setMembers((prevMembers) => prevMembers.filter((member) => member.id !== id));
    };

    const handleCreateGroup = async () => {
        if (!name) {
            Alert.alert('Erro', 'O nome do grupo é obrigatório.');
            return;
        }

        if (type === GroupType.VIAGEM && (!startDate || !endDate)) {
            Alert.alert('Erro', 'Grupos do tipo "Viagem" precisam de datas de início e fim.');
            return;
        }

        const group = {
            nameGroup: name,
            typeGroup: type,
            startDate: type === GroupType.VIAGEM ? startDate : undefined,
            endDate: type === GroupType.VIAGEM ? endDate : undefined,
            groupMembers: members.map((member) => member.id),
        };

        console.log('Dados enviados ao backend:', group);

        try {
            const response = await fetch('http://10.0.2.2:8080/groups/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(group),
            });

            if (response.ok) {
                Alert.alert('Sucesso', 'Grupo criado com sucesso!');
                navigation.goBack();
            } else {
                const errorMessage = await response.text();
                console.log('Erro do servidor:', errorMessage);
                Alert.alert('Erro', errorMessage || 'Falha ao criar o grupo.');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Ionicons
                    name="checkmark"
                    size={24}
                    color="white"
                    style={{ marginRight: 10 }}
                    onPress={handleCreateGroup}
                />
            ),
        });
    }, [navigation, handleCreateGroup]);

    return (
        <View style={styles.container}>
            <CustomInput label="Group Name" value={name} onChange={setName} />

            <View style={{ alignItems: 'flex-start', width: '100%', paddingLeft: 16 }}>
                <Text style={styles.label}>Group Type</Text>
            </View>

            <View style={styles.radioContainer}>
                <Text
                    onPress={() => setType(GroupType.VIAGEM)}
                    style={type === GroupType.VIAGEM ? styles.selected : styles.radio}
                >
                    Travel
                </Text>
                <View style={{ width: '2.5%' }}></View>
                <Text
                    onPress={() => setType(GroupType.OUTROS)}
                    style={type === GroupType.OUTROS ? styles.selected : styles.radio}
                >
                    Other
                </Text>
            </View>

            {type === GroupType.VIAGEM && (
                <>
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <View style={{ alignItems: 'flex-start', width: '100%', paddingLeft: 16 }}>
                            <Text style={styles.label}>Start Date</Text>
                        </View>
                        <CustomButton
                            textStyle={{ fontFamily: 'Poppins-SemiBold', fontSize: 18 }}
                            textColor={Theme.PRIMARY}
                            color={Theme.SECONDARY}
                            borderColor={Theme.INPUT}
                            title={formatDate(startDate)}
                            onPress={showStartDatePicker}
                        />
                        {showStartPicker && (
                            <DateTimePicker
                                value={startDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={onStartDateChange}
                                maximumDate={endDate || undefined}
                            />
                        )}
                    </View>

                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <View style={{ alignItems: 'flex-start', width: '100%', paddingLeft: 16 }}>
                            <Text style={styles.label}>End Date</Text>
                        </View>
                        <CustomButton
                            textStyle={{ fontFamily: 'Poppins-SemiBold', fontSize: 18 }}
                            textColor={Theme.PRIMARY}
                            color={Theme.SECONDARY}
                            borderColor={Theme.INPUT}
                            title={formatDate(endDate)}
                            onPress={showEndDatePicker}
                        />
                        {showEndPicker && (
                            <DateTimePicker
                                value={endDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={onEndDateChange}
                                minimumDate={startDate || new Date()}
                            />
                        )}
                    </View>
                </>
            )}

            <CustomInput label="Add Members e-mails" value={newMemberEmail} onChange={setNewMemberEmail} />

            <CustomButton
                title="Add member"
                color={Theme.TERTIARY}
                textColor={Theme.SECONDARY}
                onPress={handleAddMember}
            />

            <View style={{ marginTop: 20, width: '110%', height: 1.5, backgroundColor: Theme.INPUT }}></View>
            <View style={{ width: '105%' }}>
                <FlatList
                    data={members}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.memberContainer}>
                            <Text style={styles.memberText}>{item.email}</Text>
                            <TouchableOpacity onPress={() => handleRemoveMember(item.id)}>
                                <Ionicons name="remove" size={32} color={Theme.TERTIARY} />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        color: Theme.TERTIARY,
    },
    radioContainer: {
        flexDirection: 'row',
        width: '100%',
        height: 50,
        justifyContent: 'center',
    },
    radio: {
        width: '45%',
        fontSize: 16,
        borderWidth: 2,
        borderRadius: 12,
        color: Theme.TERTIARY,
        borderColor: Theme.INPUT,
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    selected: {
        width: '45%',
        fontSize: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Theme.TERTIARY,
        backgroundColor: Theme.PASTEL,
        color: Theme.TERTIARY,
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    memberContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 16,
        borderBottomWidth: 1,
        borderColor: Theme.INPUT,
    },
    memberText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
    },
});
