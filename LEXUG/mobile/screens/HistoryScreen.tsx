import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ChatMessage, chatService } from '../services/api';
import { AppColors, radii, shadows } from '../theme';

type ChatHistoryItem = {
  id: string;
  timestamp: string;
  question: string;
  answer?: string;
  messages?: ChatMessage[];
};

function isChatMessage(value: unknown): value is ChatMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    ((value as { role?: unknown }).role === 'user' ||
      (value as { role?: unknown }).role === 'assistant') &&
    typeof (value as { content?: unknown }).content === 'string'
  );
}

function normalizeMessages(messages: unknown): ChatMessage[] | undefined {
  if (!Array.isArray(messages)) return undefined;

  const normalizedMessages = messages.filter(isChatMessage);
  return normalizedMessages.length > 0 ? normalizedMessages : undefined;
}

function isChatHistoryItem(value: unknown): value is Omit<ChatHistoryItem, 'id' | 'messages'> & {
  messages?: unknown;
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'timestamp' in value &&
    'question' in value &&
    typeof (value as { timestamp?: unknown }).timestamp === 'string' &&
    typeof (value as { question?: unknown }).question === 'string'
  );
}

function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function HistoryScreen({ navigation }: any) {
  const { state } = useContext(AuthContext);
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [chats, setChats] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    if (state.isGuest) {
      setChats([]);
      setLoading(false);
      return;
    }

    void loadHistory();
  }, [state.isGuest]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const history = await chatService.getHistory();
      const chatList = Object.entries(history)
        .filter((entry): entry is [string, Omit<ChatHistoryItem, 'id'>] =>
          isChatHistoryItem(entry[1])
        )
        .map(([id, chat]) => ({
          id,
          ...chat,
          messages: normalizeMessages(chat.messages),
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setChats(chatList);
    } catch (error) {
      console.error('Load history error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (item: ChatHistoryItem) => {
    try {
      setOpeningId(item.id);

      if (item.messages) {
        navigation.navigate('Chat', {
          conversationId: item.id,
          messages: item.messages,
          openedAt: Date.now(),
        });
        return;
      }

      const conversation = await chatService.getConversation(item.id);
      const messages = normalizeMessages(
        typeof conversation === 'object' && conversation !== null
          ? (conversation as { messages?: unknown }).messages
          : undefined
      );

      if (!messages) {
        Alert.alert('Conversation unavailable', 'This saved chat could not be opened.');
        return;
      }

      navigation.navigate('Chat', {
        conversationId: item.id,
        messages,
        openedAt: Date.now(),
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to open conversation');
    } finally {
      setOpeningId(null);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Conversation?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await chatService.deleteConversation(id);
            setChats((currentChats) => currentChats.filter((chat) => chat.id !== id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete conversation');
          }
        },
      },
    ]);
  };

  const renderChat = ({ item }: { item: ChatHistoryItem }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleOpen(item)}
      disabled={openingId === item.id}
      activeOpacity={0.84}
    >
      <View style={styles.chatIcon}>
        <Ionicons name="document-text-outline" size={20} color={colors.primary} />
      </View>
      <View style={styles.chatContent}>
        <Text style={styles.question} numberOfLines={2}>
          {item.question}
        </Text>
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
        accessibilityLabel="Delete conversation"
      >
        {openingId === item.id ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Saved chats</Text>
        <Text style={styles.subtitle}>
          {state.isGuest ? 'Sign in to keep your research.' : `${chats.length} conversations`}
        </Text>
      </View>

      {state.isGuest ? (
        <EmptyState
          colors={colors}
          icon="lock-closed-outline"
          styles={styles}
          title="Guest history is off"
          text="Sign in to save and reopen conversations."
        />
      ) : chats.length === 0 ? (
        <EmptyState
          colors={colors}
          icon="chatbubble-ellipses-outline"
          styles={styles}
          title="No conversations yet"
          text="Your saved chats will appear here after you ask a question."
        />
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function EmptyState({
  colors,
  icon,
  styles,
  title,
  text,
}: {
  colors: AppColors;
  icon: keyof typeof Ionicons.glyphMap;
  styles: HistoryStyles;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={26} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

type HistoryStyles = ReturnType<typeof createStyles>;

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  centerContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  headerBlock: {
    paddingBottom: 14,
    paddingTop: 18,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 22,
  },
  chatItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 12,
    ...shadows.sm,
  },
  chatIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySurface,
    borderRadius: radii.sm,
    height: 42,
    justifyContent: 'center',
    marginRight: 12,
    width: 42,
  },
  chatContent: {
    flex: 1,
    marginRight: 10,
  },
  question: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 5,
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: colors.dangerSurface,
    borderRadius: radii.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
    borderRadius: radii.lg,
    borderWidth: 1,
    height: 62,
    justifyContent: 'center',
    marginBottom: 16,
    width: 62,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
