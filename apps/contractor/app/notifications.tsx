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
import { useContractorState } from '../src/state';
import { apiClient } from '@kaamsetu/api-client';
import { NotificationItem } from '@kaamsetu/shared';

export default function ContractorNotificationsScreen() {
  const router = useRouter();
  const { contractor } = useContractorState();
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'nt-c1',
      userId: contractor?.userId || 'usr-c-1',
      title: 'Muster Roll Locked for Today',
      body: 'Attendance for DLF Cyber City site has been verified (24 Present, 1 Half Day). Est. Wage: ₹18,450',
      type: 'ATTENDANCE',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'nt-c2',
      userId: contractor?.userId || 'usr-c-1',
      title: 'New Labour Pool Allocation',
      body: '4 Masons & 2 Welders from KaamSetu verified pool accepted deployment to Omaxe Residency.',
      type: 'SYSTEM',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'nt-c3',
      userId: contractor?.userId || 'usr-c-1',
      title: 'GST Invoice Ready',
      body: 'Client Apex Infra billed monthly labour compliance pack. TDS certificate available in portal.',
      type: 'PAYMENT',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifs = async () => {
    try {
      const res = await apiClient.getNotifications(contractor?.userId || 'usr-c-1');
      if (res.success && res.notifications && res.notifications.length > 0) {
        setNotifications(res.notifications);
      }
    } catch (e) {
      console.warn('Error fetching contractor notifications:', e);
    }
  };

  useEffect(() => {
    loadNotifs();
  }, [contractor]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifs();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Site & Compliance Alerts</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 44, marginBottom: 8 }}>🔔</Text>
            <Text style={styles.emptyTitle}>No site alerts right now</Text>
            <Text style={styles.emptySub}>Muster roll, tender, and workforce updates will appear here.</Text>
          </View>
        ) : (
          notifications.map(item => (
            <View key={item.id} style={[styles.notifCard, !item.isRead && styles.unreadCard]}>
              <View style={styles.notifHeader}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifTime}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.notifBody}>{item.body}</Text>
            </View>
          ))
        )}
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unreadCard: {
    borderColor: '#F97316',
    borderLeftWidth: 4,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  notifTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  notifBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
});
