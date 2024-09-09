// src/Screens/HomeTab.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants/Theme';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.setting}>
        <Text style={styles.text}>Your Profile</Text>
      </View>
      <View style={[{borderBottomWidth: 1, borderColor: Theme.INPUT } ,styles.setting]}>
        <Text style={[styles.text, {fontFamily: 'Poppins-SemiBold', fontSize: 16}]}>Settings</Text>
      </View>
        <TouchableOpacity style={styles.button}>
            <Text style={styles.buttontext}>E-mail</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
            <Text style={styles.buttontext}>Name</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttontext}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button,{justifyContent: 'center', borderBottomWidth: 0} ]}>
          <Text style={[styles.buttontext, {color: 'red', fontFamily: "Poppins-SemiBold"}]}>Log Out</Text>
        </TouchableOpacity>
      
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
    text: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: Theme.TERTIARY
    },
    setting: {
      flexDirection:'row',
      justifyContent: 'space-between',
      top: 0,
      padding: 16,
      width: '100%',
      height: 60,
    },
    button: {
      padding: 24,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: '100%',
      borderBottomWidth: 1,
      borderColor: Theme.INPUT,
    },
    buttontext:{
      fontFamily: "Poppins-Regular",
      fontSize: 16
    }
});

