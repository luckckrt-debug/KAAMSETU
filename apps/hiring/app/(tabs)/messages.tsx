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
import { useHiringState } from '../../src/state';
import { apiClient } from '@kaamsetu/api-client';
import { ChatMessageData } from '@kaamsetu/shared';

export default function EmployerMessagesScreen() {
  const router = useRouter();
  const { t } = useHiringState();
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
        <Text style={styles.headerTitle}>{t.navMessages} (मजदूरों से बातचीत)</Text>
        <Text style={styles.headerSub}>Coordinate directly with hired professionals</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push('/chat/wrk-1')}
        >
          <View style={styles.avatar}>
            <Text style={{ fontSize: 24 }}>👷‍♂️</Text>
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.topRow}>
              <Text style={styles.name}>Rajesh Sharma (Electrician)</Text>
              <Text style={styles.time}>9:32 AM</Text>
            </View>

            <Text style={styles.preview} numberOfLines={1}>
              {messages.length > 0
                ? messages[messages.length - 1].text
                : 'Haan ma\'am, bilkul. Main samay par tools lekar pahunch jaunga.'}
            </Text>

            <View style={styles.jobTag}>
              <Text style={styles.jobTagText}>Job: Full Apartment Rewiring</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push('/chat/wrk-2')}
        >
          <View style={[styles.avatar, { backgroundColor: '#ECFDF5' }]}>
            <Text style={{ fontSize: 24 }}>🔧</Text>
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.topRow}>
              <Text style={styles.name}>Manoj Kumar Bind (Plumber)</Text>
              <Text style={styles.time}>Yesterday</Text>
            </View>

            <Text style={styles.preview} numberOfLines={1}>
              I stay nearby in Okhla, can reach site in 20 minutes.
            </Text>

            <View style={[styles.jobTag, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.jobTagText, { color: '#1E3A8A' }]}>Job: Bathroom Concealed Piping</Text>
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
    backgroundColor: '#1E3A8A',
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
    color: '#93C5FD',
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
  card: {
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  time: {
    fontSize: 11,
    color: '#94A3B8',
  },
  preview: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  jobTag: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  jobTagText: {
    color: '#EA580C',
    fontSize: 11,
    fontWeight: '700',
  },
});
