import 'react-native-gesture-handler';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(colors.background), [colors.background]);

  const app = (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );

  if (Platform.OS === 'web') {
    return <View style={styles.webShell}>{app}</View>;
  }

  return (
    app
  );
}

const createStyles = (backgroundColor: string) =>
  StyleSheet.create({
  webShell: {
    alignSelf: 'center',
    backgroundColor,
    flex: 1,
    maxWidth: 430,
    width: '100%',
  },
});
