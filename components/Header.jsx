import { useColorScheme } from '@/hooks/use-color-scheme'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function Header({title, showBack = false}) {
  const isDark = useColorScheme() === 'dark'
  
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.leftIcons}>
        {showBack ? (
          <TouchableOpacity style={[styles.menuIcon, isDark && styles.menuIconDark]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#4E5DD0"} />
          </TouchableOpacity>
        ) : (
          <Image source={require('@/assets/images/ecg.jpg')} style={styles.logo} />
        )}
      </View>

      <View style={styles.centerSection}>
        <Text style={[styles.titleText, isDark && styles.titleTextDark]} numberOfLines={1}>{title}</Text>
      </View>

      <View style={styles.rightIcons}>
        {!showBack && (
          <TouchableOpacity style={[styles.menuIcon, isDark && styles.menuIconDark]} onPress={()=>router.push('/notifications')}>
            <Ionicons name="notifications" size={24} color={isDark ? "#fff" : "#4E5DD0"} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.menuIcon, isDark && styles.menuIconDark]} onPress={()=>router.push('/profile')}>
          <Ionicons name="person" size={24} color={isDark ? "#fff" : "#4E5DD0"} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#4E5DD0',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        height: 110,
        paddingTop: 30,
    },
    containerDark: {
        backgroundColor: '#333',
    },
    titleText: {
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#fff'
    },
    titleTextDark: {
        color: '#E1E2E4',
    },
    leftIcons: {
        width: 50,
        alignItems: 'flex-start',
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        width: 90,
        justifyContent: 'flex-end',
    },
    menuIcon: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: '#fff',
        height: 40,
        width: 40,
    },
    menuIconDark: {
        backgroundColor: '#444',
    },
    logo: {
        width: 44,
        height: 44,
        borderRadius: 22,
    }
})
