import Header from '@/components/Header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { db } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export default function LocateMeter() {
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [mapType, setMapType] = useState('standard');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]);
  const mapRef = useRef(null);
  const isDark = useColorScheme() === 'dark';

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);

      const geo = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geo.length > 0) {
        setUserAddress(geo[0]);
      }
    })();
    getMeters();
  }, []);

  const getMeters = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'meters'));
      const meters = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(meters);
    } catch (error) {
      console.error('Error fetching meters:', error);
      Alert.alert('Error', 'Failed to fetch meters. Please try again.');
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const userLocationName = userAddress
    ? `${userAddress.city || userAddress.subregion}, ${userAddress.country}`
    : 'Detecting location...';

  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(query) ||
      item.address?.toLowerCase().includes(query) ||
      item.meterNumber?.toLowerCase().includes(query) ||
      item.building?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (mapRef.current && (userLocation || filteredData.length > 0)) {
      const coords = [
        ...(userLocation ? [{ latitude: userLocation.latitude, longitude: userLocation.longitude }] : []),
        ...filteredData.map(item => ({ latitude: item.latitude, longitude: item.longitude })),
      ];
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
        animated: true,
      });
    }
  }, [userLocation, searchQuery, data]);

  const handlePress = (item) => {
    router.push({
      pathname: `/meterdetails/${item.id}`,
      params: {
        name: item.name,
        address: item.address,
        latitude: item.latitude,
        longitude: item.longitude,
        image: item.image,
        building: item.building,
        meterType: item.meterType,
        meterNumber: item.meterNumber || item.id,
      }
    });
  };

  const handleNavigate = (item) => {
    router.push({
      pathname: `/navigatemeter/${item.id}`,
      params: {
        name: item.name,
        address: item.address,
        latitude: item.latitude,
        longitude: item.longitude,
        image: item.image,
        building: item.building,
        meterType: item.meterType,
        meterNumber: item.meterNumber || item.id,
      }
    });
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header title="Locate Meters" showBack={true} />

      {/* Map Area */}
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          mapType={mapType}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_DEFAULT}
          showsUserLocation={true}
          showsPointsOfInterest={true}
          showsMyLocationButton={false}
          userInterfaceStyle={isDark ? 'dark' : 'light'}
        >
          {/* User Location Custom Marker */}
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              title="You are here"
              description={userLocationName}
            >

            </Marker>
          )}

          {/* Meter Markers */}
          {filteredData.map((item) => (
            <Marker
              key={item.id}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
            title={item.name}
            description={`${item.address}\nBuilding: ${item.building}\nMeter Type: ${item.meterType}`}

            >
              <TouchableOpacity style={styles.meterMarker}>
                <Image 
                  source={{ uri: item.image }} 
                  style={{ width: 28, height: 28, borderRadius: 14 }} 
                  placeholder={require('@/assets/images/icon.png')}
                  contentFit="cover"
                />
              </TouchableOpacity>
            </Marker>
          ))}
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity 
            style={[styles.mapControlButton, isDark && styles.mapControlButtonDark]} 
            onPress={() => setMapType(mapType === "standard" ? "hybrid" : "standard")}
          >
            <Ionicons name={mapType === "standard" ? "layers" : "map"} size={22} color={isDark ? "#999" : "#4E5DD0"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.mapControlButton, isDark && styles.mapControlButtonDark]} 
            onPress={() => {
              if(userLocation && mapRef.current) {
                mapRef.current.animateToRegion({
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                });
              }
            }}
          >
            <Ionicons name="locate" size={22} color={isDark ? "#999" : "#4E5DD0"} />
          </TouchableOpacity>
        </View>

        {/* Floating Search Bar */}
        <View style={styles.floatingSearchWrapper}>
          <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
            <Ionicons name="search" size={20} color={isDark ? "#999" : "#4E5DD0"} />
            <TextInput
              placeholder="Search Meter ID, Address..."
              placeholderTextColor={isDark ? "#666" : "#999"}
              style={[styles.searchInput, isDark && styles.searchInputDark]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity>
              <Ionicons name="options-outline" size={20} color={isDark ? "#999" : "#4E5DD0"} />
            </TouchableOpacity>
          </View>
          <View style={[styles.locationBadge, isDark && styles.locationBadgeDark]}>
            <Ionicons name="location" size={12} color={isDark ? "#999" : "#fff"} />
            <Text style={[styles.locationBadgeText, isDark && styles.locationBadgeTextDark]} numberOfLines={1}>{userLocationName}</Text>
          </View>
        </View>
      </View>

      {/* Bottom Sheet List */}
      <View style={[styles.bottomSheet, isDark && styles.bottomSheetDark]}>
        <View style={styles.sheetHeader}>
          <View style={[styles.sheetHandle, isDark && styles.sheetHandleDark]} />
          <Text style={[styles.sheetTitle, isDark && styles.sheetTitleDark]}>
            {searchQuery ? `Found ${filteredData.length} Meters` : 'Nearby Meters'}
          </Text>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <View style={[styles.meterCard, isDark && styles.meterCardDark]} key={item.id}>
                  <TouchableOpacity onPress={() => handlePress(item)}>
                    <Image 
                      source={{ uri: item.image }} 
                      style={styles.meterImage} 
                      placeholder={require('@/assets/images/icon.png')}
                      contentFit="cover"
                    />
                  </TouchableOpacity>
                
                <View style={styles.meterInfo}>
                  <Text style={[styles.meterName, isDark && styles.meterNameDark]}>{item.name}</Text>
                  <Text style={[styles.meterAddress, isDark && styles.meterAddressDark]} numberOfLines={1}>{item.address}</Text>
                  <View style={styles.distanceWrapper}>
                    <Ionicons name="navigate-outline" size={14} color={isDark ? "#999" : "#4E5DD0"} />
                    <Text style={[styles.meterDistance, isDark && styles.meterDistanceDark]}>
                      {userLocation
                        ? `${getDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            item.latitude,
                            item.longitude
                          ).toFixed(2)} km away`
                        : 'Calculating...'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity onPress={() => handleNavigate(item)} style={styles.navigateBtn}>
                  <LinearGradient
                    colors={isDark ? ['#444', '#555'] : ['#4E5DD0', '#8A9FFE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.navigateGradient}
                  >
                    <Ionicons name="arrow-redo" size={18} color={isDark ? "#999" : "#fff"} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={60} color={isDark ? "#444" : "#E0E0E0"} />
              <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>No meters found for "{searchQuery}"</Text>
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FE' 
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  mapWrapper: { 
    flex: 1, 
    position: 'relative', 
  },
  mapControls: {
    position: 'absolute',
    right: 20,
    top: 100,
    gap: 12,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  mapControlButtonDark: {
    backgroundColor: '#444',
  },
  floatingSearchWrapper: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    alignItems: 'flex-start',
  },
  searchBar: {
    height: 54,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  searchBarDark: {
    backgroundColor: '#444',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#1A1C1E',
  },
  searchInputDark: {
    color: '#999',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4E5DD0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    maxWidth: '80%',
    elevation: 4,
  },
  locationBadgeDark: {
    backgroundColor: '#444',
  },
  locationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
  },
  locationBadgeTextDark: {
    color: '#999',
  },
  userMarkerOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(78, 93, 208, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4E5DD0',
    borderWidth: 2,
    borderColor: '#fff',
  },
  meterMarker: {
    backgroundColor: '#4E5DD0',
    //padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.45,
    backgroundColor: '#fff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  bottomSheetDark: {
    backgroundColor: '#333',
  },
  sheetHeader: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 2.5,
    marginBottom: 10,
  },
  sheetHandleDark: {
    backgroundColor: '#444',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1C1E',
  },
  sheetTitleDark: {
    color: '#999',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  meterCard: {
    backgroundColor: '#F8F9FE',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  meterCardDark: {
    backgroundColor: '#444',
    borderColor: '#555',
  },
  meterImage: {
    width: 65,
    height: 65,
    borderRadius: 15,
    marginRight: 15,
  },
  meterInfo: {
    flex: 1,
  },
  meterName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1E',
    marginBottom: 2,
  },
  meterNameDark: {
    color: '#999',
  },
  meterAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  meterAddressDark: {
    color: '#777',
  },
  distanceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    
  },
  meterDistance: {
    fontSize: 12,
    color: '#4E5DD0',
    fontWeight: '600',
  },
  meterDistanceDark: {
    color: '#999',
  },
  navigateBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  navigateGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
    marginBottom: 10,
    fontWeight: '600',
  },
  emptyTextDark: {
    color: '#777',
  },
  clearSearchText: {
    color: '#4E5DD0',
    fontWeight: '700',
    fontSize: 14,
  },
});
