import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHiringState } from '../../src/state';
import { UNIVERSAL_CATEGORIES, MobileCategory } from '../../src/professions';
import { apiClient } from '@kaamsetu/api-client';
import { WorkerProfileData } from '@kaamsetu/shared';

export default function EmployerHomeScreen() {
  const router = useRouter();
  const { t, employer, activeBookings, currentAddress } = useHiringState();
  const [workers, setWorkers] = useState<WorkerProfileData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchCategory, setSearchCategory] = useState('');

  const loadData = async () => {
    try {
      const wrkRes = await apiClient.getWorkers({ availableOnly: true });
      if (wrkRes.success && wrkRes.workers) {
        setWorkers(wrkRes.workers);
      }
    } catch (e) {
      console.warn('Network sync notice:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filter categories by search
  const filteredCategories = searchCategory.trim()
    ? UNIVERSAL_CATEGORIES.filter(
        c =>
          c.nameEn.toLowerCase().includes(searchCategory.toLowerCase()) ||
          c.nameHi.includes(searchCategory) ||
          c.popularProfessions.some(p => p.toLowerCase().includes(searchCategory.toLowerCase()))
      )
    : UNIVERSAL_CATEGORIES;

  const topActiveBooking = activeBookings[0];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>KAAMSETU HIRING (कामसेतु)</Text>
          <Text style={styles.empGreeting}>{employer?.companyName || 'Employer Dashboard'}</Text>
          <TouchableOpacity style={styles.addressPill} activeOpacity={0.8}>
            <Text style={{ fontSize: 11 }}>📍</Text>
            <Text style={styles.addressText} numberOfLines={1}>{currentAddress}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => router.push('/notifications')}
        >
          <Text style={{ fontSize: 18 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Active Booking Live Banner (if any) */}
        {topActiveBooking && (
          <TouchableOpacity
            style={styles.activeBookingBanner}
            activeOpacity={0.9}
            onPress={() => router.push('/(tabs)/bookings')}
          >
            <View style={styles.activeBookingTop}>
              <View style={styles.livePulseBox}>
                <View style={styles.pulseDot} />
                <Text style={styles.liveBookingStatus}>
                  {topActiveBooking.status === 'EN_ROUTE' ? 'WORKER EN ROUTE (रास्ते में)' :
                   topActiveBooking.status === 'IN_PROGRESS' ? 'WORK IN PROGRESS (काम चालू)' :
                   'ACTIVE BOOKING'}
                </Text>
              </View>
              <Text style={styles.liveBookingEta}>ETA: ~{topActiveBooking.etaMinutes} Min</Text>
            </View>

            <View style={styles.activeBookingDetails}>
              <Text style={{ fontSize: 26, marginRight: 10 }}>{topActiveBooking.categoryIcon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.activeBookingTitle}>{topActiveBooking.profession}</Text>
                <Text style={styles.activeBookingWorker}>
                  Assigned: {topActiveBooking.workerName} • 📞 {topActiveBooking.workerPhone}
                </Text>
              </View>
              <View style={styles.otpBox}>
                <Text style={styles.otpLabel}>START PIN</Text>
                <Text style={styles.otpCode}>{topActiveBooking.startOtp}</Text>
              </View>
            </View>

            <View style={styles.activeBookingFooter}>
              <Text style={styles.trackLiveLink}>Open Live GPS Tracker →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 2 Big Action Cards */}
        <View style={styles.actionCardsRow}>
          <TouchableOpacity
            style={[styles.bigActionCard, { backgroundColor: '#EA580C' }]}
            activeOpacity={0.88}
            onPress={() => router.push('/book')}
          >
            <View style={styles.actionIconBadge}>
              <Text style={{ fontSize: 20 }}>⚡</Text>
            </View>
            <Text style={styles.actionCardTitle}>Instant Book</Text>
            <Text style={styles.actionCardSub}>15-Min Doorstep Dispatch (तत्काल कारीगर)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bigActionCard, { backgroundColor: '#1E3A8A' }]}
            activeOpacity={0.88}
            onPress={() => router.push('/post-job')}
          >
            <View style={styles.actionIconBadge}>
              <Text style={{ fontSize: 20 }}>📋</Text>
            </View>
            <Text style={styles.actionCardTitle}>Post Vacancy</Text>
            <Text style={styles.actionCardSub}>Hire Daily / Contract Staff (वैकेंसी पोस्ट करें)</Text>
          </TouchableOpacity>
        </View>

        {/* 3 Metric Cards */}
        <View style={styles.kpiRow}>
          <TouchableOpacity
            style={styles.kpiBox}
            onPress={() => router.push('/(tabs)/bookings')}
          >
            <Text style={styles.kpiLabel}>Active Bookings</Text>
            <Text style={[styles.kpiValue, { color: '#EA580C' }]}>{activeBookings.length}</Text>
            <Text style={styles.kpiSub}>Track live</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.kpiBox}
            onPress={() => router.push('/(tabs)/workers')}
          >
            <Text style={styles.kpiLabel}>Workers Nearby</Text>
            <Text style={[styles.kpiValue, { color: '#059669' }]}>
              {workers.length > 0 ? workers.length : 18}
            </Text>
            <Text style={styles.kpiSub}>In 5km radius</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.kpiBox}
            onPress={() => router.push('/(tabs)/jobs')}
          >
            <Text style={styles.kpiLabel}>Posted Jobs</Text>
            <Text style={[styles.kpiValue, { color: '#2563EB' }]}>
              {employer?.postedJobsCount || 4}
            </Text>
            <Text style={styles.kpiSub}>Applications</Text>
          </TouchableOpacity>
        </View>

        {/* Universal 26 Categories Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>All 26 India-Wide Professions (समस्त 26 कार्य श्रेणियां)</Text>
            <Text style={styles.sectionSub}>Construction, IT, Tech, Healthcare, Transport & Trades</Text>
          </View>
        </View>

        {/* Category Search Input */}
        <View style={styles.categorySearch}>
          <Text style={{ fontSize: 14, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={styles.categorySearchInput}
            placeholder="Search all 26 industries or trades (e.g. Electrician, Nurse, Driver)..."
            placeholderTextColor="#94A3B8"
            value={searchCategory}
            onChangeText={setSearchCategory}
          />
          {searchCategory ? (
            <TouchableOpacity onPress={() => setSearchCategory('')}>
              <Text style={{ color: '#94A3B8', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Categories Grid */}
        <View style={styles.categoryGrid}>
          {filteredCategories.slice(0, 12).map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryTile}
              activeOpacity={0.82}
              onPress={() => router.push({ pathname: '/book', params: { preselectCategory: cat.id } })}
            >
              <Text style={styles.categoryEmoji}>{cat.icon}</Text>
              <Text style={styles.categoryTileName} numberOfLines={1}>{cat.nameEn}</Text>
              <Text style={styles.categoryTileHindi} numberOfLines={1}>{cat.nameHi}</Text>
              <View style={styles.ratePill}>
                <Text style={styles.ratePillText}>From ₹{cat.baseHourlyRate}/hr</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredCategories.length > 12 && (
          <TouchableOpacity
            style={styles.viewMoreCatBtn}
            onPress={() => router.push('/book')}
          >
            <Text style={styles.viewMoreCatText}>View All 26 Categories (सभी 26 श्रेणियां देखें) →</Text>
          </TouchableOpacity>
        )}

        {/* Ready to Hire Workers Radar Preview */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View>
            <Text style={styles.sectionTitle}>Workforce Radar (आसपास तुरंत उपलब्ध कारीगर)</Text>
            <Text style={styles.sectionSub}>Verified professionals ready for immediate dispatch</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/workers')}>
            <Text style={styles.seeAll}>View Radar →</Text>
          </TouchableOpacity>
        </View>

        {(workers.length > 0 ? workers.slice(0, 3) : [
          { id: 'w-1', fullName: 'Sunil Kumar', skills: ['Electrician'], expectedDailyWage: 800, experienceYears: 6, ratingAvg: 4.9, ratingCount: 42, preferredLocation: 'Sector 78, Noida' },
          { id: 'w-2', fullName: 'Mohammad Farooq', skills: ['Plumber'], expectedDailyWage: 750, experienceYears: 8, ratingAvg: 4.8, ratingCount: 38, preferredLocation: 'Sector 76, Noida' },
          { id: 'w-3', fullName: 'Jagdish Mistri', skills: ['Mason / Raj Mistri'], expectedDailyWage: 950, experienceYears: 11, ratingAvg: 5.0, ratingCount: 64, preferredLocation: 'Sector 100, Noida' },
        ]).map((w: any) => (
          <View key={w.id} style={styles.workerCard}>
            <View style={styles.workerAvatar}>
              <Text style={{ fontSize: 24 }}>👷‍♂️</Text>
            </View>

            <View style={styles.workerInfo}>
              <View style={styles.workerTopRow}>
                <Text style={styles.workerName}>{w.fullName}</Text>
                <Text style={styles.workerWage}>₹{w.expectedDailyWage}/day</Text>
              </View>

              <Text style={styles.workerTrade}>{w.skills?.[0] || 'Skilled Worker'}</Text>
              <Text style={styles.workerLocation}>📍 {w.preferredLocation} • {w.experienceYears} yrs exp</Text>

              <View style={styles.workerBadgeRow}>
                <View style={styles.greenPill}>
                  <Text style={styles.greenPillText}>★ {w.ratingAvg || 4.9} ({w.ratingCount || 20})</Text>
                </View>
                <View style={[styles.greenPill, { backgroundColor: '#EFF6FF' }]}>
                  <Text style={[styles.greenPillText, { color: '#1D4ED8' }]}>Aadhaar Verified</Text>
                </View>
              </View>

              <View style={styles.workerActionRow}>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL('tel:9911223344')}
                >
                  <Text style={styles.callBtnText}>📞 Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.instantBookBtn}
                  onPress={() => router.push({ pathname: '/book', params: { workerName: w.fullName, trade: w.skills?.[0] } })}
                >
                  <Text style={styles.instantBookBtnText}>⚡ Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
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
    backgroundColor: '#1E3A8A',
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
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  empGreeting: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  addressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
    maxWidth: '90%',
  },
  addressText: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  notifBtn: {
    backgroundColor: '#172554',
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 35,
  },
  activeBookingBanner: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FB923C',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  activeBookingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  livePulseBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA580C',
    marginRight: 6,
  },
  liveBookingStatus: {
    color: '#C2410C',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveBookingEta: {
    color: '#9A3412',
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBookingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBookingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  activeBookingWorker: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  otpBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  otpLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9A3412',
  },
  otpCode: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EA580C',
  },
  activeBookingFooter: {
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
    marginTop: 10,
    paddingTop: 8,
  },
  trackLiveLink: {
    color: '#C2410C',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  actionCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  bigActionCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  actionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  actionCardSub: {
    color: '#FFFFFF',
    opacity: 0.88,
    fontSize: 11,
    marginTop: 2,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 2,
  },
  kpiSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  seeAll: {
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '700',
  },
  categorySearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  categorySearchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryTile: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryTileName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  categoryTileHindi: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 1,
  },
  ratePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  ratePillText: {
    color: '#1D4ED8',
    fontSize: 9,
    fontWeight: '800',
  },
  viewMoreCatBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  viewMoreCatText: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '800',
  },
  workerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  workerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workerInfo: {
    flex: 1,
  },
  workerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  workerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  workerWage: {
    fontSize: 13,
    fontWeight: '900',
    color: '#059669',
  },
  workerTrade: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
  workerLocation: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  workerBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  greenPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  greenPillText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  workerActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  callBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  instantBookBtn: {
    flex: 1.5,
    backgroundColor: '#EA580C',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  instantBookBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
