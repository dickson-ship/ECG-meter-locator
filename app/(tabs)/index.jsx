import Header from '@/components/Header'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Location from 'expo-location'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { useColorScheme } from '@/hooks/use-color-scheme';
import { db } from '@/services/firebase'
import { collection, getDocs, } from 'firebase/firestore'


const { width, height } = Dimensions.get('window')

export default function Home() {
  const [locations, setLocations] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [address, setAddress] = useState(null)
  const [mapType, setMapType] = useState('standard')
  const [meters, setMeters] = useState(null)
  const isDark = useColorScheme() === 'dark'

  const getMeters = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'meters'));
      const meters = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMeters(meters);
    } catch (error) {
      console.error('Error fetching meters:', error);
      Alert.alert('Error', 'Failed to fetch meters. Please try again.');
    }
  };

  useEffect(() => {
    getMeters()
  }, [])
  
  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied')
        return
      }

      let location = await Location.getCurrentPositionAsync({})
      setLocations(location.coords)
      let geolocation = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
      
      if (geolocation.length > 0) {
        setAddress(geolocation[0])
        setErrorMsg(null)
      } else {
        setErrorMsg('Location not found')
      }
    }

    getCurrentLocation()
  }, [])

  const locationName = address
    ? `${address.city || address.subregion || address.region}, ${address.country}`
    : 'Detecting location...'

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard,{backgroundColor: isDark ? '#444' : '#fff'}]}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View>
        <Text style={[styles.statTitle,{color: isDark ? '#999' : '#000'}]}>{title}</Text>
        <Text style={[styles.statValue,{color: isDark ? '#999' : '#000'}]}>{value}</Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <Header title="ECG Home" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Map Section */}
        <View style={styles.mapWrapper}>
          {locations ? (
            <View style={styles.mapContainer}>
              <MapView
                mapType={mapType}
                showsPointsOfInterest={true}
                showsUserLocation={true}
                showsMyLocationButton={false}
                style={StyleSheet.absoluteFill}
                region={{
                  latitude: locations.latitude,
                  longitude: locations.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: locations.latitude,
                    longitude: locations.longitude,
                  }}
                  title="Your Location"
                  description={locationName}
                >
                </Marker>
              </MapView>
              
              <TouchableOpacity 
                style={[styles.mapTypeToggle,{backgroundColor: isDark ? '#444' : '#fff'}]}
                onPress={() => setMapType(mapType === "standard" ? "hybrid" : "standard")}
              >
                <Ionicons name={mapType === "standard" ? "layers-outline" : "map-outline"} size={20} color={isDark ? '#999' : '#4E5DD0'} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.mapContainer, styles.mapPlaceholder]}>
              <Text style={styles.placeholderText}>Loading Map...</Text>
            </View>
          )}

          <View style={[styles.locationInfoCard,{backgroundColor: isDark ? '#444' : '#fff'}]}>
            <View style={styles.locationIconBg}>
              <Ionicons name="location" size={20} color={isDark ? '#999' : '#fff'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.locationLabel,{color: isDark ? '#999' : '#000'}]}>Current Location</Text>
              <Text style={[styles.locationText,{color: isDark ? '#999' : '#000'}]} numberOfLines={1}>{locationName}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/locatemeter')}
          >
            <LinearGradient
              colors={['#4E5DD0', '#6C7EE1']}
              style={styles.actionGradient}
            >
              <Ionicons name="search-outline" size={24} color="#fff" />
              <Text style={styles.actionText}>Locate Meters</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/addmeter')}
          >
            <LinearGradient
              colors={['#8A9FFE', '#A5B4FC']}
              style={styles.actionGradient}
            >
              <Ionicons name="add-outline" size={24} color="#fff" />
              <Text style={styles.actionText}>Add Device</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Overview Stats */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Device Overview</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard title="Total Meters" value={meters?.length || 0} icon="speedometer-outline" color="#4E5DD0" />
          <StatCard title="Active" value="982" icon="checkmark-circle-outline" color="#10B981" />
          <StatCard title="Inactive" value="266" icon="close-circle-outline" color="#EF4444" />
          <StatCard title="Readings" value="5.2k" icon="pulse-outline" color="#F59E0B" />
        </View>

        {/* Banner Section */}
        <LinearGradient
          colors={['#4E5DD0', '#8A9FFE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.banner}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Health Report Ready</Text>
            <Text style={styles.bannerSubtitle}>Your weekly ECG analysis is now available for review.</Text>
            <TouchableOpacity style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>View Report</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="analytics" size={80} color="rgba(255,255,255,0.2)" style={styles.bannerIcon} />
        </LinearGradient>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  scrollContent: {
    paddingBottom: 30,
  },
  mapWrapper: {
    padding: 4,
    marginTop: -9, // Overlap slightly with header if needed
  },
  mapContainer: {
    height: height * 0.4,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    position: 'relative',
  },
  mapPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontWeight: '600',
  },
  mapTypeToggle: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  customMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(78, 93, 208, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4E5DD0',
    borderWidth: 2,
    borderColor: '#fff',
  },
  locationInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: -40,
    padding: 15,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  locationIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#4E5DD0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#999',
  },
  seeAllText: {
    color: '#4E5DD0',
    fontWeight: '700',
    fontSize: 14,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    height: 100,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#4E5DD0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  actionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 55) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1C1E',
  },
  banner: {
    margin: 20,
    borderRadius: 30,
    padding: 25,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#4E5DD0',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  bannerContent: {
    flex: 1,
    zIndex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 15,
    lineHeight: 18,
  },
  bannerBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    color: '#4E5DD0',
    fontWeight: '700',
    fontSize: 12,
  },
  bannerIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
})
