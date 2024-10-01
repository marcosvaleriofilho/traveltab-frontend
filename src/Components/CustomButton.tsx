import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';

interface CustomButtonProps {
    onPress: (event: GestureResponderEvent) => void;
    title: string;
    color?: string; // Cor de fundo do botão
    textColor?: string; // Cor do texto
    borderColor?: string; // Cor da borda
    disabled?: boolean; // Propriedade para desabilitar o botão
}

const CustomButton: React.FC<CustomButtonProps> = ({
    onPress,
    title,
    color = '#2196F3',
    textColor = 'white',
    borderColor = 'white',
    disabled = false, // Definindo valor padrão como false
}) => {
    return (
        <TouchableOpacity 
            style={[
                styles.button, 
                { backgroundColor: color, borderColor: borderColor },
                disabled && styles.disabledButton // Aplica estilo de desativado se o botão estiver desativado
            ]}
            onPress={onPress}
            disabled={disabled} // Adicionando funcionalidade de desativado
        >
            <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text> 
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        marginTop: 20,
        width: 350,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2, // Espessura da borda
    },
    buttonText: {
        fontSize: 20,
        fontFamily: "Poppins-Bold"
    },
    disabledButton: {
        opacity: 0.5, // Botão fica mais transparente quando desativado
    },
});

export default CustomButton;
