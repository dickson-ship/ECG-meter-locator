import Header from '@/components/Header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { db } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

const getIconForType = (type) => {
  if (!type) return 'notifications-outline';
  switch (type.toLowerCase()) {
    case 'alert': return 'warning-outline';
    case 'system': return 'cloud-download-outline';
    case 'reminder': return 'calendar-outline';
    case 'success': return 'checkmark-circle-outline';
    case 'info': return 'document-text-outline';
    default: return 'notifications-outline';
  }
};

const getColorForType = (type) => {
  if (!type) return '#666';
  switch (type.toLowerCase()) {
    case 'alert': return '#FF4B4B';
    case 'system': return '#4E5DD0';
    case 'reminder': return '#FF8C00';
    case 'success': return '#4CAF50';
    case 'info': return '#2196F3';
    default: return '#666';
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    return '';
  }
  
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} mins ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

const RenderRightActions = ({ onDelete, isDark }) => (
  <View style={[styles.deleteAction, isDark && styles.deleteActionDark]}>
    <Ionicons name="trash-outline" size={24} color="#FFF" />
    <Text style={styles.deleteText}>Delete</Text>
  </View>
);

const NotificationItem = ({ item, onDelete, isDark }) => {
  const renderRightActions = () => (
    <TouchableOpacity onPress={() => onDelete(item.id)} style={[styles.deleteButton, isDark && styles.deleteButtonDark]}>
      <RenderRightActions onDelete={onDelete} isDark={isDark} />
    </TouchableOpacity>
  );

  const color = getColorForType(item.type);
  const icon = getIconForType(item.type);

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity style={[styles.notificationItem, isDark && styles.notificationItemDark]}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, isDark && styles.titleDark]}>{item.title}</Text>
            <Text style={[styles.time, isDark && styles.timeDark]}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={[styles.message, isDark && styles.messageDark]} numberOfLines={2}>
            {item.message}
          </Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    </Swipeable>
  );
};

export default function Notifications() {
  const isDark = useColorScheme() === 'dark';
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const FILTERS = ['All', 'Alerts', 'System', 'Updates'];



  useEffect(() => {
    let q;
    
    // Try with orderBy first, fallback to unordered query
    try {
      q = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc')
      );
    } catch (error) {
      console.log('OrderBy not available, using unordered query');
      q = collection(db, 'notifications');
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotifications(newNotifications);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to fetch notifications: ' + error.message);
      
      // Try fallback without orderBy
      const fallbackUnsubscribe = onSnapshot(collection(db, 'notifications'), (snapshot) => {
        const newNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotifications(newNotifications);
        setLoading(false);
      });
      
      return () => fallbackUnsubscribe();
    });

    return unsubscribe;
  }, []);

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'notifications', id));
            } catch (error) {
              console.error('Error deleting notification:', error);
              Alert.alert('Error', 'Failed to delete notification');
            }
          }
        }
      ]
    );
  };

  const filteredNotifications = notifications.filter(item => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Alerts') return item.type === 'alert';
    if (activeFilter === 'System') return item.type === 'system';
    if (activeFilter === 'Updates') return item.type === 'info' || item.type === 'success';
    return true;
  });

  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Header title="Notifications" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? "#999" : "#4E5DD0"} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header title="Notifications" showBack={true} />
      
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((filter) => (
            <TouchableOpacity 
              key={filter} 
              style={[
                styles.filterBadge, 
                activeFilter === filter && styles.activeFilterBadge,
                isDark && styles.filterBadgeDark
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                styles.filterText, 
                activeFilter === filter && styles.activeFilterText,
                isDark && styles.filterTextDark
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem 
            item={item} 
            onDelete={handleDelete}
            isDark={isDark} 
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={isDark ? "#444" : "#E0E0E0"} />
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  containerDark: {
    backgroundColor: '#1A1C1E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  filterBadgeDark: {
    backgroundColor: '#2A2C2E',
    borderColor: '#3A3C3E',
  },
  activeFilterBadge: {
    backgroundColor: '#4E5DD0',
    borderColor: '#4E5DD0',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextDark: {
    color: '#999',
  },
  activeFilterText: {
    color: '#FFF',
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  notificationItemDark: {
    backgroundColor: '#2A2C2E',
    shadowOpacity: 0.2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1C1E',
  },
  titleDark: {
    color: '#E1E2E4',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  timeDark: {
    color: '#666',
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  messageDark: {
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4B4B',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FF4B4B',
    borderRadius: 16,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
  },
  deleteButtonDark: {
    backgroundColor: '#B71C1C',
  },
  deleteAction: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  deleteText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  emptyTextDark: {
    color: '#666',
  },
});
