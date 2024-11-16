import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Alert } from 'react-native';
import CustomButton from '../Components/CustomButton';
import { Theme } from '../../constants/Theme';
import { CustomInput } from '../Components/CustomInput';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://10.0.2.2:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            const contentType = response.headers.get('content-type');
            let data;

            if (response.ok) {
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                    console.log('Data received from server:', data);
                } else {
                    Alert.alert('Error', 'Unexpected server response.');
                    return;
                }

                if (data.token && data.name) {
                    // Store token and user name in AsyncStorage
                    await AsyncStorage.setItem('authToken', data.token);
                    await AsyncStorage.setItem('userEmail', email); // Use email directly

                    console.log('Token and email successfully saved in AsyncStorage');

                    // Check if email was saved correctly
                    const savedEmail = await AsyncStorage.getItem('userEmail');
                    console.log('Email saved in AsyncStorage:', savedEmail);

                    if (savedEmail === null) {
                        Alert.alert('Error', 'Could not save email in AsyncStorage.');
                    }
                } else {
                    Alert.alert('Error', 'Failed to receive token or user information.');
                }

                console.log('Login successful!', data);
                navigation.navigate('MainTabs');
            } else if (response.status === 400) {
                Alert.alert('Error', 'Invalid credentials. Check your email or password.');
            } else {
                const errorData = contentType && contentType.includes('application/json') ? await response.json() : null;
                Alert.alert('Error', errorData?.message || 'An error occurred on the server.');
            }
        } catch (error) {
            console.error('Request error:', error);
            Alert.alert('Error', 'Could not connect to the server. Check your connection.');
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
