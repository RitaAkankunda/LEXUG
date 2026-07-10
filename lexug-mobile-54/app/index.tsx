import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, type } from "@/constants/theme";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.blobTopRight} pointerEvents="none" />
      <View style={styles.blobLeft} pointerEvents="none" />

      <Container style={[styles.content, { paddingTop: insets.top }]}>
        <Animated.View entering={FadeInDown.delay(60).duration(420)} style={styles.badge}>
          <Ionicons name="shield-checkmark-outline" size={13} color={colors.accent} />
          <Text style={styles.badgeText}>Civic AI for Uganda</Text>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(120).duration(420)} style={styles.wordmark}>
          Lex<Text style={{ color: colors.accent }}>Ug</Text>
        </Animated.Text>

        <Animated.Text entering={FadeInDown.delay(180).duration(420)} style={styles.tagline}>
          Know your rights, in plain language
        </Animated.Text>

        <Animated.Text entering={FadeInDown.delay(240).duration(420)} style={styles.description}>
          Ask questions about Ugandan law and get clear, cited answers in
          English or Luganda.
        </Animated.Text>
      </Container>

      <Animated.View entering={FadeInDown.delay(300).duration(420)} style={styles.panel}>
        <Container style={{ paddingBottom: insets.bottom }}>
          <View style={styles.mark}>
            <Ionicons name="hammer-outline" size={28} color={colors.navy} />
          </View>

          <View style={styles.markSpacer} />

          <Button
            label="Get started"
            icon="arrow-forward"
            variant="accent"
            onPress={() => router.push("/auth/signup")}
          />
          <Text style={styles.signInRow}>
            Already have an account?{" "}
            <Text style={styles.signInLink} onPress={() => router.push("/auth/login")}>
              Sign in
            </Text>
          </Text>
        </Container>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  blobTopRight: {
    position: "absolute",
    top: -70,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.accentSoft,
    opacity: 0.7,
  },
  blobLeft: {
    position: "absolute",
    top: 210,
    left: -70,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.navy,
    opacity: 0.05,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginBottom: spacing.lg,
    gap: 6,
  },
  badgeText: {
    ...type.caption,
    color: colors.accent,
    fontWeight: "700",
  },
  wordmark: {
    ...type.display,
    fontSize: 46,
    lineHeight: 50,
    color: colors.navy,
  },
  tagline: {
    ...type.h2,
    color: colors.navy,
    marginTop: spacing.sm,
  },
  description: {
    ...type.bodyRegular,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    maxWidth: "88%",
  },
  panel: {
    position: "relative",
    backgroundColor: colors.navy,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl + 16,
    paddingBottom: spacing.xxl + spacing.md,
  },
  markSpacer: {
    height: 48,
  },
  mark: {
    position: "absolute",
    top: -32,
    left: spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 4,
    borderColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.navy,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  signInRow: {
    ...type.bodyRegular,
    color: colors.textOnNavyMuted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  signInLink: {
    color: colors.accent,
    fontWeight: "700",
  },
});
