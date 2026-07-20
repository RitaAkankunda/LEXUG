import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AppColors, radii, shadows } from '../theme';

export default function SignupScreen({ navigation }: any) {
  const { signUp } = useContext(AuthContext);
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedDisplayName = displayName.trim();

    if (!trimmedDisplayName || !trimmedEmail || !password || !confirmPassword) {
      Alert.alert('Missing details', 'Please fill in your name, email, password, and confirmation.');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please confirm the same password before creating your account.');
      return;
    }

    setLoading(true);
    try {
      await signUp(trimmedEmail, password, trimmedDisplayName);
      Alert.alert('Account created', 'Please log in to continue.', [
        {
          text: 'Log in',
          onPress: () =>
            navigation.replace('Login', {
              email: trimmedEmail,
              accountCreated: true,
            }),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Signup failed', error.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
            accessibilityLabel="Back to login"
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => {
              void toggleTheme();
            }}
            accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={21}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.brandMark}>
          <Ionicons name="shield-checkmark-outline" size={27} color={colors.gold} />
        </View>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Save chats, reopen history, and keep your civic rights questions together.
        </Text>

        <View style={styles.form}>
          <Field
            colors={colors}
            styles={styles}
            icon="person-outline"
            label="Full name"
            placeholder="Akankunda Rita"
            value={displayName}
            onChangeText={setDisplayName}
            editable={!loading}
            textContentType="name"
          />

          <Field
            colors={colors}
            styles={styles}
            icon="mail-outline"
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
          />

          <PasswordField
            colors={colors}
            styles={styles}
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            visible={showPassword}
            onToggle={() => setShowPassword((current) => !current)}
            editable={!loading}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          />

          <PasswordField
            colors={colors}
            styles={styles}
            label="Confirm password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((current) => !current)}
            editable={!loading}
            accessibilityLabel={
              showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
            }
          />

          <View style={styles.helperBox}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.green} />
            <Text style={styles.helperText}>
              After signup, you will log in once to start your secure session.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <>
                <Text style={styles.buttonText}>Create Account</Text>
                <Ionicons name="checkmark" size={19} color={colors.surface} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FieldProps = React.ComponentProps<typeof TextInput> & {
  colors: AppColors;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  styles: SignupStyles;
};

function Field({ colors, icon, label, style, styles, ...inputProps }: FieldProps) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={19} color={colors.textMuted} />
        <TextInput
          {...inputProps}
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
        />
      </View>
    </>
  );
}

type PasswordFieldProps = {
  colors: AppColors;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  visible: boolean;
  onToggle: () => void;
  editable: boolean;
  accessibilityLabel: string;
  styles: SignupStyles;
};

function PasswordField({
  colors,
  label,
  placeholder,
  value,
  onChangeText,
  visible,
  onToggle,
  editable,
  accessibilityLabel,
  styles,
}: PasswordFieldProps) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="lock-closed-outline" size={19} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          editable={editable}
          textContentType="newPassword"
        />
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onToggle}
          disabled={!editable}
          accessibilityLabel={accessibilityLabel}
        >
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
    </>
  );
}

type SignupStyles = ReturnType<typeof createStyles>;

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  topActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  circleButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
    ...shadows.sm,
  },
  brandMark: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.ink,
    borderRadius: radii.lg,
    height: 56,
    justifyContent: 'center',
    marginBottom: 18,
    width: 56,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 16,
    ...shadows.sm,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  iconButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 36,
  },
  helperBox: {
    alignItems: 'flex-start',
    backgroundColor: colors.successSurface,
    borderColor: colors.successBorder,
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 4,
    padding: 11,
  },
  helperText: {
    color: colors.green,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginLeft: 8,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flexDirection: 'row',
    height: 50,
    justifyContent: 'center',
    marginTop: 14,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '900',
    marginRight: 8,
  },
  link: {
    color: colors.text,
    fontWeight: '800',
    marginTop: 18,
    textAlign: 'center',
  },
});
