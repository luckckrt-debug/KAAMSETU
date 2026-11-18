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
import { WorkerProfileData, JobPostingData, JobApplicationData } from '@kaamsetu/shared';

export default function EmployerHomeScreen() {
  const router = useRouter();
  const { t, employer } = useHiringState();
  const [activeJobs, setActiveJobs] = useState<JobPostingData[]>([]);
  const [workers, setWorkers] = useState<WorkerProfileData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const jobsRes = await apiClient.getJobs({ employerId: employer?.id || 'emp-1' });
      if (jobsRes.success && jobsRes.jobs) {
        setActiveJobs(jobsRes.jobs);
      }
      const wrkRes = await apiClient.getWorkers({ availableOnly: true });
      if (wrkRes.success && wrkRes.workers) {
        setWorkers(wrkRes.workers.slice(0, 4));
      }
    } catch (e) {
      console.warn('Error loading employer home data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [employer]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const totalApplicants = activeJobs.reduce((sum, j) => sum + (j.applicantsCount || 0), 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>KAAMSETU HIRING</Text>
          <Text style={styles.empGreeting}>{employer?.companyName || 'Employer Dashboard'}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified Business Employer</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => router.push('/notifications')}
        >
          <Text style={{ fontSize: 18 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Post a Job Hero Action */}
        <TouchableOpacity
          style={styles.postJobHero}
          activeOpacity={0.88}
          onPress={() => router.push('/post-job')}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>+ {t.postJob}</Text>
            <Text style={styles.heroSub}>{t.postJobSubtitle}</Text>
          </View>
          <View style={styles.heroArrow}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>→</Text>
          </View>
        </TouchableOpacity>

        {/* 3 Metric Cards */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Active Jobs</Text>
            <Text style={styles.kpiValue}>{activeJobs.length}</Text>
            <Text style={styles.kpiSub}>Accepting workers</Text>
          </View>

          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Total Hired</Text>
            <Text style={[styles.kpiValue, { color: '#059669' }]}>
              {employer?.totalHiresCount || 5}
            </Text>
            <Text style={styles.kpiSub}>Workers working</Text>
          </View>

          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Applications</Text>
            <Text style={[styles.kpiValue, { color: '#EA580C' }]}>{totalApplicants}</Text>
            <Text style={styles.kpiSub}>Awaiting review</Text>
          </View>
        </View>

        {/* Active Jobs Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Posted Jobs ({activeJobs.length})</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/jobs')}>
            <Text style={styles.seeAll}>Manage All →</Text>
          </TouchableOpacity>
        </View>

        {activeJobs.map(job => (
          <TouchableOpacity
            key={job.id}
            style={styles.jobItem}
            activeOpacity={0.85}
            onPress={() => router.push(`/job/${job.id}/applications`)}
          >
            <View style={styles.jobTop}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View style={styles.statusChip}>
                <Text style={styles.statusText}>{job.status}</Text>
              </View>
            </View>

            <Text style={styles.jobMeta}>
              📍 {job.location} • ₹{job.dailyWage}/day • {job.durationDays} Days
            </Text>

            <View style={styles.jobFooter}>
              <View style={styles.appCountBadge}>
                <Text style={styles.appCountText}>
                  👥 {job.applicantsCount} Applicants Received
                </Text>
              </View>

              <Text style={styles.viewAppsText}>View Applicants →</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Nearby Available Workers */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Ready to Hire Near You (तुरंत उपलब्ध)</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/workers')}>
            <Text style={styles.seeAll}>Find More →</Text>
          </TouchableOpacity>
        </View>

        {workers.map(w => (
          <TouchableOpacity
            key={w.id}
            style={styles.workerCard}
            activeOpacity={0.85}
            onPress={() => router.push(`/worker/${w.id}`)}
          >
            <View style={styles.workerAvatar}>
              <Text style={{ fontSize: 24 }}>👷‍♂️</Text>
            </View>

            <View style={styles.workerInfo}>
              <View style={styles.workerTopRow}>
                <Text style={styles.workerName}>{w.fullName}</Text>
                <Text style={styles.workerWage}>₹{w.expectedDailyWage}/day</Text>
              </View>

              <Text style={styles.workerTrade}>{w.skills[0] || 'Skilled Worker'}</Text>
              <Text style={styles.workerLocation}>📍 {w.preferredLocation} • {w.experienceYears} yrs exp</Text>

              <View style={styles.workerBadgeRow}>
                <View style={styles.greenPill}>
                  <Text style={styles.greenPillText}>★ {w.ratingAvg} ({w.ratingCount})</Text>
                </View>
                <View style={[styles.greenPill, { backgroundColor: '#EFF6FF' }]}>
                  <Text style={[styles.greenPillText, { color: '#1D4ED8' }]}>Aadhaar Verified</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
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
  verifiedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  verifiedText: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '700',
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
    paddingBottom: 30,
  },
  postJobHero: {
    backgroundColor: '#F97316',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#F97316',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  heroSub: {
    color: '#FFEDD5',
    fontSize: 12,
    marginTop: 2,
  },
  heroArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  seeAll: {
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '700',
  },
  jobItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    color: '#1D4ED8',
    fontSize: 10,
    fontWeight: '800',
  },
  jobMeta: {
    fontSize: 12,
    color: '#64748B',
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
  appCountBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  appCountText: {
    color: '#C2410C',
    fontSize: 11,
    fontWeight: '800',
  },
  viewAppsText: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '700',
  },
  workerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
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
});
