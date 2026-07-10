import 'react-native-gesture-handler';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {
  const app = (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );

  if (Platform.OS === 'web') {
    return <View style={styles.webShell}>{app}</View>;
  }

  return (
    app
  );
}

const styles = StyleSheet.create({
  webShell: {
    alignSelf: 'center',
    backgroundColor: '#f5f5f5',
    flex: 1,
    maxWidth: 430,
    width: '100%',
  },
});
