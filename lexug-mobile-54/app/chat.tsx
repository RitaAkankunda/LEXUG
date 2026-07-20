import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors, radius, spacing, type } from "@/constants/theme";
import { Container } from "@/components/ui/Container";
import { useAuth } from "@/context/AuthContext";
import { chatService, ChatMessage, ChatSource } from "@/services/api";

type DisplayMessage = ChatMessage & {
  id: string;
  sources?: ChatSource[];
  isError?: boolean;
  isDemo?: boolean;
  citation?: string | null;
  note?: string | null;
};

// Matches the four Acts actually indexed in the backend corpus - each
// starter question is chosen to reliably hit a real, well-scored citation
// rather than a generic prompt.
const TOPICS: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  question: string;
}[] = [
  { icon: "briefcase-outline", label: "Employment", question: "Can I be fired without notice?" },
  {
    icon: "shield-checkmark-outline",
    label: "Arrest & Detention",
    question: "How long can police hold me before taking me to court?",
  },
  {
    icon: "home-outline",
    label: "Land & Eviction",
    question: "Can my landlord evict me without going to court?",
  },
  {
    icon: "checkbox-outline",
    label: "Elections",
    question: "Is it illegal for a candidate to offer me money for my vote?",
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function TypingDot({ delay }: { delay: number }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
      )
    );
  }, [delay, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.typingDot, animatedStyle]} />;
}

function TopicCard({
  icon,
  label,
  question,
  onPress,
  disabled,
  delay,
}: (typeof TOPICS)[number] & { onPress: () => void; disabled: boolean; delay: number }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(320)} style={styles.topicCardWrap}>
      <AnimatedPressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => (scale.value = withTiming(0.97, { duration: 100 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 100 }))}
        style={[styles.topicCard, animatedStyle]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={styles.topicIcon}>
          <Ionicons name={icon} size={20} color={colors.navy} />
        </View>
        <Text style={styles.topicLabel}>{label}</Text>
        <Text style={styles.topicQuestion} numberOfLines={2}>
          {question}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const listRef = useRef<FlatList<DisplayMessage>>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend(preset?: string) {
    const question = (preset ?? input).trim();
    if (!question || sending) return;

    const userMessage: DisplayMessage = { id: `${Date.now()}-u`, role: "user", content: question };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const answer = await chatService.ask(
        nextMessages.map(({ role, content }) => ({ role, content }))
      );
      const fallbackText = answer.content.map((block) => block.text).join("\n");
      const content = answer.isDemo && answer.body ? answer.body : fallbackText;
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-a`,
          role: "assistant",
          content,
          sources: answer.sources,
          isDemo: answer.isDemo,
          citation: answer.citation,
          note: answer.note,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-e`,
          role: "assistant",
          content: error instanceof Error ? error.message : "Something went wrong. Try again.",
          isError: true,
        },
      ]);
    } finally {
      setSending(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }

  const firstName = user?.displayName?.split(" ")[0];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <View style={styles.headerBand}>
        <Container style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
          <View style={styles.headerRow}>
            <View style={styles.mark}>
              <Ionicons name="hammer-outline" size={18} color={colors.navy} />
            </View>
            <Pressable
              onPress={async () => {
                await logout();
                router.replace("/");
              }}
              hitSlop={12}
              style={styles.signOutButton}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <Ionicons name="log-out-outline" size={18} color={colors.textOnNavy} />
            </Pressable>
          </View>
          <Text style={styles.greeting}>
            {firstName ? `Hey ${firstName},` : "Hey,"} what&apos;s going on?
          </Text>
          {!!user?.email && <Text style={styles.email}>{user.email}</Text>}
        </Container>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View>
            <Container style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Start with a topic</Text>
              <Text style={styles.emptyBody}>
                Every answer is grounded in real Ugandan law, with the exact
                section cited underneath.
              </Text>
            </Container>

            <Container style={styles.topicsGrid}>
              {TOPICS.map((topic, i) => (
                <TopicCard
                  key={topic.label}
                  {...topic}
                  disabled={sending}
                  delay={i * 60}
                  onPress={() => handleSend(topic.question)}
                />
              ))}
            </Container>
          </View>
        }
        renderItem={({ item }) => (
          <Container>
            <View
              style={[
                styles.messageRow,
                item.role === "user" && styles.messageRowUser,
              ]}
            >
              {item.role === "assistant" && (
                <View style={[styles.avatar, item.isError && styles.avatarError]}>
                  <Ionicons
                    name={item.isError ? "alert-circle-outline" : "hammer-outline"}
                    size={14}
                    color={item.isError ? colors.error : colors.navy}
                  />
                </View>
              )}
              <Animated.View
                entering={FadeInDown.duration(300)}
                style={[
                  styles.bubble,
                  item.role === "user" ? styles.bubbleUser : styles.bubbleAssistant,
                  item.role === "assistant" && styles.bubbleAssistantWide,
                  item.isError && styles.bubbleError,
                ]}
              >
                {!!item.citation && (
                  <View style={styles.citationHeader}>
                    <Ionicons name="bookmark" size={12} color={colors.accent} />
                    <Text style={styles.citationText}>{item.citation}</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.bubbleText,
                    item.role === "user" && styles.bubbleTextUser,
                    item.isError && styles.bubbleTextError,
                  ]}
                >
                  {item.content}
                </Text>
                {!!item.note && (
                  <View style={styles.noteBox}>
                    <Ionicons name="information-circle-outline" size={13} color={colors.textSecondary} />
                    <Text style={styles.noteText}>{item.note}</Text>
                  </View>
                )}
              </Animated.View>
            </View>

            {!!item.sources?.length && (
              <View style={styles.sourcesBlock}>
                <Text style={styles.sourcesLabel}>Cited from</Text>
                <View style={styles.sourcesRow}>
                  {item.sources.map((s) => (
                    <View key={`${s.act}-${s.section}`} style={styles.sourceChip}>
                      <Ionicons name="document-text-outline" size={12} color={colors.accent} />
                      <Text style={styles.sourceChipText} numberOfLines={1}>
                        {s.act.split(",")[0]}, Sec. {s.section}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Container>
        )}
      />

      {sending && (
        <Container style={styles.typingRow}>
          <View style={styles.typingDots}>
            <TypingDot delay={0} />
            <TypingDot delay={120} />
            <TypingDot delay={240} />
          </View>
          <Text style={styles.typingText}>LexUg is thinking</Text>
        </Container>
      )}

      <Container style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.inputField}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question about your rights..."
            placeholderTextColor={colors.textSecondary}
            style={styles.textInput}
            multiline
            onSubmitEditing={() => handleSend()}
            blurOnSubmit
            returnKeyType="send"
          />
          <Pressable
            onPress={() => handleSend()}
            disabled={!input.trim() || sending}
            style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Send"
          >
            <Ionicons name="arrow-up" size={18} color={colors.white} />
          </Pressable>
        </View>
      </Container>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerBand: {
    backgroundColor: colors.navy,
    borderBottomLeftRadius: radius.sheet,
    borderBottomRightRadius: radius.sheet,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  mark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  signOutButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.borderOnNavy,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    ...type.h1,
    fontSize: 22,
    color: colors.white,
  },
  email: {
    ...type.caption,
    color: colors.textOnNavyMuted,
    marginTop: spacing.xs,
  },
  list: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  emptyState: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  emptyTitle: {
    ...type.h2,
    color: colors.textPrimary,
  },
  emptyBody: {
    ...type.bodyRegular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  topicsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  topicCardWrap: {
    width: "47%",
  },
  topicCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    padding: spacing.md,
    minHeight: 132,
    shadowColor: colors.navy,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  topicIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  topicLabel: {
    ...type.label,
    color: colors.textPrimary,
  },
  topicQuestion: {
    ...type.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  avatarError: {
    backgroundColor: colors.errorSoft,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bubbleAssistantWide: {
    maxWidth: "92%",
  },
  bubbleUser: {
    backgroundColor: colors.navy,
  },
  bubbleAssistant: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.navy,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  bubbleError: {
    backgroundColor: colors.errorSoft,
    borderColor: colors.error,
  },
  bubbleText: {
    ...type.bodyRegular,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: colors.white,
  },
  bubbleTextError: {
    color: colors.error,
  },
  citationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  citationText: {
    ...type.label,
    color: colors.accent,
    flexShrink: 1,
  },
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  noteText: {
    ...type.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 17,
  },
  sourcesBlock: {
    paddingHorizontal: spacing.xl,
    paddingLeft: spacing.xl + 26 + spacing.sm,
    marginBottom: spacing.md,
  },
  sourcesLabel: {
    ...type.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  sourcesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  sourceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    maxWidth: 220,
  },
  sourceChipText: {
    ...type.caption,
    color: colors.accent,
    fontWeight: "700",
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  typingDots: {
    flexDirection: "row",
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  typingText: {
    ...type.caption,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  inputBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    backgroundColor: colors.bg,
  },
  inputField: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    shadowColor: colors.navy,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  textInput: {
    flex: 1,
    ...type.bodyRegular,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
