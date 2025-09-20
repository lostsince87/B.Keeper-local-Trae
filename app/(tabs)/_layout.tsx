import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Home, FileText, BarChart2, Settings } from 'lucide-react-native';
import { BeehiveIcon } from '@/components/BeehiveIcon';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8FBC8F',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FFF8E1',
          borderTopColor: colorScheme === 'dark' ? '#333' : '#E5E5E5',
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hem',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="hives"
        options={{
          title: 'Kupor',
          tabBarIcon: ({ color, size }) => (
            <BeehiveIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inspections"
        options={{
          title: 'Inspektioner',
          tabBarIcon: ({ color, size }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Statistik',
          tabBarIcon: ({ color, size }) => (
            <BarChart2 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Inställningar',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-hive"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="add-inspection"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="add-harvest"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="add-task"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="hive-details"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="inspection-details"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}