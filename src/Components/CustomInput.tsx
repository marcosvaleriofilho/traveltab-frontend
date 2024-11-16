import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
    StyleProp,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Theme } from '../../constants/Theme';

// Definição das propriedades do CustomInput
export type CustomInputProps = {
    label?: string;
    value?: string;
    onChange?: (text: string) => void;
    type?: TextInputProps['keyboardType'];
    secureTextEntry?: boolean; // Tornando secureTextEntry opcional
    restrictNumeric?: boolean; // Novo atributo para restringir a entrada numérica
    containerStyle?: StyleProp<ViewStyle>; // Estilo para o container externo
    inputStyle?: StyleProp<TextStyle>; // Estilo para o TextInput
};

export const CustomInput: React.FC<CustomInputProps> = ({
    label,
    value,
    onChange = () => {},
    type = 'default',
    secureTextEntry = false, // Definindo valor padrão como false
    restrictNumeric = false, // Por padrão, não restringe entrada numérica
    containerStyle,
    inputStyle,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleTextChange = (text: string) => {
        // Aplica o regex somente se `restrictNumeric` for true
        if (restrictNumeric) {
            // Permite apenas números e um ponto decimal
            const numericRegex = /^[0-9]*\.?[0-9]*$/;
            if (!numericRegex.test(text)) return; // Ignora entradas inválidas
        }
        onChange(text); // Atualiza o valor válido
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={styles.label}>
                    {label}
                </Text>
            )}
            <View
                style={[
                    styles.inputContainer,
                    {
                        borderColor: isFocused
                            ? Theme.TERTIARY
                            : Theme.INPUT,
                    },
                ]}
            >
                <TextInput
                    value={value}
                    keyboardType={type}
                    onChangeText={handleTextChange} // Aplica validação aqui
                    secureTextEntry={secureTextEntry}
                    onBlur={() => setIsFocused(false)}
                    onFocus={() => setIsFocused(true)}
                    style={[styles.input, inputStyle]} // Adiciona estilo dinâmico aqui
                    {...props}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 350,
        marginBottom: 15,
    },
    label: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        color: Theme.TERTIARY,
    },
    inputContainer: {
        height: 50,
        borderWidth: 2,
        borderRadius: 12,
        backgroundColor: 'white',
        paddingHorizontal: 10,
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        paddingLeft: 10,
        color: 'black',
    },
});
