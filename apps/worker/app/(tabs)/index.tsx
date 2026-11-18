import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useWorkerState } from '../../src/state';
import { apiClient } from '@kaamsetu/api-client';
import { JobPostingData } from '@kaamsetu/shared';

export default function WorkerHomeScreen() {
  const router = useRouter();
  const { t, worker, language, setLanguage, isOnline, toggleOnline } = useWorkerState();
  const [nearbyJobs, setNearbyJobs] = useState<JobPostingData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [walletBalance, setWalletBalance] = useState({ available: 4200, today: 750 });

  const loadData = async () => {
    try {
      const res = await apiClient.getJobs({ status: 'OPEN' });
      if (res.success && res.jobs) {
        setNearbyJobs(res.jobs.slice(0, 5));
      }
      if (worker) {
        const earnRes = await apiClient.getWorkerEarnings(worker.id);
        if (earnRes.success && earnRes.wallet) {
          setWalletBalance({
            available: earnRes.wallet.availableBalance,
            today: earnRes.wallet.todayEarnings,
          });
        }
      }
    } catch (e) {
      console.warn('Error fetching worker dashboard data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [worker]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Top App Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>KAAMSETU</Text>
          <Text style={styles.workerGreeting}>
            {language === 'hi' ? 'नमस्ते' : 'Hello'}, {worker?.fullName || 'Worker'}!
          </Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Aadhaar KYC Verified</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Language Toggle */}
          <TouchableOpacity
            style={styles.langButton}
            onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          >
            <Text style={styles.langText}>{language === 'en' ? 'हिन्दी' : 'English'}</Text>
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => router.push('/notifications')}
          >
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* 1. Duty Status Switch (Online / Offline) */}
        <View style={[styles.dutyCard, { backgroundColor: isOnline ? '#F0FDF4' : '#F8FAFC' }]}>
          <View style={styles.dutyLeft}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#94A3B8' }]} />
            <View>
              <Text style={styles.dutyTitle}>{t.dutyStatus}</Text>
              <Text style={[styles.dutySub, { color: isOnline ? '#059669' : '#64748B' }]}>
                {isOnline ? t.online : t.offline}
              </Text>
            </View>
          </View>
          <Switch
            value={isOnline}
            onValueChange={toggleOnline}
            trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
            thumbColor={isOnline ? '#10B981' : '#64748B'}
          />
        </View>

        {/* 2. Today's Earnings & Wallet Card */}
        <View style={styles.earningsCard}>
          <View style={styles.earningsHeader}>
            <Text style={styles.earningsLabel}>{t.todayEarnings}</Text>
            <TouchableOpacity onPress={() => router.push('/earnings')}>
              <Text style={styles.viewWalletLink}>Wallet History →</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.earningsValue}>₹{walletBalance.today}</Text>

          <View style={styles.earningsDivider} />

          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>{t.availableBalance}</Text>
              <Text style={styles.balanceValue}>₹{walletBalance.available}</Text>
            </View>

            <TouchableOpacity
              style={styles.withdrawButton}
              onPress={() => router.push('/earnings')}
            >
              <Text style={styles.withdrawBtnText}>⚡ {t.withdrawNow}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Nearby Direct Jobs */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.nearbyJobs} (आसपास के काम)</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/jobs')}>
            <Text style={styles.seeAllText}>{t.viewAllJobs}</Text>
          </TouchableOpacity>
        </View>

        {nearbyJobs.map((job) => (
          <TouchableOpacity
            key={job.id}
            style={styles.jobCard}
            activeOpacity={0.85}
            onPress={() => router.push(`/job/${job.id}`)}
          >
            <View style={styles.jobHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{job.category.toUpperCase()}</Text>
              </View>
              <View style={styles.wageChip}>
                <Text style={styles.wageText}>₹{job.dailyWage} / {t.perDay}</Text>
              </View>
            </View>

            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobDesc} numberOfLines={2}>{job.description}</Text>

            <View style={styles.jobFooter}>
              <Text style={styles.jobLocation}>📍 {job.location}</Text>
              <TouchableOpacity
                style={styles.quickApplyBtn}
                onPress={() => router.push(`/job/${job.id}`)}
              >
                <Text style={styles.quickApplyText}>{t.applyNow}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* 4. Quick Actions */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/my-work')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionTitle}>{t.navMyWork}</Text>
            <Text style={styles.actionSub}>Active jobs & sites</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/messages')}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionTitle}>{t.navMessages}</Text>
            <Text style={styles.actionSub}>Employer chats</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  appName: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  workerGreeting: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  verifiedText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  langText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  notifButton: {
    backgroundColor: '#1E293B',
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  dutyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  dutyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dutyTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  dutySub: {
    fontSize: 15,
    fontWeight: '800',
  },
  earningsCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  viewWalletLink: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: '700',
  },
  earningsValue: {
    color: '#10B981',
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 6,
  },
  earningsDivider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  withdrawButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  withdrawBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F97316',
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    color: '#1D4ED8',
    fontSize: 10,
    fontWeight: '800',
  },
  wageChip: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  wageText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '800',
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  jobDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  jobLocation: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  quickApplyBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickApplyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 30,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
});
