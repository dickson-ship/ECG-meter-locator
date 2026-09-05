import Header from '@/components/Header'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { db } from '@/services/firebase'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from 'expo-linear-gradient'
import * as Location from 'expo-location'
import { router } from 'expo-router'
import { doc, setDoc } from 'firebase/firestore'
import { useState } from 'react'
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function AddMeter() {
  const [meterName, setMeterName] = useState('')
  const [meterNumber, setMeterNumber] = useState('')
  const [address, setAddress] = useState('')
  const [building, setBuilding] = useState('')
  const [meterType, setMeterType] = useState(null)
  const [image, setImage] = useState(null)
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const isDark = useColorScheme() === 'dark'

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.3, // Significantly reduced quality for Firestore document limit (1MB)
      base64: true,
    })

    if (!result.canceled) {
      // Store the base64 string with proper prefix
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`)
    }
  }

  const getCurrentLocation = async () => {
    setLoading(true)
    let { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Allow location access to get current coordinates.')
      setLoading(false)
      return
    }

    let loc = await Location.getCurrentPositionAsync({})
    setLocation(loc.coords)
    
    // Auto-fill address field from location
    let geo = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    })
    if (geo.length > 0) {
      const addr = geo[0]
      setAddress(`${addr.name || addr.street || ''}, ${addr.city || addr.subregion || ''}`)
    }
    
    setLoading(false)
  }

  const handleAddMeter = async () => {
    if (!meterName || !meterNumber || !address || !building || !meterType || !image || !location) {
      Alert.alert('Missing Info', 'Please fill in all the required fields.')
      return
    }

    setSaving(true)

    try {
      // Save meter data with base64 image string directly to Firestore
      await setDoc(doc(db, 'meters', meterNumber), {
        name: meterName,
        address,
        building,
        latitude: location.latitude,
        longitude: location.longitude,
        image: image, // This is now a base64 string
        meterNumber: meterNumber,
        meterType,
      })

      Alert.alert('Success', 'Meter has been added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ])
      
      setMeterName('')
      setMeterNumber('')
      setAddress('')
      setBuilding('')
      setMeterType(null)
      setImage(null)
      setLocation(null)
    } catch (error) {
      console.error('Error adding meter:', error)
      Alert.alert('Error', 'Failed to add meter. Please try again.')
    } finally {
      setSaving(false)
    }
  }
  const handleCancel = () => {
    setMeterName('')
    setMeterNumber('')
    setAddress('')
    setBuilding('')
    setMeterType(null)
    setImage(null)
    setLocation(null)
    router.back()
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Header title="Add New Meter" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={[styles.title, isDark && styles.titleDark]}>Register Device</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>Enter the details below to add a new ECG meter to your account.</Text>
        </View>

        <View style={[styles.formCard,{backgroundColor: isDark ? '#333' : '#fff'}]}>
          <InputField 
            label="Meter Name" 
            icon="speedometer-outline" 
            value={meterName} 
            onChangeText={setMeterName}
            placeholder="e.g. Living Room Meter"
            isDark={isDark}
          />
          
          <InputField 
            label="Meter Number" 
            icon="barcode-outline"
            value={meterNumber} 
            onChangeText={setMeterNumber}
            placeholder="e.g. ECG-123456-789"
            isDark={isDark}
          />

          <InputField 
            label="Building Name" 
            icon="business-outline" 
            value={building} 
            onChangeText={setBuilding}
            placeholder="e.g. Building A"
            isDark={isDark}
          />

          <InputField 
            label="Address" 
            icon="location-outline" 
            value={address} 
            onChangeText={setAddress}
            placeholder="e.g. Adum, Kumasi"
            isDark={isDark}
          />

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel,{color: isDark ? '#999' : '#000'}]}>Meter Type</Text>
            <View style={[styles.typeContainer,{backgroundColor: isDark ? '#444' : '#fff'}]}>
              {['Prepaid', 'Postpaid'].map((type) => (
                <TouchableOpacity 
                  key={type}
                  style={[styles.typeButton,{backgroundColor: isDark ? '#444' : '#fff'}, meterType === type && styles.typeButtonActive]}
                  onPress={() => setMeterType(type)}
                >
                  <Text style={[styles.typeButtonText,{color: isDark ? '#999' : '#000'}, meterType === type && styles.typeButtonTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel,{color: isDark ? '#999' : '#000'}]}>Meter Image</Text>
            <TouchableOpacity style={[styles.imagePicker,{backgroundColor: isDark ? '#444' : '#fff'}]} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={32} color={isDark ? '#999' : '#4E5DD0'} />
                  <Text style={[styles.imagePlaceholderText,{color: isDark ? '#999' : '#4E5DD0'}]}>Upload Device Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel,{color: isDark ? '#999' : '#000'}]}>Location Coordinates</Text>
            <TouchableOpacity 
              style={[styles.locationButton,{backgroundColor: isDark ? '#444' : '#fff'}, location && styles.locationButtonActive]} 
              onPress={getCurrentLocation}
              disabled={loading}
            >
              <Ionicons 
                name={location ? "location" : "location-outline"} 
                size={20} 
                color={location ? "#fff" : isDark ? '#999' : '#4E5DD0'} 
              />
              <Text style={[styles.locationButtonText,{color: isDark ? '#999' : '#4E5DD0'}, location && styles.locationButtonTextActive]}>
                {loading ? 'Detecting...' : location ? `Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}` : 'Get Current Location'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, saving && styles.disabledButton]} 
          onPress={handleAddMeter}
          disabled={saving}
        >
          <LinearGradient
            colors={['#4E5DD0', '#8A9FFE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Add Meter Device</Text>
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const InputField = ({ label, icon, value, onChangeText, placeholder, keyboardType = 'default', isDark }) => (
  <View style={styles.inputWrapper}>
    <Text style={[styles.inputLabel,{color: isDark ? '#999' : '#000'}]}>{label}</Text>
    <View style={[styles.inputContainer,{backgroundColor: isDark ? '#444' : '#fff'}]}>
      <Ionicons name={icon} size={20} color="#4E5DD0" style={styles.inputIcon} />
      <TextInput
        style={[styles.input,{color: isDark ? '#999' : '#000'}]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        keyboardType={keyboardType}
      />
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  titleDark: {
    color: '#E1E2E4',
  },
  subtitleDark: {
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FE',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeButtonActive: {
    backgroundColor: '#4E5DD0',
    borderColor: '#4E5DD0',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  imagePicker: {
    height: 150,
    borderRadius: 20,
    backgroundColor: '#F8F9FE',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4E5DD0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#4E5DD0',
    fontWeight: '600',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FE',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#4E5DD0',
    paddingVertical: 15,
    gap: 10,
  },
  locationButtonActive: {
    backgroundColor: '#4E5DD0',
    borderColor: '#4E5DD0',
  },
  locationButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4E5DD0',
  },
  locationButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
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
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
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
