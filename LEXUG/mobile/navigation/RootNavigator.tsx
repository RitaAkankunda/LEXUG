import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import ChatScreen from '../screens/ChatScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SignupScreen from '../screens/SignupScreen';
import { useTheme } from '../context/ThemeContext';
import { AppColors, shadows } from '../theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function ChatTabs() {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          paddingBottom: 6,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 66,
          paddingTop: 7,
          ...shadows.sm,
        },
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          shadowColor: 'transparent',
        },
        headerTitleStyle: {
          color: colors.text,
          fontSize: 18,
          fontWeight: '800',
        },
        headerTintColor: colors.text,
        headerRight: () => (
          <ThemeToggleButton
            colors={colors}
            isDark={isDark}
            onPress={() => {
              void toggleTheme();
            }}
          />
        ),
        headerShown: true,
        tabBarIcon: ({ color, focused }) => {
          const iconByRoute: Record<string, keyof typeof Ionicons.glyphMap> = {
            Chat: focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline',
            History: focused ? 'time' : 'time-outline',
            Profile: focused ? 'person-circle' : 'person-circle-outline',
          };

          return <Ionicons name={iconByRoute[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'LexUg',
          tabBarLabel: 'Chat',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Chat History',
          tabBarLabel: 'History',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  const { state } = useContext(AuthContext);
  const { colors, isDark } = useTheme();

  if (state.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: 16,
            borderWidth: 1,
            padding: 24,
            ...shadows.sm,
          }}
        >
          <Text style={{ color: colors.primary, fontSize: 22, fontWeight: '900', marginBottom: 14 }}>
            LexUg
          </Text>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
      }}
    >
      {state.userToken == null && !state.isGuest ? <AuthStack /> : <ChatTabs />}
    </NavigationContainer>
  );
}

function ThemeToggleButton({
  colors,
  isDark,
  onPress,
}: {
  colors: AppColors;
  isDark: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        alignItems: 'center',
        backgroundColor: colors.primarySurface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 999,
        height: 38,
        justifyContent: 'center',
        marginRight: 12,
        width: 38,
      }}
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={22} color={colors.primary} />
    </TouchableOpacity>
  );
}
