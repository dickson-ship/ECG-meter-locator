import Header from '@/components/Header'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { auth, db } from '@/services/firebase'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { doc, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'



export default function Profile() {
  const user = auth.currentUser;
  const [image, setImage] = useState(null);
  const isDarkMode = useColorScheme() === 'dark';

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: () => {
            auth.signOut().then(() => {
              router.replace('/(auth)');
            });
          },
          style: 'destructive'
        }
      ]
    );
  };

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};

    if (user) {
      const userRef = doc(db, 'users', user.uid);
      unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }, (error) => {
        console.error("Error fetching real-time user data:", error);
      });
    }

    return () => unsubscribe();
  }, [user]);

  const pickImage = async () => {

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the media library is required.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const MenuItem = ({ icon, title, onPress, color = "#4E5DD0", showBorder = true, isDarkMode }) => (
    <TouchableOpacity 
      style={[styles.menuItem, showBorder && styles.menuItemBorder, showBorder && isDarkMode && styles.menuItemBorderDark]} 
      onPress={onPress}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: isDarkMode ? `${color}30` : `${color}15` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.menuItemText, isDarkMode && styles.menuItemTextDark]}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#555" : "#ccc"} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Header title="Profile" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <LinearGradient
          colors={isDarkMode ? ['#333', '#444'] : ['#4E5DD0', '#8A9FFE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.profileCard, isDarkMode && styles.profileCardDark]}
        >
          <View style={styles.avatarContainer}>
            <Image 
              source={userData?.photoURL ? { uri: userData?.photoURL } : require('@/assets/images/icon.png')} 
              style={[styles.avatar, isDarkMode && styles.avatarDark]} 
            />
            <TouchableOpacity style={[styles.editAvatarButton, isDarkMode && styles.editAvatarButtonDark]} onPress={pickImage}>
              <Ionicons name="camera" size={16} color={isDarkMode ? "#fff" : "#4E5DD0"} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.userName, isDarkMode && styles.userNameDark]}>{userData?.username || 'User Name'}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={14} color={isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.7)"} />
            <Text style={[styles.userEmail, isDarkMode && styles.userEmailDark]}>{user?.email || 'user@example.com'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="finger-print-outline" size={14} color={isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.7)"} />
            <Text style={[styles.userEmail, isDarkMode && styles.userEmailDark]}>ID: {userData?.staffId || 'No ID available'}</Text>
          </View>

          <View style={[styles.bioContainer, isDarkMode && styles.bioContainerDark]}>
            <Text style={[styles.bioLabel, isDarkMode && styles.bioLabelDark]}>About Me</Text>
            <Text style={[styles.bioValue, isDarkMode && styles.bioValueDark]} numberOfLines={3}>
              {userData?.bio || 'No bio available. Add one in Edit Profile!'}
            </Text>
          </View>
        </LinearGradient>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Account Settings</Text>
          <View style={[styles.menuContainer, isDarkMode && styles.menuContainerDark]}>
            <MenuItem icon="person-outline" title="Edit Profile" isDarkMode={isDarkMode} onPress={() => { router.push('/editprofile') }} />
            <MenuItem icon="notifications-outline" title="Notifications" isDarkMode={isDarkMode} onPress={() => { router.push('/notifications') }} />
            <MenuItem icon="shield-checkmark-outline" title="Privacy & Security" isDarkMode={isDarkMode} onPress={() => {}} />
            <MenuItem icon="color-palette-outline" title="Appearance" isDarkMode={isDarkMode} onPress={() => { router.push('/appearance') }} showBorder={false} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>App Info</Text>
          <View style={[styles.menuContainer, isDarkMode && styles.menuContainerDark]}>
            <MenuItem icon="information-circle-outline" title="About App" isDarkMode={isDarkMode} onPress={() => {}} />
            <MenuItem icon="help-circle-outline" title="Help & Support" isDarkMode={isDarkMode} onPress={() => {}} />
            <MenuItem icon="document-text-outline" title="Terms of Service" isDarkMode={isDarkMode} onPress={() => {}} showBorder={false} />
          </View>
        </View>

        <TouchableOpacity style={[styles.logoutButton, isDarkMode && styles.logoutButtonDark]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF5252" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 8,
    shadowColor: '#4E5DD0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  profileCardDark: {
    shadowColor: '#000',
    borderWidth: 1,
    borderColor: '#444',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarDark: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  editAvatarButtonDark: {
    backgroundColor: '#444',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  userNameDark: {
    color: '#999',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  userEmailDark: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  bioContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    width: '100%',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bioContainerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  bioLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  bioLabelDark: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  bioValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  bioValueDark: {
    color: '#999',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1E',
    marginBottom: 12,
    marginLeft: 5,
  },
  sectionTitleDark: {
    color: '#999',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  menuContainerDark: {
    backgroundColor: '#333',
    shadowOpacity: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemBorderDark: {
    borderBottomColor: '#444',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1C1E',
    fontWeight: '500',
  },
  menuItemTextDark: {
    color: '#999',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  logoutButtonDark: {
    backgroundColor: '#333',
    shadowOpacity: 0,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5252',
    marginLeft: 10,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
})
