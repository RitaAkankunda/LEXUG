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
import { AuthContext } from '../context/AuthContext';
import { ChatMessage, chatService } from '../services/api';

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

export default function HistoryScreen({ navigation }: any) {
  const { state } = useContext(AuthContext);
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
        .sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

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
    >
      <View style={styles.chatContent}>
        <Text style={styles.question} numberOfLines={2}>
          Q: {item.question}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
        {openingId === item.id ? (
          <ActivityIndicator size="small" color="#D21034" />
        ) : (
          <Text style={styles.deleteText}>X</Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#D21034" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat History</Text>

      {state.isGuest ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Guest history is off</Text>
          <Text style={styles.emptyText}>Sign in to save and reopen conversations.</Text>
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptyText}>Your saved chats will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  chatItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatContent: {
    flex: 1,
    marginRight: 12,
  },
  question: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#777',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#D21034',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
});
