import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHiringState } from '../../src/state';
import { apiClient } from '@kaamsetu/api-client';
import { WorkerProfileData, WORKER_CATEGORIES } from '@kaamsetu/shared';

export default function EmployerWorkersFeedScreen() {
  const router = useRouter();
  const { t } = useHiringState();
  const [workers, setWorkers] = useState<WorkerProfileData[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchWorkers = async () => {
    try {
      const res = await apiClient.getWorkers({
        category: selectedTrade === 'all' ? undefined : selectedTrade,
        search: search || undefined,
      });
      if (res.success && res.workers) {
        setWorkers(res.workers);
      }
    } catch (e) {
      console.warn('Error fetching workers:', e);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [selectedTrade, search]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWorkers();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.findWorkers} (कारीगर खोजें)</Text>
        <Text style={styles.headerSub}>Search verified skilled professionals across trades</Text>

        <View style={styles.searchBar}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by skill, name, or area..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: '#94A3B8', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Trade Selector Scroll */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.pill, selectedTrade === 'all' && styles.pillActive]}
            onPress={() => setSelectedTrade('all')}
          >
            <Text style={[styles.pillText, selectedTrade === 'all' && styles.pillTextActive]}>
              All Trades (सभी हुनर)
            </Text>
          </TouchableOpacity>

          {WORKER_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, selectedTrade === cat.id && styles.pillActive]}
              onPress={() => setSelectedTrade(cat.id)}
            >
              <Text style={[styles.pillText, selectedTrade === cat.id && styles.pillTextActive]}>
                {cat.nameEn}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Workers List */}
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.countText}>
          {workers.length} Verified Workers Found
        </Text>

        {workers.map(w => (
          <TouchableOpacity
            key={w.id}
            style={styles.card}
            activeOpacity={0.88}
            onPress={() => router.push(`/worker/${w.id}`)}
          >
            <View style={styles.cardTop}>
              <View style={styles.avatar}>
                <Text style={{ fontSize: 24 }}>👷‍♂️</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.workerName}>{w.fullName}</Text>
                  <Text style={styles.wageText}>₹{w.expectedDailyWage}/day</Text>
                </View>

                <Text style={styles.primarySkill}>{w.skills[0] || 'Skilled Worker'}</Text>
                <Text style={styles.locText}>📍 {w.preferredLocation || w.city}</Text>
              </View>
            </View>

            <View style={styles.chipsRow}>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>★ {w.ratingAvg} ({w.ratingCount} reviews)</Text>
              </View>

              <View style={styles.expBadge}>
                <Text style={styles.expText}>{w.experienceYears} Years Exp</Text>
              </View>

              <View style={[styles.expBadge, { backgroundColor: '#ECFDF5' }]}>
                <Text style={[styles.expText, { color: '#059669' }]}>Aadhaar Verified</Text>
              </View>
            </View>

            <Text style={styles.bioSnippet} numberOfLines={2}>{w.bio}</Text>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => router.push(`/worker/${w.id}`)}
              >
                <Text style={styles.profileBtnText}>View Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.hireBtn}
                onPress={() => Linking.openURL(`tel:${w.phoneNumber}`)}
              >
                <Text style={styles.hireBtnText}>📞 Call & Hire</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
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
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#172554',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  pillTextActive: {
    color: '#FFFFFF',
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
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  workerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  wageText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
  },
  primarySkill: {
    fontSize: 13,
    color: '#1E3A8A',
    fontWeight: '700',
    marginTop: 2,
  },
  locText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  ratingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '800',
  },
  expBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  expText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  bioSnippet: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  profileBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  profileBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  hireBtn: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  hireBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
