import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, type } from "@/constants/theme";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Container } from "@/components/ui/Container";
import { useAuth } from "@/context/AuthContext";

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address";
    if (password.length < 6) next.password = "Password must be at least 6 characters";
    if (confirmPassword !== password) next.confirmPassword = "Passwords don't match";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    setServerError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(email, password, name.trim());
      router.replace({
        pathname: "/auth/login",
        params: { email, justSignedUp: "1" },
      });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Container style={styles.inner}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={colors.navy} />
          </Pressable>

          <Animated.View entering={FadeInUp.duration(350)}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Free to join. Get answers grounded in Ugandan law.
            </Text>

            {!!serverError && (
              <View style={styles.serverError}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={styles.serverErrorText}>{serverError}</Text>
              </View>
            )}

            <View style={styles.form}>
              <TextField
                label="Full name"
                icon="person-outline"
                placeholder="Nakato Aisha"
                autoComplete="name"
                value={name}
                onChangeText={setName}
                error={errors.name}
              />
              <TextField
                label="Email"
                icon="mail-outline"
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
              />
              <TextField
                label="Password"
                icon="lock-closed-outline"
                placeholder="At least 6 characters"
                isPassword
                autoComplete="new-password"
                textContentType="newPassword"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
              />
              <TextField
                label="Confirm password"
                icon="lock-closed-outline"
                placeholder="Re-enter your password"
                isPassword
                autoComplete="new-password"
                textContentType="newPassword"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={errors.confirmPassword}
              />
            </View>

            <Button label="Create account" onPress={handleSubmit} loading={loading} />

            <Text style={styles.footerRow}>
              Already have an account?{" "}
              <Text style={styles.footerLink} onPress={() => router.replace("/auth/login")}>
                Sign in
              </Text>
            </Text>
          </Animated.View>
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flexGrow: 1,
  },
  inner: {
    paddingHorizontal: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  title: {
    ...type.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...type.bodyRegular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  serverError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.errorSoft,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  serverErrorText: {
    ...type.caption,
    color: colors.error,
    flex: 1,
  },
  form: {
    marginBottom: spacing.sm,
  },
  footerRow: {
    ...type.bodyRegular,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  footerLink: {
    color: colors.accent,
    fontWeight: "700",
  },
});
