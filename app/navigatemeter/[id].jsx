import Header from '@/components/Header';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width, height } = Dimensions.get('window');

export default function NavigateMeter() {
  const params = useLocalSearchParams();
  const { id, name, address, latitude, longitude, building, meterType } = params;
  const isDark = useColorScheme() === 'dark';
  
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [mapType, setMapType] = useState('standard');
  const mapRef = useRef(null);

  const meterCoords = {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (location) => {
          setUserLocation(location.coords);
          calculateDistance(location.coords, meterCoords);
        }
      );

      return () => subscription.remove();
    })();
  }, []);

  const calculateDistance = (user, meter) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(meter.latitude - user.latitude);
    const dLon = toRad(meter.longitude - user.longitude);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(user.latitude)) *
        Math.cos(toRad(meter.latitude)) *
        Math.sin(dLon / 2) ** 2;
    const dist = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    setDistance(dist.toFixed(2));
  };

  const openExternalMap = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${name}@${latitude},${longitude}?building=${building}&meterType=${meterType}`,
      android: `geo:0,0?q=${latitude},${longitude}(${name})?building=${building}&meterType=${meterType}`,
    });
    Linking.openURL(url);
  };

  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          meterCoords
        ],
        {
          edgePadding: { top: 100, right: 100, bottom: 300, left: 100 },
          animated: true,
        }
      );
    }
  }, [userLocation]);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header title={`Navigating to ${name || 'Meter'}`} />

      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          mapType={mapType}
          provider={PROVIDER_DEFAULT}
          showsUserLocation={true}
          showsPointsOfInterest
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
              title="Your Position"
            >
             
            </Marker>
          )}

          {/* Target Meter Marker */}
          <Marker
            coordinate={meterCoords}
            title={name}
            description={`${address}\nBuilding: ${building}\nMeter Type: ${meterType}`}
          >
            <View style={[styles.meterMarker, isDark && styles.meterMarkerDark]}>
              <Ionicons name="speedometer" size={20} color={isDark ? "#999" : "#fff"} />
            </View>
          </Marker>

          {/* Simple Direct Line */}
          {userLocation && (
            <Polyline
              coordinates={[
                { latitude: userLocation.latitude, longitude: userLocation.longitude },
                meterCoords
              ]}
              strokeColor={isDark ? "#444" : "#4E5DD0"}
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          )}
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
                  ...userLocation,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                });
              }
            }}
          >
            <Ionicons name="locate" size={22} color={isDark ? "#999" : "#4E5DD0"} />
          </TouchableOpacity>
        </View>

        {/* Back Button Floating */}
        <TouchableOpacity style={[styles.floatingBack, isDark && styles.floatingBackDark]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? "#999" : "#1A1C1E"} />
        </TouchableOpacity>
      </View>

      {/* Navigation Detail Sheet */}
      <View style={[styles.infoSheet, isDark && styles.infoSheetDark]}>
        <View style={styles.sheetHeader}>
          <View style={[styles.sheetHandle, isDark && styles.sheetHandleDark]} />
          <Text style={[styles.infoTitle, isDark && styles.infoTitleDark]}>Navigation Details</Text>
        </View>

        <ScrollView>
          <View style={styles.detailRow}>
          <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
            <Ionicons name="speedometer-outline" size={24} color={isDark ? "#999" : "#4E5DD0"} />
          </View>
          <View style={styles.textDetails}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Destination Device</Text>
            <Text style={[styles.value, isDark && styles.valueDark]}>{name}</Text>
            <Text style={[styles.value, isDark && styles.valueDark]}>{meterType}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
            <Ionicons name="location-outline" size={24} color={isDark ? "#999" : "#4E5DD0"} />
          </View>
          <View style={styles.textDetails}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Location Address</Text>
            <Text style={[styles.value, isDark && styles.valueDark]} numberOfLines={1}>{address}</Text>
            <Text style={[styles.value, isDark && styles.valueDark]} numberOfLines={1}>{building}</Text>
          </View>
        </View>
        
        
        </ScrollView>

        <View style={[styles.statsContainer, isDark && styles.statsContainerDark]}>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>Distance</Text>
            <Text style={[styles.statValue, isDark && styles.statValueDark]}>{distance || '--'} km</Text>
          </View>
          <View style={[styles.statDivider, isDark && styles.statDividerDark]} />
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>Est. Time</Text>
            <Text style={[styles.statValue, isDark && styles.statValueDark]}>{distance ? Math.ceil(distance * 15) : '--'} min</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.externalMapBtn} onPress={openExternalMap}>
          <LinearGradient
            colors={isDark ? ['#444', '#555'] : ['#4E5DD0', '#8A9FFE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBtn}
          >
            <Text style={[styles.btnText, isDark && styles.btnTextDark]}>Open in Google Maps</Text>
            <Ionicons name="open-outline" size={20} color={isDark ? "#999" : "#fff"} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
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
    top: 20,
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
  floatingBack: {
    position: 'absolute',
    top: 20,
    left: 20,
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
  floatingBackDark: {
    backgroundColor: '#444',
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
    padding: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 6,
  },
  meterMarkerDark: {
    backgroundColor: '#444',
    borderColor: '#555',
  },
  infoSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  infoSheetDark: {
    backgroundColor: '#333',
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: 20,
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
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1C1E',
  },
  infoTitleDark: {
    color: '#999',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F0F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconContainerDark: {
    backgroundColor: '#444',
  },
  textDetails: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  labelDark: {
    color: '#666',
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  valueDark: {
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FE',
    borderRadius: 20,
    padding: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  statsContainerDark: {
    backgroundColor: '#444',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  statLabelDark: {
    color: '#666',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4E5DD0',
  },
  statValueDark: {
    color: '#999',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },
  statDividerDark: {
    backgroundColor: '#555',
  },
  externalMapBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnTextDark: {
    color: '#999',
  },
});
    