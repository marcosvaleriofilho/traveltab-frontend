// src/Screens/HomeTab.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MoneyScreen() {
  return (
    <View style={styles.container}>
      <Text>MoneyScreen</Text>
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
});
