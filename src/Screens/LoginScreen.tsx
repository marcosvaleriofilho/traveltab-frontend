import React, { useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import CustomButton from '../Components/CustomButton';
import { Theme } from '../../constants/Theme';
import { CustomInput } from '../Components/CustomInput';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

export default function LoginScreen() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        console.log('Login pressed');
        navigation.navigate('MainTabs');
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
                <Text style={[styles.text, { fontFamily: 'Poppins-Bold', marginBottom: 30 }]}>TravelTab</Text>
                <Text style={[styles.text, { fontFamily: 'Poppins-Regular', marginBottom: 30 }]}>Start your journey,{`\n`}we'll handle the rest.</Text>


                <View style={styles.formContainer}>
                    <Text style={[styles.text, {fontSize: 30, color: Theme.TERTIARY, marginBottom: 20 , fontFamily: 'Poppins-Bold' }]}>Login</Text>

                    <CustomInput
                        label="E-mail"
                        value={email}
                        onChange={setEmail}
                    />
                    <CustomInput
                        label="Password"
                        value={password}
                        onChange={setPassword}
                    />

                    <CustomButton
                        borderColor={Theme.TERTIARY}
                        title="Login"
                        textColor='white'
                        color={Theme.TERTIARY}
                        onPress={handleLogin}
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
        bottom: 0
    },
    logo: {
        marginBottom: 10,
    },
    text: {
        fontSize: 24,
        color: 'white',
        textAlign: 'center',
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
});
