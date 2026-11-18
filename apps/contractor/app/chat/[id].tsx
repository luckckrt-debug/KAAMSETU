import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useContractorState } from '../../src/state';
import { apiClient } from '@kaamsetu/api-client';
import { ChatMessageData } from '@kaamsetu/shared';

export default function ContractorChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contractor } = useContractorState();
  const threadId = `th-contractor-${id || 'prj-1'}`;

  const [messages, setMessages] = useState<ChatMessageData[]>([
    {
      id: 'm-c1',
      threadId,
      senderId: 'wrk-3',
      senderRole: 'WORKER',
      senderName: 'Ramswaroop Yadav (Head Mason)',
      text: 'Thekedar sahab, Tower B brickwork ke liye 5000 bricks aur 20 cement bags ki zaroorat hai subah.',
      timestamp: 'Today, 8:15 AM',
      isRead: true,
    },
    {
      id: 'm-c2',
      threadId,
      senderId: contractor?.id || 'cont-1',
      senderRole: 'CONTRACTOR',
      senderName: contractor?.companyName || 'Apex Infra Buildcon',
      text: 'Order place ho gaya hai Ramswaroop ji. Truck 11 baje tak site par deliver kar dega.',
      timestamp: 'Today, 8:20 AM',
      isRead: true,
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMsg: ChatMessageData = {
      id: `msg-${Date.now()}`,
      threadId,
      senderId: contractor?.id || 'cont-1',
      senderRole: 'CONTRACTOR',
      senderName: contractor?.companyName || 'Contractor Desk',
      text: inputText.trim(),
      timestamp: 'Just now',
      isRead: false,
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    try {
      await apiClient.sendChatMessage(newMsg);
    } catch (e) {
      console.log('Contractor message delivered locally');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.chatTitle}>Ramswaroop Yadav (Head Mason)</Text>
          <Text style={styles.chatSub}>DLF Tower B Site Lead • Online</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.messageList}>
        {messages.map(msg => {
          const isMe = msg.senderRole === 'CONTRACTOR';
          return (
            <View
              key={msg.id}
              style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}
            >
              {!isMe && <Text style={styles.senderLabel}>{msg.senderName}</Text>}
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
          placeholder="Type message to site lead..."
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 16,
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
    flex: 1,
  },
  chatTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  chatSub: {
    color: '#10B981',
    fontSize: 11,
    marginTop: 2,
  },
  messageList: {
    padding: 16,
    paddingBottom: 24,
  },
  bubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  myBubble: {
    backgroundColor: '#1E3A8A',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F97316',
    marginBottom: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myText: {
    color: '#FFFFFF',
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
    color: '#93C5FD',
  },
  theirTime: {
    color: '#94A3B8',
  },
  inputBar: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  sendText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
