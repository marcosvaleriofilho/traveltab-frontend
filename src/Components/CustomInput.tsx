import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps
} from 'react-native';
import { Theme } from '../../constants/Theme';

// Definição das propriedades do CustomInput
export type CustomInputProps = {
    label?: string;
    value?: string;
    onChange?: (text: string) => void;
    type?: TextInputProps['keyboardType']; 
};

export const CustomInput: React.FC<CustomInputProps> = ({
    label,
    value,
    onChange = () => {},
    type = 'default',
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
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
                    onChangeText={(text) => onChange(text)}
                    onBlur={() => setIsFocused(false)}
                    onFocus={() => setIsFocused(true)}
                    style={styles.input}
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
