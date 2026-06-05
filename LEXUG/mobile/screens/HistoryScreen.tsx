import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { chatService } from '../services/api';

type ChatHistoryItem = {
  id: string;
  timestamp: string;
  question: string;
  answer?: string;
  messages?: unknown[];
};

function isChatHistoryItem(value: unknown): value is Omit<ChatHistoryItem, 'id'> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'timestamp' in value &&
    'question' in value &&
    typeof (value as { timestamp?: unknown }).timestamp === 'string' &&
    typeof (value as { question?: unknown }).question === 'string'
  );
}

export default function HistoryScreen() {
  const [chats, setChats] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

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
    <View style={styles.chatItem}>
      <View style={styles.chatContent}>
        <Text style={styles.question} numberOfLines={2}>
          Q: {item.question}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
        <Text style={styles.deleteText}>X</Text>
      </TouchableOpacity>
    </View>
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

      {chats.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No conversations yet</Text>
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
  emptyText: {
    fontSize: 16,
    color: '#777',
  },
});
