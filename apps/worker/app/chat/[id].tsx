import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useWorkerState } from '../../src/state';
import { apiClient } from '@kaamsetu/api-client';
import { ChatMessageData } from '@kaamsetu/shared';

export default function WorkerChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { worker } = useWorkerState();
  const threadId = `th-wrk-1-${id || 'emp-1'}`;

  const [messages, setMessages] = useState<ChatMessageData[]>([
    {
      id: 'm1',
      threadId,
      senderId: 'usr-e-1',
      senderRole: 'EMPLOYER',
      senderName: 'Employer',
      text: 'Namaste Rajesh ji, can you reach Sector 78 at 9 AM tomorrow?',
      timestamp: 'Today, 9:30 AM',
      isRead: true,
    },
    {
      id: 'm2',
      threadId,
      senderId: worker?.userId || 'usr-w-1',
      senderRole: 'WORKER',
      senderName: worker?.fullName || 'Rajesh Sharma',
      text: 'Haan bilkul! Main samay par tools ke saath aa jaunga.',
      timestamp: 'Today, 9:32 AM',
      isRead: true,
    },
  ]);
  const [inputText, setInputText] = useState('');

  const loadMessages = async () => {
    try {
      const res = await apiClient.getChatMessages(threadId);
      if (res.success && res.messages && res.messages.length > 0) {
        setMessages(res.messages);
      }
    } catch (e) {
      console.warn('Error loading chat:', e);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [threadId]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMsg: ChatMessageData = {
      id: `msg-${Date.now()}`,
      threadId,
      senderId: worker?.userId || 'usr-w-1',
      senderRole: 'WORKER',
      senderName: worker?.fullName || 'Rajesh Sharma',
      text: inputText.trim(),
      timestamp: 'Just now',
      isRead: false,
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    try {
      await apiClient.sendChatMessage(newMsg);
    } catch (e) {
      console.log('Message sent locally');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.chatTitle}>Ananya Deshmukh</Text>
          <Text style={styles.chatSub}>Employer • Active Job</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.messageList}>
        {messages.map(msg => {
          const isMe = msg.senderRole === 'WORKER';
          return (
            <View
              key={msg.id}
              style={[
                styles.bubble,
                isMe ? styles.myBubble : styles.theirBubble,
              ]}
            >
              <Text style={[styles.bubbleText, isMe ? styles.myText : styles.theirText]}>
                {msg.text}
              </Text>
              <Text style={[styles.bubbleTime, isMe ? styles.myTime : styles.theirTime]}>
                {msg.timestamp}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type message in Hindi or English..."
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0F172A',
    paddingTop: 45,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '700',
  },
  headerCenter: {
    alignItems: 'center',
  },
  chatTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  chatSub: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '600',
  },
  messageList: {
    padding: 16,
    paddingBottom: 20,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#F97316',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  theirText: {
    color: '#0F172A',
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTime: {
    color: '#FED7AA',
  },
  theirTime: {
    color: '#94A3B8',
  },
  inputBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 42,
    fontSize: 14,
    color: '#0F172A',
  },
  sendBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
