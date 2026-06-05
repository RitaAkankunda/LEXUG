import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { chatService } from '../services/api';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const SYSTEM_PROMPT = `You are LexUg, a helpful AI assistant specializing in Ugandan law and civic rights.
You provide clear, accurate information about Ugandan laws, constitutional rights, and civic processes.
Keep responses concise and practical, especially focused on rights awareness for Ugandan citizens.
Always remind users that this is civic education only and not legal advice.`;

const QUICK_CARDS = [
  { label: 'Police', text: 'What are my rights if I am arrested by police?' },
  { label: 'Land', text: 'Can my landlord evict me without notice?' },
  { label: 'Vote', text: "How do Uganda's elections work?" },
  { label: 'Work', text: 'What are my rights as a worker in Uganda?' },
];

function createConversationId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId] = useState(createConversationId);

  const handleSendMessage = async (text: string = input) => {
    const question = text.trim();
    if (!question || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: question };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await chatService.chat(newMessages, SYSTEM_PROMPT);
      const answer = response.content?.[0]?.text;

      if (!answer) {
        throw new Error('Empty AI response');
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: answer,
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      try {
        await chatService.saveChat(conversationId, updatedMessages, question, answer);
      } catch (saveError) {
        console.warn('Chat answer was not saved:', saveError);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, I could not get an answer right now. Please check your connection and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.title}>LexUg</Text>
            <Text style={styles.subtitle}>Ask about your legal rights in Uganda</Text>

            <Text style={styles.quickCardsTitle}>Quick Questions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {QUICK_CARDS.map((card) => (
                <TouchableOpacity
                  key={card.label}
                  style={styles.quickCard}
                  onPress={() => handleSendMessage(card.text)}
                >
                  <Text style={styles.cardIcon}>{card.label}</Text>
                  <Text style={styles.cardText}>{card.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          messages.map((msg, index) => (
            <View
              key={`${msg.role}-${index}`}
              style={[
                styles.message,
                msg.role === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <Text style={msg.role === 'user' ? styles.userText : styles.assistantText}>
                {msg.content}
              </Text>
            </View>
          ))
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D21034" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about your rights..."
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={1000}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (loading || !input.trim()) && styles.buttonDisabled]}
          onPress={() => handleSendMessage()}
          disabled={loading || !input.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  quickCardsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  quickCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 150,
    minHeight: 118,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardIcon: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D21034',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  message: {
    marginBottom: 12,
    borderRadius: 8,
    padding: 12,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#D21034',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  userText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  assistantText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#D21034',
    borderRadius: 20,
    minWidth: 56,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
