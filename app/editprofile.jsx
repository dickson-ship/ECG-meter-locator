import Header from '@/components/Header'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { auth, db } from '@/services/firebase'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

const InputField = ({ label, icon, value, onChangeText, placeholder, keyboardType = 'default', multiline = false, isDark }) => (
  <View style={styles.inputWrapper}>
    <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>{label}</Text>
    <View style={[styles.inputContainer, isDark && styles.inputContainerDark, multiline && styles.textAreaContainer]}>
      <Ionicons name={icon} size={20} color="#4E5DD0" style={styles.inputIcon} />
      <TextInput
        style={[styles.input, isDark && styles.inputDark, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#666" : "#A0A0A0"}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  </View>
)

export default function EditProfile() {
  const user = auth.currentUser
  const isDark = useColorScheme() === 'dark'
  
  const [name, setName] = useState(user?.displayName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState('')
  const [staffId, setStaffId] = useState('')
  const [bio, setBio] = useState('')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setName(docSnap.data().username || user?.displayName || '')
          setEmail(docSnap.data().email || user?.email || '')
          setPhone(docSnap.data().phone || '')
          setStaffId(docSnap.data().staffId || '')
          setBio(docSnap.data().bio || '')
          if (docSnap.data().photoURL) setImage(docSnap.data().photoURL)
        }
      }
    };
    fetchUserData();
  }, [user]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    })

    if (!result.canceled) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name.')
      return
    }

    setLoading(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        username: name,
        email,
        phone,
        bio,
        photoURL: image || user?.photoURL,
        staffId,
      })
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ])
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isDark && styles.containerDark]}
    >
      <Header title="Edit Profile" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={image ? { uri: image } : require('@/assets/images/icon.png')} 
              style={[styles.avatar, isDark && styles.avatarDark]} 
            />
            <TouchableOpacity style={[styles.changePhotoButton, isDark && styles.changePhotoButtonDark]} onPress={pickImage}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.changePhotoText, isDark && styles.changePhotoTextDark]}>Change Profile Photo</Text>
        </View>

        {/* Form Section */}
        <View style={[styles.formCard, isDark && styles.formCardDark]}>
          <InputField 
            label="Full Name" 
            icon="person-outline" 
            value={name} 
            onChangeText={setName}
            placeholder="Enter your full name"
            isDark={isDark}
          />
          
          <InputField 
            label="Email Address" 
            icon="mail-outline" 
            value={email} 
            onChangeText={setEmail}
            placeholder="yourname@example.com"
            keyboardType="email-address"
            isDark={isDark}
          />

          <InputField 
            label="Staff ID" 
            icon="card-outline" 
            value={staffId} 
            onChangeText={setStaffId}
            placeholder="Enter your staff ID"
            isDark={isDark}
          />

          <InputField 
            label="Phone Number" 
            icon="call-outline" 
            value={phone} 
            onChangeText={setPhone}
            placeholder="+1 (234) 567-8900"
            keyboardType="phone-pad"
            isDark={isDark}
          />

          <InputField 
            label="Bio" 
            icon="create-outline" 
            value={bio} 
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            multiline={true}
            isDark={isDark}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.disabledButton]} 
          onPress={handleSave}
          disabled={loading}
        >
          <LinearGradient
            colors={isDark ? ['#444', '#555'] : ['#4E5DD0', '#8A9FFE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={[styles.saveButtonText, isDark && styles.saveButtonTextDark]}>Save Changes</Text>
                <Ionicons name="checkmark-circle-outline" size={24} color={isDark ? "#999" : "#fff"} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  avatarSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarDark: {
    borderColor: '#333',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4E5DD0',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 4,
  },
  changePhotoButtonDark: {
    backgroundColor: '#444',
    borderColor: '#000',
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4E5DD0',
    fontWeight: '600',
  },
  changePhotoTextDark: {
    color: '#999',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    marginBottom: 30,
  },
  formCardDark: {
    backgroundColor: '#333',
    elevation: 0,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputLabelDark: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FE',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 15,
    height: 55,
  },
  inputContainerDark: {
    backgroundColor: '#444',
    borderColor: '#555',
  },
  textAreaContainer: {
    height: 100,
    alignItems: 'flex-start',
    paddingTop: 15,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  inputDark: {
    color: '#999',
  },
  textArea: {
    textAlignVertical: 'top',
  },
  saveButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#4E5DD0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    marginBottom: 15,
  },
  disabledButton: {
    opacity: 0.7,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButtonTextDark: {
    color: '#999',
  },
  cancelButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
})