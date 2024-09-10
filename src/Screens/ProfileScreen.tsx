// src/Screens/HomeTab.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants/Theme';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.setting}>
        <Text style={styles.text}>My Profile</Text>
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
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttontext}>Phone</Text>
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
        width: '100%',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
      },
    text: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        color: Theme.SECONDARY
    },
    setting: {
      flexDirection:'row',
      justifyContent: 'space-between',
      padding: 16,
      width: '100%',
      height: 60,
      backgroundColor: Theme.TERTIARY
    },
    button: {
      padding: 20,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: '100%',
      backgroundColor: Theme.SECONDARY,
      marginBottom:1,
      margin: 1
    },
    buttontext:{
      fontFamily: "Poppins-Regular",
      fontSize: 16
    }
});

