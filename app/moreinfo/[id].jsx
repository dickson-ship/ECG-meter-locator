import Header from '@/components/Header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { db } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function MoreInfo() {
  const params = useLocalSearchParams();
  const [meter, setMeter] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDark = useColorScheme() === 'dark';

  useEffect(() => {
    const fetchMeter = async () => {
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
      <Header title="More Information" showBack={true} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Meter Overview */}
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

        {/* Complete Meter Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Complete Details</Text>
          
          <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
            <InfoRow icon="barcode-outline" label="Meter Number" value={meter.meterNumber} isDark={isDark} />
            <InfoRow icon="person-outline" label="Owner Name" value={meter.name} isDark={isDark} />
            <InfoRow icon="business-outline" label="Building" value={meter.building} isDark={isDark} />
            <InfoRow icon="location-outline" label="Address" value={meter.address} isDark={isDark} />
            <InfoRow icon="compass-outline" label="Latitude" value={meter.latitude} isDark={isDark} />
            <InfoRow icon="compass-outline" label="Longitude" value={meter.longitude} isDark={isDark} />
          </View>
        </View>

        {/* Meter Type Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Meter Type Info</Text>
          
          <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
            <InfoRow icon="flash-outline" label="Meter Type" value={meter.meterType} isDark={isDark} />
            <InfoRow 
              icon="information-circle-outline" 
              label="Type Description" 
              value={meter.meterType === 'Prepaid' 
                ? 'Prepaid meters require payment before electricity is used.' 
                : 'Postpaid meters bill for electricity after it has been used.'
              } 
              isDark={isDark} 
            />
          </View>
        </View>

        {/* Quick Tips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Quick Tips</Text>
          
          <View style={[styles.tipsCard, isDark && styles.tipsCardDark]}>
            <TipItem 
              icon="bulb-outline" 
              title="Regular Checks" 
              text="Check your meter regularly to ensure accurate readings." 
              isDark={isDark} 
            />
            <TipItem 
              icon="shield-checkmark-outline" 
              title="Safety First" 
              text="Always follow safety guidelines when interacting with your meter." 
              isDark={isDark} 
            />
            <TipItem 
              icon="call-outline" 
              title="Contact Support" 
              text="If you encounter issues, contact ECG customer support immediately." 
              isDark={isDark} 
            />
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

const TipItem = ({ icon, title, text, isDark }) => (
  <View style={[styles.tipItem, isDark && styles.tipItemDark]}>
    <View style={[styles.tipIconWrapper, isDark && styles.tipIconWrapperDark]}>
      <Ionicons name={icon} size={22} color={isDark ? "#999" : "#4E5DD0"} />
    </View>
    <View style={styles.tipTextWrapper}>
      <Text style={[styles.tipTitle, isDark && styles.tipTitleDark]}>{title}</Text>
      <Text style={[styles.tipText, isDark && styles.tipTextDark]}>{text}</Text>
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
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  tipsCardDark: {
    backgroundColor: '#444',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tipItemDark: {
    borderBottomColor: '#555',
  },
  tipIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  tipIconWrapperDark: {
    backgroundColor: '#333',
  },
  tipTextWrapper: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1C1E',
    marginBottom: 4,
  },
  tipTitleDark: {
    color: '#999',
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  tipTextDark: {
    color: '#888',
  },
});