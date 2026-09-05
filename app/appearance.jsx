import Header from '@/components/Header';
import { useTheme } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ThemeOption = ({ label, value, currentTheme, onSelect, icon, isDark }) => {
  const isSelected = currentTheme === value;
  
  return (
    <TouchableOpacity 
      style={[
        styles.optionCard, 
        isDark && styles.optionCardDark,
        isSelected && styles.optionCardSelected,
        isSelected && isDark && styles.optionCardSelectedDark
      ]} 
      onPress={() => onSelect(value)}
    >
      <View style={[styles.optionIconContainer, { backgroundColor: isSelected ? '#4E5DD0' : (isDark ? '#333' : '#F1F3F9') }]}>
        <Ionicons name={icon} size={24} color={isSelected ? '#FFF' : (isDark ? '#999' : '#4E5DD0')} />
      </View>
      <View style={styles.optionTextContainer}>
        <Text style={[styles.optionLabel, isDark && styles.optionLabelDark, isSelected && styles.optionLabelSelectedText]}>
          {label}
        </Text>
        <Text style={[styles.optionDescription, isDark && styles.optionDescriptionDark]}>
          {value === 'system' ? 'Follow device settings' : `Use ${value} theme`}
        </Text>
      </View>
      <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

const ColorOption = ({ color, isSelected, onSelect }) => (
  <TouchableOpacity 
    style={[styles.colorCircle, { backgroundColor: color }, isSelected && styles.colorCircleSelected]} 
    onPress={() => onSelect(color)}
  >
    {isSelected && <Ionicons name="checkmark" size={16} color="#FFF" />}
  </TouchableOpacity>
);

const ACCENT_COLOR_KEY = '@accent_color_preference';

export default function Appearance() {
  const isDark = useColorScheme() === 'dark';
  const { themePreference, setThemePreference } = useTheme();
  const [accentColor, setAccentColorState] = useState('#4E5DD0');

  const accentColors = ['#4E5DD0', '#FF8C00', '#10B981', '#EF4444', '#8A9FFE'];

  // Load accent color on mount
  useEffect(() => {
    const loadAccentColor = async () => {
      try {
        const saved = await AsyncStorage.getItem(ACCENT_COLOR_KEY);
        if (saved) setAccentColorState(saved);
      } catch (error) {
        console.error('Error loading accent color:', error);
      }
    };
    loadAccentColor();
  }, []);

  const setAccentColor = async (color) => {
    try {
      await AsyncStorage.setItem(ACCENT_COLOR_KEY, color);
      setAccentColorState(color);
    } catch (error) {
      console.error('Error saving accent color:', error);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Header title="Appearance" showBack={true} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Theme Mode</Text>
          <View style={styles.optionsGrid}>
            <ThemeOption 
              label="System Default" 
              value="system" 
              currentTheme={themePreference} 
              onSelect={setThemePreference} 
              icon="settings-outline" 
              isDark={isDark}
            />
            <ThemeOption 
              label="Light Mode" 
              value="light" 
              currentTheme={themePreference} 
              onSelect={setThemePreference} 
              icon="sunny-outline" 
              isDark={isDark}
            />
            <ThemeOption 
              label="Dark Mode" 
              value="dark" 
              currentTheme={themePreference} 
              onSelect={setThemePreference} 
              icon="moon-outline" 
              isDark={isDark}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Accent Color</Text>
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.colorGrid}>
              {accentColors.map(color => (
                <ColorOption 
                  key={color} 
                  color={color} 
                  isSelected={accentColor === color} 
                  onSelect={setAccentColor} 
                />
              ))}
            </View>
            <Text style={[styles.cardFooter, isDark && styles.cardFooterDark]}>
              This color will be used for buttons, links and active states.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Preview</Text>
          <View style={[styles.previewCard, isDark && styles.previewCardDark]}>
            <LinearGradient
              colors={[accentColor, isDark ? '#222' : '#8A9FFE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.previewGradient}
            >
              <Text style={styles.previewText}>Professional Interface</Text>
              <View style={styles.previewButton}>
                <Text style={styles.previewButtonText}>Sample Button</Text>
              </View>
            </LinearGradient>
            <View style={styles.previewContent}>
              <View style={[styles.previewLine, { width: '80%' }, isDark && styles.previewLineDark]} />
              <View style={[styles.previewLine, { width: '60%' }, isDark && styles.previewLineDark]} />
              <View style={[styles.previewLine, { width: '90%' }, isDark && styles.previewLineDark]} />
            </View>
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
    marginLeft: 5,
  },
  sectionTitleDark: {
    color: '#999',
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  optionCardDark: {
    backgroundColor: '#2A2C2E',
    borderColor: '#3A3C3E',
  },
  optionCardSelected: {
    borderColor: '#4E5DD0',
    backgroundColor: '#F8F9FF',
  },
  optionCardSelectedDark: {
    borderColor: '#4E5DD0',
    backgroundColor: '#1E2235',
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1E',
    marginBottom: 2,
  },
  optionLabelDark: {
    color: '#E1E2E4',
  },
  optionLabelSelectedText: {
    color: '#4E5DD0',
  },
  optionDescription: {
    fontSize: 12,
    color: '#999',
  },
  optionDescriptionDark: {
    color: '#666',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#4E5DD0',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4E5DD0',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cardDark: {
    backgroundColor: '#2A2C2E',
    borderColor: '#3A3C3E',
  },
  colorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
    transform: [{ scale: 1.1 }],
  },
  cardFooter: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  cardFooterDark: {
    color: '#666',
  },
  previewCard: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  previewCardDark: {
    backgroundColor: '#2A2C2E',
    borderColor: '#3A3C3E',
  },
  previewGradient: {
    padding: 25,
    alignItems: 'center',
  },
  previewText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  previewButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  previewButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  previewContent: {
    padding: 20,
    gap: 10,
  },
  previewLine: {
    height: 8,
    backgroundColor: '#F1F3F9',
    borderRadius: 4,
  },
  previewLineDark: {
    backgroundColor: '#3A3C3E',
  },
});
