import Header from '@/components/Header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { db } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function MeterDetails() {
  const params = useLocalSearchParams();
  const [meter, setMeter] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDark = useColorScheme() === 'dark';

  useEffect(() => {
    const fetchMeter = async () => {
      // Use params if available, otherwise fetch from Firestore
      if (params.name && params.address) {
        setMeter({ ...params, meterNumber: params.meterNumber || params.id });
        setLoading(false);
      } else if (params.id) {
        try {
          const docRef = doc(db, 'meters', params.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setMeter({ meterNumber: docSnap.id, ...docSnap.data() });
          } else {
            Alert.alert('Error', 'Meter not found.');
            router.back();
          }
        } catch (error) {
          console.error('Error fetching meter:', error);
          Alert.alert('Error', 'Failed to load meter details.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMeter();
  }, [params.id]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Meter',
      'Are you sure you want to delete this meter device?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'meters', meter.meterNumber));
              Alert.alert('Success', 'Meter deleted successfully.');
              router.replace('/(tabs)');
            } catch (error) {
              console.error('Error deleting meter:', error);
              Alert.alert('Error', 'Failed to delete meter.');
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `ECG Meter Details:\nName: ${meter.name}\nID: ${meter.meterNumber}\nAddress: ${meter.address}\nBuilding: ${meter.building}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
        <ActivityIndicator size="large" color={isDark ? "#999" : "#4E5DD0"} />
      </View>
    );
  }

  if (!meter) return null;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header title="Meter Details" showBack={true} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Card with Image and Basic Info */}
        <View style={[styles.mainCard, isDark && styles.mainCardDark]}>
          <Image 
            source={{ uri: meter.image }} 
            style={styles.meterImage} 
            placeholder={require('@/assets/images/icon.png')}
            contentFit="cover"
          />
          <View style={styles.badgeContainer}>
            <View style={[styles.typeBadge, { backgroundColor: meter.meterType === 'Prepaid' ? '#4E5DD0' : '#FF8C00' }]}>
              <Text style={styles.typeBadgeText}>{meter.meterType}</Text>
            </View>
          </View>
          <Text style={[styles.meterName, isDark && styles.meterNameDark]}>{meter.name}</Text>
          <Text style={[styles.meterIdText, isDark && styles.meterIdTextDark]}>Meter Number: {meter.meterNumber}</Text>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <View style={[styles.actionIconCircle, isDark && styles.actionIconCircleDark]}>
              <Ionicons name="share-social-outline" size={20} color={isDark ? "#999" : "#4E5DD0"} />
            </View>
            <Text style={[styles.actionButtonText, isDark && styles.actionButtonTextDark]}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push({
              pathname: `/navigatemeter/${meter.meterNumber}`,
              params: meter
            })}
          >
            <View style={[styles.actionIconCircle, isDark && styles.actionIconCircleDark]}>
              <Ionicons name="navigate-outline" size={20} color={isDark ? "#999" : "#4E5DD0"} />
            </View>
            <Text style={[styles.actionButtonText, isDark && styles.actionButtonTextDark]}>Navigate</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <View style={[styles.actionIconCircle, isDark ? { backgroundColor: '#522' } : { backgroundColor: '#FFF0F0' }]}>
              <Ionicons name="trash-outline" size={20} color="#FF4B4B" />
            </View>
            <Text style={[styles.actionButtonText, { color: '#FF4B4B' }]}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Detailed Info Section */}
        <View style={styles.section}>
          <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Meter Information</Text>
            <Text onPress={() => router.push({
              pathname: `/moreinfo/${meter.meterNumber}`,
              params: meter
            })} style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>More Info</Text>
          </View>
          
          <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
            <InfoRow icon="barcode-outline" label="Meter Number" value={meter.meterNumber} isDark={isDark} />
            <InfoRow icon="business-outline" label="Building" value={meter.building} isDark={isDark} />
            <InfoRow icon="location-outline" label="Address" value={meter.address} isDark={isDark} />
          </View>
        </View>

        {/* Location Section with Map Preview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Location Preview</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={{
                latitude: parseFloat(meter.latitude),
                longitude: parseFloat(meter.longitude),
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              userInterfaceStyle={isDark ? 'dark' : 'light'}
            >
              <Marker
                coordinate={{
                  latitude: parseFloat(meter.latitude),
                  longitude: parseFloat(meter.longitude),
                }}
              />
            </MapView>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.mapOverlay}
            >
              <Text style={styles.mapCoordsText}>
                {parseFloat(meter.latitude).toFixed(4)}, {parseFloat(meter.longitude).toFixed(4)}
              </Text>
            </LinearGradient>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const InfoRow = ({ icon, label, value, isDark }) => (
  <View style={[styles.infoRow, isDark && styles.infoRowDark]}>
    <View style={[styles.infoIconWrapper, isDark && styles.infoIconWrapperDark]}>
      <Ionicons name={icon} size={20} color={isDark ? "#999" : "#4E5DD0"} />
    </View>
    <View style={styles.infoTextWrapper}>
      <Text style={[styles.infoLabel, isDark && styles.infoLabelDark]}>{label}</Text>
      <Text style={[styles.infoValue, isDark && styles.infoValueDark]}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainerDark: {
    backgroundColor: '#333',
  },
  scrollContent: {
    padding: 20,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
  },
  mainCardDark: {
    backgroundColor: '#444',
  },
  meterImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: '#F0F2FF',
  },
  badgeContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  meterName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1C1E',
    marginBottom: 5,
  },
  meterNameDark: {
    color: '#999',
  },
  meterIdText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  meterIdTextDark: {
    color: '#777',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EEF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIconCircleDark: {
    backgroundColor: '#444',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4E5DD0',
  },
  actionButtonTextDark: {
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
    paddingLeft: 4,
  },
  sectionTitleDark: {
    color: '#999',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  infoCardDark: {
    backgroundColor: '#444',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoRowDark: {
    borderBottomColor: '#555',
  },
  infoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoIconWrapperDark: {
    backgroundColor: '#333',
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  infoLabelDark: {
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  infoValueDark: {
    color: '#999',
  },
  mapContainer: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    alignItems: 'center',
  },
  mapCoordsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
