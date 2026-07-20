import React, { useContext, useEffect, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ChatMessage, chatService } from '../services/api';
import { AppColors, radii, shadows } from '../theme';

const SYSTEM_PROMPT = `You are LexUg, a helpful AI assistant specializing in Ugandan law and civic rights.
You provide clear, accurate information about Ugandan laws, constitutional rights, and civic processes.
Keep responses concise and practical, especially focused on rights awareness for Ugandan citizens.
Always remind users that this is civic education only and not legal advice.`;

const QUICK_CARDS: Array<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  accent: keyof AppColors;
}> = [
  {
    label: 'Police rights',
    icon: 'shield-checkmark-outline',
    text: 'What are my rights if I am arrested by police?',
    accent: 'primary',
  },
  {
    label: 'Landlord notice',
    icon: 'home-outline',
    text: 'Can my landlord evict me without notice?',
    accent: 'green',
  },
  {
    label: 'Voting',
    icon: 'checkbox-outline',
    text: "How do Uganda's elections work?",
    accent: 'gold',
  },
  {
    label: 'Work rights',
    icon: 'briefcase-outline',
    text: 'What are my rights as a worker in Uganda?',
    accent: 'ink',
  },
];

function createConversationId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type ChatScreenParams = {
  conversationId?: string;
  messages?: ChatMessage[];
  openedAt?: number;
};

export default function ChatScreen({ route }: { route?: { params?: ChatScreenParams } }) {
  const { state } = useContext(AuthContext);
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(createConversationId);

  useEffect(() => {
    if (!route?.params?.conversationId || !route.params.messages) return;

    setConversationId(route.params.conversationId);
    setMessages(route.params.messages);
    setInput('');
  }, [route?.params?.conversationId, route?.params?.messages, route?.params?.openedAt]);

  const handleNewChat = () => {
    setConversationId(createConversationId());
    setMessages([]);
    setInput('');
  };

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

      if (!state.isGuest) {
        try {
          await chatService.saveChat(conversationId, updatedMessages, question, answer);
        } catch (saveError) {
          console.warn('Chat answer was not saved:', saveError);
        }
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

  const canSend = input.trim().length > 0 && !loading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={88}
    >
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.brandMark}>
              <Ionicons name="shield-checkmark-outline" size={28} color={colors.gold} />
            </View>
            <Text style={styles.title}>Know your rights, fast</Text>
            <Text style={styles.subtitle}>
              Ask practical questions about Ugandan law, civic duties, and everyday legal processes.
            </Text>

            <View style={styles.notice}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.primaryDark} />
              <Text style={styles.noticeText}>
                Civic education only. For legal advice, speak with a qualified lawyer.
              </Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Start with a common question</Text>
              <Text style={styles.sectionHint}>Tap to ask</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {QUICK_CARDS.map((card) => (
                <TouchableOpacity
                  key={card.label}
                  style={styles.quickCard}
                  onPress={() => handleSendMessage(card.text)}
                  activeOpacity={0.82}
                >
                  <View style={[styles.quickIconWrap, { backgroundColor: colors[card.accent] }]}>
                    <Ionicons name={card.icon} size={20} color={colors.surface} />
                  </View>
                  <Text style={styles.cardLabel}>{card.label}</Text>
                  <Text style={styles.cardText}>{card.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View>
            <View style={styles.chatHeader}>
              <View>
                <Text style={styles.chatHeaderTitle}>
                  {state.isGuest ? 'Guest conversation' : 'Saved conversation'}
                </Text>
                <Text style={styles.chatHeaderMeta}>{messages.length} messages</Text>
              </View>
              <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
                <Ionicons name="add" size={18} color={colors.primary} />
                <Text style={styles.newChatButtonText}>New</Text>
              </TouchableOpacity>
            </View>

            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';

              return (
                <View
                  key={`${msg.role}-${index}`}
                  style={[
                    styles.message,
                    isUser ? styles.userMessage : styles.assistantMessage,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.messageLabelRow}>
                      <Ionicons name="book-outline" size={14} color={colors.green} />
                      <Text style={styles.messageLabel}>LexUg</Text>
                    </View>
                  )}
                  <Text style={isUser ? styles.userText : styles.assistantText}>{msg.content}</Text>
                </View>
              );
            })}
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Checking the law corpus...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about your rights..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={1000}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.buttonDisabled]}
          onPress={() => handleSendMessage()}
          disabled={!canSend}
          accessibilityLabel="Send message"
        >
          <Ionicons name="send" size={19} color={colors.surface} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: radii.lg,
    height: 58,
    justifyContent: 'center',
    marginBottom: 18,
    width: 58,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
    marginBottom: 10,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 18,
    maxWidth: 350,
  },
  notice: {
    alignItems: 'flex-start',
    backgroundColor: colors.warningSurface,
    borderColor: colors.warningBorder,
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 24,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  noticeText: {
    color: colors.primaryDark,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginLeft: 8,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  sectionHint: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  quickCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    marginRight: 12,
    minHeight: 150,
    padding: 14,
    width: 174,
    ...shadows.sm,
  },
  quickIconWrap: {
    alignItems: 'center',
    borderRadius: radii.sm,
    height: 38,
    justifyContent: 'center',
    marginBottom: 12,
    width: 38,
  },
  cardLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  chatHeader: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    padding: 12,
  },
  chatHeaderTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  chatHeaderMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  newChatButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  newChatButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
  },
  message: {
    borderRadius: radii.md,
    marginBottom: 12,
    maxWidth: '88%',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  messageLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 7,
  },
  messageLabel: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 5,
    textTransform: 'uppercase',
  },
  userText: {
    color: colors.surface,
    fontSize: 14,
    lineHeight: 21,
  },
  assistantText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  loadingContainer: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  inputContainer: {
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: 12,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    marginRight: 10,
    maxHeight: 112,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  buttonDisabled: {
    backgroundColor: colors.primarySurface,
  },
});
