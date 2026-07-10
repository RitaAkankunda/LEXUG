import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, type } from "@/constants/theme";

type Variant = "primary" | "accent" | "outline" | "ghost";

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ label, onPress, variant = "primary", loading, disabled, icon }: Props) {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => (scale.value = withTiming(0.97, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 100 }))}
      style={[
        styles.base,
        variant === "primary" && styles.primary,
        variant === "accent" && styles.accent,
        variant === "outline" && styles.outline,
        variant === "ghost" && styles.ghost,
        isDisabled && styles.disabled,
        animatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.white : colors.navy} />
      ) : (
        <View style={styles.content}>
          <Text
            style={[
              type.button,
              variant === "primary" && { color: colors.white },
              variant === "accent" && { color: colors.navy },
              variant === "outline" && { color: colors.navy },
              variant === "ghost" && { color: colors.navy },
            ]}
          >
            {label}
          </Text>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={variant === "primary" ? colors.white : colors.navy}
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.navy,
  },
  accent: {
    backgroundColor: colors.accent,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.navy,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
});
