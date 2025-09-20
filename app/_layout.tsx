import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#FFF8E1' }}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="dark" backgroundColor="#FFF8E1" />
        </GestureHandlerRootView>
      </View>
    </SafeAreaProvider>
  );
}