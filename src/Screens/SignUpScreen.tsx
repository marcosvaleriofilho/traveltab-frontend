import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Alert } from 'react-native';
import CustomButton from '../Components/CustomButton';
import { Theme } from '../../constants/Theme';
import { CustomInput } from '../Components/CustomInput';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App'; 

export default function SignUpScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://192.168.1.7:8080/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: name,
                    email: email,
                    password: password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Registro bem-sucedido!', data);
                Alert.alert('Sucesso', 'Registro realizado com sucesso!');
                navigation.navigate('Home');
            } else {
                const errorData = await response.json();
                console.log('Erro no registro:', errorData);
                Alert.alert('Erro', errorData.message || 'Ocorreu um erro no registro.');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Image
                style={styles.backgroundImage}
                source={require('../../assets/fundo.png')}
            />
            <View style={styles.overlay}>
                <Image
                    style={styles.logo}
                    source={require('../../assets/logo.png')}
                />
                <Text style={styles.title}>TravelTab</Text>

                <View style={styles.formContainer}>
                    <Text style={styles.signUpText}>Sign Up</Text>

                    <CustomInput
                        label="Name"
                        value={name}
                        onChange={setName}
                    />
                    <CustomInput
                        label="E-mail"
                        value={email}
                        onChange={setEmail}
                    />
                    <CustomInput
                        label="Password"
                        value={password}
                        onChange={setPassword}
                        secureTextEntry={true}
                    />
                    <CustomInput
                        label="Confirm Password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        secureTextEntry={true}
                    />
                    <CustomButton
                        borderColor={Theme.TERTIARY}
                        title={loading ? 'Loading...' : 'Sign Up'}
                        textColor='white'
                        color={Theme.TERTIARY}
                        onPress={handleSignUp}
                        disabled={loading}
                    />
                </View>
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
    backgroundImage: {
        width: "100%",
        height: '100%',
        position: 'absolute',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    logo: {
        marginBottom: 10,
    },
    title: {
        fontFamily: 'Poppins-Bold',
        fontSize: 24,
        color: 'white',
        textAlign: 'center',
        marginBottom: 30,
    },
    signUpText: {
        fontSize: 30,
        color: Theme.TERTIARY,
        fontFamily: 'Poppins-Bold',
        marginBottom: 20,
    },
    formContainer: {
        width: '100%',
        backgroundColor: Theme.SECONDARY,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        height: 550,
    },
});
