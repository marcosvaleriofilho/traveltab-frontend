import React, { useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import CustomButton from '../Components/CustomButton';
import { Theme } from '../../constants/Theme';
import { CustomInput } from '../Components/CustomInput';

export default function SignUpScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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

                <View style={styles.formContainer}>
                    <Text style={[styles.text, { color: Theme.TERTIARY, fontFamily: 'Poppins-Bold' }]}>Sign Up</Text>

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
                    />
                    <CustomInput
                        label="Confirm Password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                    />
                    <CustomButton
                        borderColor={Theme.TERTIARY}
                        title="Sign Up"
                        textColor='white'
                        color={Theme.TERTIARY}
                        onPress={() => console.log('Sign Up pressed')}
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
        height: 550,
    },
});
