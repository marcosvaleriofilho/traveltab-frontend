import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Alert } from 'react-native';
import CustomButton from '../Components/CustomButton';
import { Theme } from '../../constants/Theme';
import { CustomInput } from '../Components/CustomInput';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

export default function LoginScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://192.168.1.7:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });
    
            // Verificar se o conteúdo da resposta é JSON antes de tentar fazer o parsing
            const contentType = response.headers.get('content-type');
            let data;
    
            if (response.ok) {
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    Alert.alert('Erro', 'Resposta inesperada do servidor.');
                    return;
                }
                console.log('Login bem-sucedido!', data);
                navigation.navigate('MainTabs');
            } else if (response.status === 400) {
                // Exibir uma mensagem de erro para credenciais inválidas
                Alert.alert('Erro', 'Credenciais inválidas. Verifique seu e-mail ou senha.');
            } else {
                const errorData = contentType && contentType.includes('application/json') ? await response.json() : null;
                Alert.alert('Erro', errorData?.message || 'Ocorreu um erro no servidor.');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            Alert.alert('Erro', 'Não foi possível conectar ao servidor. Verifique sua conexão.');
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
                <Text style={styles.titleBold}>TravelTab</Text>
                <Text style={styles.subTitle}>Start your journey,{`\n`}we'll handle the rest.</Text>

                <View style={styles.formContainer}>
                    <Text style={styles.loginText}>Login</Text>

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

                    <CustomButton
                        borderColor={Theme.TERTIARY}
                        title={loading ? 'Loading...' : 'Login'}
                        textColor='white'
                        color={Theme.TERTIARY}
                        onPress={handleLogin}
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
    titleBold: {
        fontFamily: 'Poppins-Bold',
        fontSize: 24,
        color: 'white',
        textAlign: 'center',
        marginBottom: 30,
    },
    subTitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 24,
        color: 'white',
        textAlign: 'center',
        marginBottom: 30,
    },
    formContainer: {
        width: '100%',
        backgroundColor: Theme.SECONDARY,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        height: 400,
    },
    loginText: {
        fontSize: 30,
        color: Theme.TERTIARY,
        marginBottom: 20,
        fontFamily: 'Poppins-Bold',
    },
});
