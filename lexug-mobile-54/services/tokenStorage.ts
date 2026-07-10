import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// expo-secure-store has no web implementation at all (it throws immediately
// in a browser), so web needs a different backing store. localStorage isn't
// as secure as the OS keychain SecureStore uses on native, but it's the
// standard web fallback and matches what this token would get anyway via a
// browser's own storage.
const isWeb = Platform.OS === "web";

export const tokenStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
