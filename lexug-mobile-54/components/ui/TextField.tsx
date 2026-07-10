import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, type } from "@/constants/theme";

type Props = TextInputProps & {
  label: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
};

export function TextField({ label, error, icon, isPassword, style, ...inputProps }: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!isPassword);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? colors.navy : colors.textSecondary}
            style={{ marginRight: spacing.sm }}
          />
        )}
        <TextInput
          {...inputProps}
          secureTextEntry={hidden}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, style]}
        />
        {isPassword && (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
      {!!error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    ...type.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    minHeight: 52,
  },
  fieldFocused: {
    borderColor: colors.navy,
  },
  fieldError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSoft,
  },
  input: {
    flex: 1,
    ...type.bodyRegular,
    color: colors.textPrimary,
    paddingVertical: 14,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: 4,
  },
  errorText: {
    ...type.caption,
    color: colors.error,
  },
});
