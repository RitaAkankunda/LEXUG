import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, type } from "@/constants/theme";

export type ToastType = "success" | "error";

export type ToastMessage = {
  id: number;
  message: string;
  type: ToastType;
};

export function ToastOverlay({
  toast,
  onDismiss,
}: {
  toast: ToastMessage | null;
  onDismiss: () => void;
}) {
  const insets = useSafeAreaInsets();

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <Animated.View
      key={toast.id}
      entering={FadeInDown.duration(220)}
      exiting={FadeOutUp.duration(180)}
      style={[styles.container, { top: insets.top + spacing.sm }]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onDismiss}
        style={[styles.toast, isSuccess ? styles.success : styles.error]}
        accessibilityRole="alert"
      >
        <Ionicons
          name={isSuccess ? "checkmark-circle" : "alert-circle"}
          size={18}
          color={isSuccess ? colors.success : colors.error}
        />
        <Text style={[styles.text, { color: isSuccess ? colors.success : colors.error }]}>
          {toast.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 480,
    width: "90%",
    borderRadius: radius.input,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  success: {
    backgroundColor: colors.successSoft,
  },
  error: {
    backgroundColor: colors.errorSoft,
  },
  text: {
    ...type.body,
    flex: 1,
  },
});
