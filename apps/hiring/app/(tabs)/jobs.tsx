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
import { JobPostingData } from '@kaamsetu/shared';

export default function EmployerJobsManagementScreen() {
  const router = useRouter();
  const { t, employer } = useHiringState();
  const [jobs, setJobs] = useState<JobPostingData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await apiClient.getJobs({ employerId: employer?.id || 'emp-1' });
      if (res.success && res.jobs) {
        setJobs(res.jobs);
      }
    } catch (e) {
      console.warn('Error fetching employer jobs:', e);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [employer]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Job Postings (पोस्ट किए गए काम)</Text>
          <Text style={styles.headerSub}>Manage vacancies, track applicants, and hire workers</Text>
        </View>

        <TouchableOpacity
          style={styles.postBtn}
          onPress={() => router.push('/post-job')}
        >
          <Text style={styles.postBtnText}>+ Post Job</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {jobs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 44, marginBottom: 8 }}>📋</Text>
            <Text style={styles.emptyTitle}>No jobs posted yet</Text>
            <Text style={styles.emptySub}>Post a job to find electricians, plumbers, and workers nearby.</Text>
            <TouchableOpacity
              style={styles.firstJobBtn}
              onPress={() => router.push('/post-job')}
            >
              <Text style={styles.firstJobText}>Post Your First Job Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          jobs.map(job => (
            <TouchableOpacity
              key={job.id}
              style={styles.card}
              activeOpacity={0.88}
              onPress={() => router.push(`/job/${job.id}/applications`)}
            >
              <View style={styles.cardTop}>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>{job.category.toUpperCase()}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{job.status}</Text>
                </View>
              </View>

              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobMeta}>📍 {job.location} • ₹{job.dailyWage} / day</Text>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Workers Required</Text>
                  <Text style={styles.statNum}>{job.requiredWorkersCount}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Hired So Far</Text>
                  <Text style={[styles.statNum, { color: '#059669' }]}>{job.hiredWorkersCount}</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Applications</Text>
                  <Text style={[styles.statNum, { color: '#EA580C' }]}>{job.applicantsCount}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.dateText}>Posted {new Date(job.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.viewLink}>Manage & Review Applicants →</Text>
              </View>
            </TouchableOpacity>
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
    backgroundColor: '#1E3A8A',
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
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: '#93C5FD',
    marginTop: 2,
  },
  postBtn: {
    backgroundColor: '#F97316',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  postBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  list: {
    padding: 16,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '800',
  },
  statusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  jobMeta: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  statNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  viewLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  firstJobBtn: {
    backgroundColor: '#F97316',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  firstJobText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
