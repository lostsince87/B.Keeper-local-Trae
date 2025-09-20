import { View, Text, StyleSheet, ScrollView, Pressable, Animated , Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FileText, Droplets, TrendingUp, CircleAlert as AlertCircle, Calendar, Activity, Plus, X, Trash2 } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { BeehiveIcon } from '@/components/BeehiveIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';
import { Task, Hive } from '../../types';

type DisplayTask = Task & { color?: string; task?: string; date?: string; priority?: string };

export default function HomeScreen() {
  const [selectedStats] = useState(['hives', 'inspections', 'honey', 'nucleus']);
  const [tasks, setTasks] = useState<DisplayTask[]>([]);
  const [hives, setHives] = useState<Hive[]>([]);
  const [showActionMenu, setShowActionMenu] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const savedTasks = JSON.parse(await AsyncStorage.getItem('tasks') || '[]');
          const savedHives = JSON.parse(await AsyncStorage.getItem('hives') || '[]');
        
          if (savedTasks.length === 0) {
            // Default tasks if none saved
            const defaultTasks: DisplayTask[] = [
            ];
            
            setTasks(defaultTasks);
            await AsyncStorage.setItem('tasks', JSON.stringify(defaultTasks));
          } else {
            // Convert saved tasks to display format
            const displayTasks = savedTasks.map((task: any) => ({
              ...task,
              color: task.priority === 'high' ? '#E74C3C' : task.priority === 'medium' ? '#F39C12' : '#8FBC8F'
            }));
            setTasks(displayTasks);
          }

          if (savedHives.length === 0) {
            // Default hive data for calculations
            const defaultHiveData: Hive[] = [
              { 
                id: '1', 
                name: 'Kupa Alpha', 
                location: 'Trädgård A',
                type: 'Langstroth',
                isNucleus: false,
                createdAt: new Date().toISOString(),
                status: 'good'
              },
              { 
                id: '2', 
                name: 'Kupa Beta', 
                location: 'Trädgård B',
                type: 'Langstroth',
                isNucleus: false,
                createdAt: new Date().toISOString(),
                status: 'good'
              },
              { 
                id: '3', 
                name: 'Kupa Gamma', 
                location: 'Trädgård C',
                type: 'Langstroth',
                isNucleus: false,
                createdAt: new Date().toISOString(),
                status: 'warning'
              },
            ];
            setHives(defaultHiveData);
          } else {
            setHives(savedHives);
          }
        } catch (error) {
          console.log('Could not load data from AsyncStorage:', error);
        }
      };

      loadData();
    }, [])
  );

  // Beräkna genomsnittlig population baserat på status
  const calculateAveragePopulation = () => {
    if (hives.length === 0) return 'Ingen data';
    
    // Simulera baserat på status
    const statusValues = hives.map(hive => {
      switch (hive.status) {
        case 'excellent': return 8;
        case 'good': return 6;
        case 'warning': return 4;
        case 'critical': return 2;
        default: return 5;
      }
    });
    
    const avgValue = statusValues.reduce((sum, val) => sum + val, 0) / statusValues.length;
    
    if (avgValue >= 7) return 'Stark';
    if (avgValue >= 5) return 'Medel';
    return 'Svag';
  };

  // Beräkna genomsnittlig varroa baserat på status
  const calculateAverageVarroa = () => {
    if (hives.length === 0) return '0.0';
    
    // Simulera baserat på status
    const varroaValues = hives.map(hive => {
      switch (hive.status) {
        case 'excellent': return 1.0;
        case 'good': return 2.0;
        case 'warning': return 4.0;
        case 'critical': return 8.0;
        default: return 3.0;
      }
    });
    
    const avgVarroa = varroaValues.reduce((sum, val) => sum + val, 0) / varroaValues.length;
    return avgVarroa.toFixed(1);
  };

  // Beräkna antal avläggare senaste året
  const calculateNucleusThisYear = () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    return hives.filter(hive => {
      if (!('isNucleus' in hive) || !('createdAt' in hive)) return false;
      const createdDate = new Date(hive.createdAt);
      return createdDate >= oneYearAgo;
    }).length;
  };

  const allStats = [
    { 
      id: 'hives',
      title: 'Aktiva kupor', 
      value: hives.length.toString(), 
      icon: BeehiveIcon, 
      color: '#FF8C42' 
    },
    { 
      id: 'inspections',
      title: 'Inspektioner denna månad', 
      value: '8', 
      icon: FileText, 
      color: '#8FBC8F' 
    },
    { 
      id: 'honey',
      title: 'Honungsskörd i år', 
      value: '145 kg', 
      icon: Droplets, 
      color: '#F7B801' 
    },
    { 
      id: 'varroa',
      title: 'Snitt varroa/dag', 
      value: `${calculateAverageVarroa()}`, 
      icon: TrendingUp, 
      color: '#E74C3C' 
    },
    { 
      id: 'population',
      title: 'Genomsnittlig population', 
      value: calculateAveragePopulation(), 
      icon: Activity, 
      color: '#8FBC8F' 
    },
    { 
      id: 'nucleus',
      title: 'Avläggare senaste året', 
      value: calculateNucleusThisYear().toString(), 
      icon: Plus, 
      color: '#8FBC8F' 
    },
  ];

  const quickActions = [
    { 
      id: 'harvest',
      title: 'Skattning',
      icon: Droplets,
      color: '#F7B801',
      route: '/add-harvest'
    },
    {
      id: 'hive',
      title: 'Ny kupa',
      icon: BeehiveIcon,
      color: '#FF8C42',
      route: '/add-hive'
    },
    {
      id: 'inspection',
      title: 'Inspektion',
      icon: FileText,
      color: '#8FBC8F',
      route: '/add-inspection'
    },
    {
      id: 'task',
      title: 'Ny uppgift',
      icon: Plus,
      color: '#E74C3C',
      route: '/add-task'
    },
  ];

  const availableStats = allStats.filter(stat => selectedStats.includes(stat.id));

  const handleActionPress = (route: string) => {
    setShowActionMenu(false);
    router.push(route as any);
  };

  const deleteTask = async (taskIndex: number) => {
    console.log('deleteTask function called with taskIndex:', taskIndex);
    try {
      console.log('Current tasks before delete:', tasks);
      const updatedTasks = tasks.filter((_, index) => index !== taskIndex);
      console.log('Updated tasks after filter:', updatedTasks);
      setTasks(updatedTasks);
      console.log('setTasks called with:', updatedTasks);
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      console.log('AsyncStorage updated');
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const renderRightAction = (taskIndex: number) => {
    console.log('renderRightAction called with taskIndex:', taskIndex);
    return (
      <Animated.View style={styles.deleteAction}>
        <Pressable
          style={styles.deleteButton}
          onPress={() => {
            console.log('Delete button pressed for taskIndex:', taskIndex);
            deleteTask(taskIndex);
          }}
        >
          <Trash2 size={24} color="white" />
          <Text style={styles.deleteText}>Radera</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFF8E1', '#F5F5DC']}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('@/assets/images/icon.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Snabbstatistik</Text>

            <View style={styles.statsGrid}>
              {availableStats.map((stat, index) => (
                <Pressable key={index} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                    <stat.icon size={24} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kommande uppgifter</Text>
            {tasks && tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Swipeable
                  key={index}
                  renderRightActions={() => renderRightAction(index)}
                  rightThreshold={40}
                >
                  <Pressable style={styles.taskCard}>
                    <View style={[styles.taskPriority, { backgroundColor: task.color || '#8FBC8F' }]} />
                    <View style={styles.taskContent}>
                      <Text style={styles.taskTitle}>{task.task || task.title}</Text>
                      <View style={styles.taskMeta}>
                        <Calendar size={14} color="#8B7355" />
                        <Text style={styles.taskDate}>{task.date || task.dueDate}</Text>
                        <Text style={[styles.taskPriorityText, { color: task.color || '#8FBC8F' }]}>
                          <Text>• {(task.priority || task.priority)?.toUpperCase()} PRIORITET</Text>
                        </Text>
                      </View>
                    </View>
                    <AlertCircle size={20} color={task.color || '#8FBC8F'} />
                  </Pressable>
                </Swipeable>
              ))
            ) : (
              <View style={styles.emptyTasksContainer}>
                <Text style={styles.emptyTasksText}>Tryck på + för att lägga till uppgift!</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.actionMenuContainer}>
              <Pressable 
                style={styles.plusButton}
                onPress={() => setShowActionMenu(!showActionMenu)}
              >
                {showActionMenu ? (
                  <X size={32} color="white" />
                ) : (
                  <Plus size={32} color="white" />
                )}
              </Pressable>
              
              {showActionMenu && (
                <View style={styles.actionMenu}>
                  {quickActions.map((action) => (
                    <Pressable
                      key={action.id}
                      style={[styles.actionMenuItem, { backgroundColor: action.color }]}
                      onPress={() => handleActionPress(action.route)}
                    >
                      <action.icon size={24} color="white" />
                      <Text style={styles.actionMenuText}>{action.title}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 0,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  logo: {
    height: 100,
    width: 160,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    width: '48%',
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 11,
    color: '#8B7355',
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskPriority: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: 12,
    color: '#8B7355',
    marginLeft: 4,
    marginRight: 8,
  },
  taskPriorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionMenuContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 120, // Mer marginal så plus-knappen inte täcks av docken
  },
  plusButton: {
    backgroundColor: '#F7B801',
    borderRadius: 35,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionMenu: {
    position: 'absolute',
    bottom: 90, // Flytta menyn lite högre upp
    alignItems: 'center',
    gap: 12,
    maxWidth: '100%', // Förhindra att menyn går utanför skärmen
  },
  actionMenuItem: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minWidth: 180, // Mindre bredd så den inte går utanför skärmen
    maxWidth: 250, // Max bredd för att förhindra overflow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  actionMenuText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  deleteAction: {
    flex: 1,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 80,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  emptyTasksContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyTasksText: {
    fontSize: 16,
    color: '#8B7355',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});