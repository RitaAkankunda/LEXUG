import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AppColors, radii, shadows } from '../theme';

export default function ProfileScreen() {
  const { signOut, state } = useContext(AuthContext);
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadProfile();
  }, [state.isGuest]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userEmail = await AsyncStorage.getItem('userEmail');
      const storedDisplayName = await AsyncStorage.getItem('userDisplayName');
      setEmail(state.isGuest ? 'Guest mode' : userEmail || 'Not set');
      setDisplayName(state.isGuest ? 'Guest' : storedDisplayName || 'LexUg user');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>

        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.statusRow}>
          <InfoTile
            colors={colors}
            icon={state.isGuest ? 'person-outline' : 'checkmark-circle-outline'}
            label="Account"
            styles={styles}
            value={state.isGuest ? 'Guest' : 'Active'}
          />
          <InfoTile
            colors={colors}
            icon={state.isGuest ? 'lock-closed-outline' : 'time-outline'}
            label="History"
            styles={styles}
            value={state.isGuest ? 'Off' : 'Saved'}
          />
        </View>
      </View>

      <View style={styles.notice}>
        <Ionicons name="alert-circle-outline" size={18} color={colors.primaryDark} />
        <Text style={styles.noticeText}>
          LexUg is for civic education. Confirm legal decisions with a qualified lawyer.
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={20} color={colors.primary} />
        <Text style={styles.logoutButtonText}>
          {state.isGuest ? 'Leave Guest Mode' : 'Logout'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>LexUg v1.0.0</Text>
        <Text style={styles.footerText}>Ugandan Civic AI Companion</Text>
      </View>
    </View>
  );
}

function InfoTile({
  colors,
  icon,
  label,
  styles,
  value,
}: {
  colors: AppColors;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  styles: ProfileStyles;
  value: string;
}) {
  return (
    <View style={styles.infoTile}>
      <Ionicons name={icon} size={20} color={colors.green} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

type ProfileStyles = ReturnType<typeof createStyles>;

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  centerContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: 18,
    padding: 22,
    ...shadows.sm,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderColor: colors.gold,
    borderRadius: 38,
    borderWidth: 3,
    height: 76,
    justifyContent: 'center',
    marginBottom: 14,
    width: 76,
  },
  avatarText: {
    color: colors.gold,
    fontSize: 32,
    fontWeight: '900',
  },
  name: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 5,
    textAlign: 'center',
  },
  email: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    width: '100%',
  },
  infoTile: {
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  infoValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 3,
  },
  notice: {
    alignItems: 'flex-start',
    backgroundColor: colors.warningSurface,
    borderColor: colors.warningBorder,
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  noticeText: {
    color: colors.primaryDark,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginLeft: 8,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 50,
  },
  logoutButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  footerBrand: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
});
