import { StyleSheet, Text, View, Image } from 'react-native';
import CustomButton from '../Components/CustomButton'; 
import { Theme } from '../../constants/Theme';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Image
                style={styles.backgroundImage}
                source={require('../../assets/fundo.png')}
            />
            <Image
                style={styles.logo}
                source={require('../../assets/logo.png')}
            />
            <Text style={[styles.text, {fontFamily:'Poppins-Bold'}]}>Welcome to{`\n`}TravelTab</Text>
            <Text style={styles.text}>Split the costs,{`\n`}double the memories</Text>

            <CustomButton
                title="Login"
                color= {Theme.SECONDARY}
                textColor= {Theme.TERTIARY }
                onPress={() => console.log('Login pressed')}
            />
            <View style={styles.buttons}>
                <View style={[styles.bar,{marginRight: 10 } ]}></View>
                <Text style={[styles.text,{marginBottom: 0, marginTop:10, fontSize: 20} ]}>or</Text>
                <View style={[styles.bar, {marginLeft: 10 } ]}></View>
            </View>
            <CustomButton
                title="Sign Up"
                textColor='white'
                color="transparent"
                onPress={() => console.log('Sign Up pressed')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        width: "100%",
        height: '100%',
        position: 'absolute',
    },
    logo: {
        zIndex: 1,
        marginBottom: 20,
    },
    text: {
        fontSize: 24,
        color: 'white',
        fontFamily:'Poppins-Regular',
        textAlign: 'center',
        marginBottom: 50,
    },
    buttons:{
        margin: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    bar:{
        width: 150,
        height: 1,
        backgroundColor:Theme.SECONDARY,
        marginTop: 10
    }
});
