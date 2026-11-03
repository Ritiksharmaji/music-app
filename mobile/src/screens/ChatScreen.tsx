import { Send } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useChatStore } from '../stores/useChatStore';
import { colors } from '../theme';

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

const ChatScreen = () => {
  const { selectedUser, messages, userId, onlineUsers, fetchMessages, sendMessage, setSelectedUser } = useChatStore();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser._id);
    return () => setSelectedUser(null);
  }, [selectedUser, fetchMessages, setSelectedUser]);

  if (!selectedUser) return null;

  const send = () => {
    if (!text.trim()) return;
    sendMessage(selectedUser._id, text.trim());
    setText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <Text style={styles.status}>{onlineUsers.has(selectedUser._id) ? 'Online' : 'Offline'}</Text>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={message => message._id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={<Text style={styles.empty}>Say hi to {selectedUser.fullName} 👋</Text>}
        renderItem={({ item }) => {
          const mine = item.senderId === userId;
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              <Text style={[styles.text, mine && styles.mineText]}>{item.content}</Text>
              <Text style={[styles.time, mine && styles.mineTime]}>{formatTime(item.createdAt)}</Text>
            </View>
          );
        }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder='Type a message'
          placeholderTextColor={colors.subtle}
          value={text}
          onChangeText={setText}
          onSubmitEditing={send}
          returnKeyType='send'
        />
        <Pressable style={[styles.send, !text.trim() && styles.disabled]} onPress={send} disabled={!text.trim()}>
          <Send color={colors.accentText} size={20} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};
export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  status: { color: colors.muted, fontSize: 12, textAlign: 'center', paddingVertical: 4 },
  list: { padding: 16, gap: 8, flexGrow: 1 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 32 },
  bubble: { maxWidth: '78%', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.accent },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.card },
  text: { color: colors.text, fontSize: 15 },
  mineText: { color: colors.accentText },
  time: { color: colors.muted, fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  mineTime: { color: '#14532d' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, backgroundColor: colors.card, color: colors.text, borderRadius: 20, paddingHorizontal: 16, height: 42 },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.5 },
});
