import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';

interface CustomButtonProps {
    onPress: (event: GestureResponderEvent) => void;
    title: string;
    color?: string;
    textColor?: string;  
}

const CustomButton: React.FC<CustomButtonProps> = ({ onPress, title, color = '#2196F3', textColor = 'white' }) => {
    return (
        <TouchableOpacity 
            style={[styles.button, { backgroundColor: color }]} 
            onPress={onPress}
        >
            <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text> 
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 300,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white'
    },
    buttonText: {
        fontSize: 20,
        fontFamily: "Poppins-Bold"
    },
});

export default CustomButton;
