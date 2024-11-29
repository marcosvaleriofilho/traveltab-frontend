import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent, TextStyle, ViewStyle } from 'react-native';

interface CustomButtonProps {
    onPress: (event: GestureResponderEvent) => void;
    title: string;
    color?: string; // Cor de fundo do botão
    textColor?: string; // Cor do texto
    borderColor?: string; // Cor da borda
    disabled?: boolean; // Propriedade para desabilitar o botão
    textStyle?: TextStyle; // Estilo customizado para o texto
    buttonStyle?: ViewStyle; // Novo: Estilo customizado para o botão
}

const CustomButton: React.FC<CustomButtonProps> = ({
    onPress,
    title,
    color = '#2196F3',
    textColor = 'white',
    borderColor = 'white',
    disabled = false, // Definindo valor padrão como false
    textStyle,
    buttonStyle, // Novo: Permitir estilo customizado para o botão
}) => {
    return (
        <TouchableOpacity 
            style={[
                styles.button, 
                { backgroundColor: color, borderColor: borderColor },
                buttonStyle, // Aplica estilos customizados passados como props
                disabled && styles.disabledButton // Aplica estilo de desativado se o botão estiver desativado
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={[styles.buttonText, { color: textColor }, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 350,
        height: 50,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    buttonText: {
        fontSize: 20,
        fontFamily: "Poppins-Bold",
    },
    disabledButton: {
        opacity: 0.5,
    },
});

export default CustomButton;
