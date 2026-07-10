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
import { AuthContext } from '../context/AuthContext';

export default function SignupScreen({ navigation }: any) {
  const { signUp } = useContext(AuthContext);
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
        <View style={styles.brandBadge}>
          <Text style={styles.brandBadgeText}>LexUg</Text>
        </View>

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Save chats, reopen history, and keep your civic rights questions together.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            placeholder="Akankunda Rita"
            value={displayName}
            onChangeText={setDisplayName}
            editable={!loading}
            returnKeyType="next"
            textContentType="name"
          />

          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordInputWrap}>
            <TextInput
              style={styles.passwordInput}
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
              textContentType="newPassword"
            />
            <TouchableOpacity
              style={styles.visibilityButton}
              onPress={() => setShowPassword((current) => !current)}
              disabled={loading}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              <Text style={styles.visibilityIcon}>{showPassword ? '◉' : '◎'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm password</Text>
          <View style={styles.passwordInputWrap}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
              textContentType="newPassword"
            />
            <TouchableOpacity
              style={styles.visibilityButton}
              onPress={() => setShowConfirmPassword((current) => !current)}
              disabled={loading}
              accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              <Text style={styles.visibilityIcon}>{showConfirmPassword ? '◉' : '◎'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.helperText}>
            After signup, you will log in once to start your secure session.
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  brandBadge: {
    alignSelf: 'center',
    backgroundColor: '#111',
    borderRadius: 8,
    marginBottom: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  brandBadgeText: {
    color: '#FCDC4D',
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    color: '#111',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 28,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  label: {
    color: '#333',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fafafa',
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  passwordInputWrap: {
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  visibilityButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 48,
  },
  visibilityIcon: {
    color: '#D21034',
    fontSize: 20,
    fontWeight: '700',
  },
  helperText: {
    color: '#777',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 4,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#D21034',
    borderRadius: 8,
    marginTop: 14,
    padding: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: '#D21034',
    fontWeight: '600',
    marginTop: 18,
    textAlign: 'center',
  },
});
