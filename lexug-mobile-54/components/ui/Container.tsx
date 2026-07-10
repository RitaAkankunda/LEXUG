import { StyleSheet, View, ViewProps } from "react-native";
import { layout } from "@/constants/theme";

// Caps content width on tablet / web so text and forms don't stretch
// edge-to-edge; full width on phone-sized viewports.
export function Container({ style, ...props }: ViewProps) {
  return <View style={[styles.container, style]} {...props} />;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
  },
});
