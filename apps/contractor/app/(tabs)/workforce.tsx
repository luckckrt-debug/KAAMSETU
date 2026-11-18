import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useContractorState } from '../../src/state';
import { apiClient } from '@kaamsetu/api-client';
import { WorkerProfileData } from '@kaamsetu/shared';

export default function ContractorWorkforceScreen() {
  const router = useRouter();
  const { contractor } = useContractorState();
  const [workers, setWorkers] = useState<WorkerProfileData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWorkforce = async () => {
    try {
      const res = await apiClient.getWorkers();
      if (res.success && res.workers) {
        setWorkers(res.workers);
      }
    } catch (e) {
      console.warn('Error fetching workforce:', e);
    }
  };

  useEffect(() => {
    fetchWorkforce();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWorkforce();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Workforce Roster (कार्यबल)</Text>
          <Text style={styles.headerSub}>Manage skilled crew members and site deployments</Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/project/create')}
        >
          <Text style={styles.addBtnText}>+ Assign Site</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.countText}>{workers.length} Workers in Central Pool</Text>

        {workers.map(w => (
          <View key={w.id} style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.avatar}>
                <Text style={{ fontSize: 24 }}>👷‍♂️</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{w.fullName}</Text>
                  <Text style={styles.wage}>₹{w.expectedDailyWage}/day</Text>
                </View>

                <Text style={styles.trade}>{w.skills[0] || 'Skilled Labour'}</Text>
                <Text style={styles.loc}>📍 {w.preferredLocation || w.city} • {w.experienceYears} yrs exp</Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>✓ Verified Aadhaar KYC</Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${w.phoneNumber}`)}
                >
                  <Text style={styles.callBtnText}>📞 Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.msgBtn}
                  onPress={() => router.push(`/chat/${w.id}`)}
                >
                  <Text style={styles.msgBtnText}>💬 Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
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
  headerLeft: {
    flex: 1,
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
  addBtn: {
    backgroundColor: '#F97316',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  list: {
    padding: 16,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  wage: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
  },
  trade: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
    marginTop: 2,
  },
  loc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  statusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  callBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  msgBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  msgBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
