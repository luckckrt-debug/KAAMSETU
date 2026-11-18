import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useWorkerState } from '../../src/state';
import { apiClient } from '@kaamsetu/api-client';
import { ChatMessageData } from '@kaamsetu/shared';

export default function WorkerMessagesScreen() {
  const router = useRouter();
  const { t } = useWorkerState();
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMessages = async () => {
    try {
      const res = await apiClient.getChatMessages('th-wrk-1-emp-1');
      if (res.success && res.messages) {
        setMessages(res.messages);
      }
    } catch (e) {
      console.warn('Error loading messages:', e);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.navMessages} (बातचीत / संदेश)</Text>
        <Text style={styles.headerSub}>Direct conversation with employers and site contractors</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <TouchableOpacity
          style={styles.chatCard}
          activeOpacity={0.8}
          onPress={() => router.push('/chat/emp-1')}
        >
          <View style={styles.avatar}>
            <Text style={{ fontSize: 20 }}>👩‍💼</Text>
          </View>

          <View style={styles.chatInfo}>
            <View style={styles.chatTopRow}>
              <Text style={styles.chatName}>Ananya Deshmukh (Employer)</Text>
              <Text style={styles.chatTime}>Today, 9:32 AM</Text>
            </View>

            <Text style={styles.chatSub} numberOfLines={1}>
              {messages.length > 0
                ? messages[messages.length - 1].text
                : 'Namaste Rajesh ji, can you reach Sector 78 at 9 AM tomorrow?'}
            </Text>

            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>Electrical Rewiring Job</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatCard}
          activeOpacity={0.8}
          onPress={() => router.push('/chat/cnt-1')}
        >
          <View style={[styles.avatar, { backgroundColor: '#FFEDD5' }]}>
            <Text style={{ fontSize: 20 }}>🏗️</Text>
          </View>

          <View style={styles.chatInfo}>
            <View style={styles.chatTopRow}>
              <Text style={styles.chatName}>Vikram Singh (Contractor)</Text>
              <Text style={styles.chatTime}>Yesterday</Text>
            </View>

            <Text style={styles.chatSub} numberOfLines={1}>
              Muster roll attendance verified for Green Valley Project.
            </Text>

            <View style={[styles.unreadBadge, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.unreadText, { color: '#1D4ED8' }]}>Green Valley Site</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  chatName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  chatTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  chatSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  unreadBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  unreadText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
});
