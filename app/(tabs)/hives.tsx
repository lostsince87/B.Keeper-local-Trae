import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';
import * as Clipboard from 'expo-clipboard';

// Icons
import { 
  Plus, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Activity, 
  TriangleAlert as AlertTriangle, 
  Crown, 
  Scissors, 
  Trash2, 
  Share2 
} from 'lucide-react-native';

// Types
import { Hive } from '../../types';

// ==================== CONSTANTS ====================

const QUEEN_COLORS = {
  white: '#FFFFFF',
  yellow: '#FFD700',
  red: '#FF0000',
  green: '#008000',
  blue: '#0000FF',
} as const;

const STATUS_COLORS = {
  healthy: '#8FBC8F',
  warning: '#FF8C42',
  critical: '#E74C3C',
  default: '#8B7355',
} as const;

const STATUS_TEXTS = {
  healthy: 'Frisk',
  warning: 'Varning',
  critical: 'Kritisk',
  default: 'Okänd',
} as const;

// ==================== HELPER FUNCTIONS ====================

/**
 * Beräknar drottningens ålder baserat på tillagd datum
 */
const calculateQueenAge = (addedDate: string): string => {
  if (!addedDate) return 'Okänd';
  
  const added = new Date(addedDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - added.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} dagar`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} månad${months !== 1 ? 'er' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} år`;
  }
};

/**
 * Returnerar färg för given status
 */
const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;
};

/**
 * Returnerar text för given status
 */
const getStatusText = (status: string): string => {
  return STATUS_TEXTS[status as keyof typeof STATUS_TEXTS] || STATUS_TEXTS.default;
};

/**
 * Genererar detaljerad statustext baserat på kupans tillstånd
 */
const getDetailedStatusText = (hive: any): string => {
  if (!hive.hasQueen) {
    return 'Drottninglöst - behöver ny drottning';
  }
  
  const varroaLevel = parseFloat(hive.varroa || '0');
  if (varroaLevel > 5) {
    return 'Hög varroabelastning - behandling krävs';
  } else if (varroaLevel > 2) {
    return 'Måttlig varroabelastning - övervakning';
  }
  
  switch (hive.status) {
    case 'healthy':
      return 'Stark och frisk kupa';
    case 'warning':
      if (hive.population === 'Svag') {
        return 'Svag population - behöver stöd';
      }
      return 'Kräver uppmärksamhet';
    case 'critical':
      return 'Akut åtgärd krävs';
    default:
      return 'Status okänd';
  }
};

/**
 * Genererar en 6-siffrig delningskod
 */
const generateShareCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Hanterar delning av kupa genom att generera kod och kopiera till urklipp
 */
const handleShareHive = async (hive: Hive): Promise<void> => {
  try {
    const shareCode = generateShareCode();
    await Clipboard.setStringAsync(shareCode);
    
    Alert.alert(
      'Kupa delad!',
      `Delningskod: ${shareCode}\n\nKoden har kopierats till urklipp. Dela den med andra för att ge dem tillgång till "${hive.name}".`,
      [{ text: 'OK' }]
    );
  } catch (error) {
    Alert.alert('Fel', 'Kunde inte skapa delningskod');
  }
};

/**
 * Skapar standardkupor för första användning
 */
const createDefaultHives = () => [
  {
    id: '1',
    name: 'Kupa 1',
    location: 'Hemmaplan',
    status: 'healthy',
    population: 'Stark',
    varroa: '2.1',
    honey: '15 kg',
    frames: 10,
    lastInspection: '2024-01-15',
    hasQueen: true,
    queenMarked: true,
    queenColor: 'yellow',
    queenWingClipped: false,
    queenAddedDate: '2023-04-15',
    notes: 'Stark kupa med god äggläggning',
    temperature: 35,
    humidity: 60,
    weight: 45,
    treatments: [],
    inspections: []
  },
  {
    id: '2',
    name: 'Kupa 2',
    location: 'Hemmaplan',
    status: 'warning',
    population: 'Medel',
    varroa: '4.2',
    honey: '8 kg',
    frames: 8,
    lastInspection: '2024-01-10',
    hasQueen: true,
    queenMarked: false,
    queenColor: 'white',
    queenWingClipped: true,
    queenAddedDate: '2023-06-20',
    notes: 'Behöver varroabehandling',
    temperature: 33,
    humidity: 65,
    weight: 38,
    treatments: [],
    inspections: []
  },
  {
    id: '3',
    name: 'Kupa 3',
    location: 'Sommarstället',
    status: 'critical',
    population: 'Svag',
    varroa: '8.5',
    honey: '3 kg',
    frames: 6,
    lastInspection: '2024-01-05',
    hasQueen: false,
    queenMarked: false,
    queenColor: 'red',
    queenWingClipped: false,
    queenAddedDate: '',
    notes: 'Drottninglös - behöver ny drottning',
    temperature: 30,
    humidity: 70,
    weight: 25,
    treatments: [],
    inspections: []
  }
];

// ==================== MAIN COMPONENT ====================

export default function HivesScreen() {
  // ==================== STATE ====================
  const [hives, setHives] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadHives();
  }, []);

  // ==================== DATA LOADING ====================
  const loadHives = async (): Promise<void> => {
    try {
      const savedHives = await AsyncStorage.getItem('hives');
      if (savedHives) {
        const parsedHives = JSON.parse(savedHives);
        // Filtrera bort ogiltiga objekt från AsyncStorage
        const validHives = parsedHives.filter((hive: any) => 
          hive && typeof hive === 'object' && hive.id
        );
        
        if (validHives.length === 0) {
          const defaultHives = createDefaultHives();
          setHives(defaultHives);
          await AsyncStorage.setItem('hives', JSON.stringify(defaultHives));
        } else {
          setHives(validHives);
        }
      } else {
        setHives([]);
      }
    } catch (error) {
      console.log('Could not load hives from AsyncStorage:', error);
      setHives([]);
    }
  };

  // ==================== EVENT HANDLERS ====================
  const handleLocationPress = (location: string): void => {
    setSelectedLocation(location);
  };

  const handleBackToLocations = (): void => {
    setSelectedLocation(null);
  };

  const handleDeleteHive = (hiveId: string, hiveName: string): void => {
    Alert.alert(
      'Ta bort kupa',
      `Är du säker på att du vill ta bort "${hiveName}"?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedHives = hives.filter(hive => hive.id !== hiveId);
              setHives(updatedHives);
              await AsyncStorage.setItem('hives', JSON.stringify(updatedHives));
            } catch (error) {
              console.log('Could not delete hive:', error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteLocation = async (locationToDelete: string): Promise<void> => {
    const hivesAtLocation = hives.filter(hive => hive.location === locationToDelete);
    
    if (hivesAtLocation.length > 0) {
      Alert.alert(
        'Kan inte ta bort plats',
        `Det finns ${hivesAtLocation.length} kupa(or) på denna plats. Ta bort kuporna först.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Ta bort plats',
      `Är du säker på att du vill ta bort platsen "${locationToDelete}"?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedHives = hives.filter(hive => hive.location !== locationToDelete);
              setHives(updatedHives);
              await AsyncStorage.setItem('hives', JSON.stringify(updatedHives));
            } catch (error) {
              console.log('Could not delete location:', error);
            }
          },
        },
      ]
    );
  };

  // ==================== RENDER HELPERS ====================
  const renderRightActionForLocation = (locationName: string) => (
    <View style={styles.deleteAction}>
      <Pressable 
        style={styles.deleteButton} 
        onPress={() => handleDeleteLocation(locationName)}
      >
        <Trash2 size={20} color="white" />
        <Text style={styles.deleteText}>Ta bort</Text>
      </Pressable>
    </View>
  );

  const renderRightActionForHive = (hive: any) => (
    <View style={styles.deleteAction}>
      <Pressable 
        style={styles.deleteButton} 
        onPress={() => handleDeleteHive(hive.id, hive.name)}
      >
        <Trash2 size={20} color="white" />
        <Text style={styles.deleteText}>Ta bort</Text>
      </Pressable>
    </View>
  );

  const renderLocationCard = (location: string) => {
    const locationHives = hives.filter(hive => hive.location === location);
    const healthyCount = locationHives.filter(hive => hive.status === 'healthy').length;
    const warningCount = locationHives.filter(hive => hive.status === 'warning').length;
    const criticalCount = locationHives.filter(hive => hive.status === 'critical').length;

    return (
      <Swipeable
        key={location}
        renderRightActions={() => renderRightActionForLocation(location)}
        rightThreshold={40}
      >
        <Pressable 
          style={styles.locationCard}
          onPress={() => handleLocationPress(location)}
        >
          <View style={styles.locationHeader}>
            <View style={styles.locationHeaderLeft}>
              <Text style={styles.locationName}>{location}</Text>
              <Text style={styles.locationCount}>
                {locationHives.length} kupa{locationHives.length !== 1 ? 'r' : ''}
              </Text>
            </View>
            <View style={styles.locationStats}>
              {locationHives.slice(0, 3).map((hive, index) => (
                <View key={hive.id} style={styles.locationHivePreview}>
                  <Text style={styles.previewHiveName}>{hive.name}</Text>
                  <View style={[
                    styles.previewStatus, 
                    { backgroundColor: getStatusColor(hive.status) }
                  ]} />
                </View>
              ))}
              {locationHives.length > 3 && (
                <Text style={styles.moreHives}>+{locationHives.length - 3} till</Text>
              )}
            </View>
          </View>
          
          <View style={styles.hiveIndicators}>
            {healthyCount > 0 && (
              <View style={[
                styles.indicator, 
                { backgroundColor: getStatusColor('healthy') + '20' }
              ]}>
                <Text style={[
                  styles.statusText, 
                  { color: getStatusColor('healthy') }
                ]}>
                  {healthyCount} frisk{healthyCount !== 1 ? 'a' : ''}
                </Text>
              </View>
            )}
            {warningCount > 0 && (
              <View style={[
                styles.indicator, 
                { backgroundColor: getStatusColor('warning') + '20' }
              ]}>
                <Text style={[
                  styles.statusText, 
                  { color: getStatusColor('warning') }
                ]}>
                  {warningCount} varning{warningCount !== 1 ? 'ar' : ''}
                </Text>
              </View>
            )}
            {criticalCount > 0 && (
              <View style={[
                styles.indicator, 
                { backgroundColor: getStatusColor('critical') + '20' }
              ]}>
                <Text style={[
                  styles.statusText, 
                  { color: getStatusColor('critical') }
                ]}>
                  {criticalCount} kritisk{criticalCount !== 1 ? 'a' : ''}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  const renderHiveCard = (hive: any) => (
    <Swipeable
      key={hive.id}
      renderRightActions={() => renderRightActionForHive(hive)}
      rightThreshold={40}
    >
      <Pressable 
        style={styles.hiveCard}
        onPress={() => router.push({
          pathname: '/hive-details',
          params: { hiveId: hive.id }
        })}
      >
        <View style={styles.hiveHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hiveName}>{hive.name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color="#8B7355" />
              <Text style={styles.location}>{hive.location}</Text>
              {hive.hasQueen && (
                <View style={styles.queenInfo}>
                  <Crown 
                    size={14} 
                    color={hive.queenMarked && hive.queenColor 
                      ? QUEEN_COLORS[hive.queenColor as keyof typeof QUEEN_COLORS] 
                      : '#F7B801'
                    }
                    fill={hive.queenMarked && hive.queenColor 
                      ? QUEEN_COLORS[hive.queenColor as keyof typeof QUEEN_COLORS] 
                      : '#F7B801'
                    }
                  />
                  {hive.queenWingClipped && (
                    <Scissors size={12} color="#8B7355" style={{ marginLeft: 4 }} />
                  )}
                </View>
              )}
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable 
              style={styles.shareButton}
              onPress={(e) => {
                e.stopPropagation();
                handleShareHive(hive);
              }}
            >
              <Share2 size={18} color="#8FBC8F" />
            </Pressable>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(hive.status) + '20' }
            ]}>
              <Text style={[
                styles.statusText, 
                { color: getStatusColor(hive.status) }
              ]}>
                {getStatusText(hive.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Activity size={16} color="#8B7355" />
            <Text style={styles.statLabel}>Population</Text>
            <Text style={styles.statValue}>{hive.population}</Text>
          </View>
          <View style={styles.statItem}>
            <AlertTriangle size={16} color="#E74C3C" />
            <Text style={styles.statLabel}>Varroa</Text>
            <Text style={[
              styles.statValue, 
              { 
                color: parseFloat(hive.varroa || '0') > 5 
                  ? '#E74C3C' 
                  : parseFloat(hive.varroa || '0') > 2 
                    ? '#FF8C42' 
                    : '#8FBC8F' 
              }
            ]}>
              {hive.varroa}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Droplets size={16} color="#F7B801" />
            <Text style={styles.statLabel}>Honung</Text>
            <Text style={styles.statValue}>{hive.honey}</Text>
          </View>
        </View>

        <View style={styles.hiveFooter}>
          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusDetailText,
              { color: getStatusColor(hive.status) }
            ]}>
              {getDetailedStatusText(hive)}
            </Text>
            <Text style={styles.lastInspectionDate}>
              Senast inspekterad: {hive.lastInspection}
            </Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.frames}>Ramar: {hive.frames}</Text>
            {hive.hasQueen && hive.queenAddedDate && (
              <Text style={styles.queenAge}>
                Drottning: {calculateQueenAge(hive.queenAddedDate)}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );

  // ==================== COMPUTED VALUES ====================
  const locations = [...new Set(hives.map(hive => hive.location))];
  const hivesInLocation = selectedLocation 
    ? hives.filter(hive => hive.location === selectedLocation)
    : [];

  // ==================== RENDER ====================
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FFF8E1', '#F5F5DC']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {selectedLocation && (
              <Pressable 
                style={styles.backToLocationsButton} 
                onPress={handleBackToLocations}
              >
                <Text style={styles.backToLocationsText}>← Platser</Text>
              </Pressable>
            )}
            <Text style={styles.title}>
              {selectedLocation ? selectedLocation : 'Mina kupor'}
            </Text>
          </View>
          <Pressable 
            style={styles.addButton} 
            onPress={() => router.push('/add-hive')}
          >
            <Plus size={24} color="white" />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {!selectedLocation ? (
            // Visa platser
            locations.map(location => renderLocationCard(location))
          ) : (
            // Visa kupor för vald plats
            hivesInLocation.map(hive => renderHiveCard(hive))
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  backToLocationsButton: {
    marginBottom: 4,
  },
  backToLocationsText: {
    fontSize: 14,
    color: '#8B7355',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  addButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  // Location card styles
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationHeaderLeft: {
    flex: 1,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  locationCount: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 8,
  },
  locationStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationHivePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  previewHiveName: {
    fontSize: 12,
    color: '#8B7355',
    marginRight: 8,
  },
  previewStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreHives: {
    fontSize: 12,
    color: '#8B7355',
    fontStyle: 'italic',
  },
  hiveIndicators: {
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // Hive card styles
  hiveCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hiveName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#8B7355',
    marginRight: 8,
  },
  queenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  shareButton: {
    backgroundColor: '#8FBC8F20',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Stats styles
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B7355',
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  // Footer styles
  hiveFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statusContainer: {
    flex: 1,
  },
  statusDetailText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastInspectionDate: {
    fontSize: 12,
    color: '#8B7355',
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  frames: {
    fontSize: 12,
    color: '#8B7355',
    marginBottom: 2,
  },
  queenAge: {
    fontSize: 12,
    color: '#8B7355',
  },
  // Action styles
  deleteAction: {
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginBottom: 16,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
});