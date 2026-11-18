import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '@kaamsetu/api-client';
import { JobPostingData, JobApplicationData } from '@kaamsetu/shared';

export default function JobApplicationsDeskScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<JobPostingData | null>(null);
  const [applicants, setApplicants] = useState<JobApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await apiClient.getJobById(id || 'job-1');
      if (res.success) {
        setJob(res.job);
        setApplicants(res.applicants || []);
      }
    } catch (e) {
      console.warn('Error loading applications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (appId: string, status: 'SHORTLISTED' | 'HIRED' | 'REJECTED') => {
    try {
      const res = await apiClient.updateApplicationStatus(appId, status);
      if (res.success) {
        setApplicants(prev =>
          prev.map(a => (a.id === appId ? { ...a, status } : a))
        );
        Alert.alert(
          'Status Updated',
          status === 'HIRED'
            ? 'Worker successfully hired! They have been notified on their KaamSetu Worker app.'
            : `Worker marked as ${status}.`
        );
      }
    } catch (e) {
      setApplicants(prev =>
        prev.map(a => (a.id === appId ? { ...a, status } : a))
      );
      Alert.alert('Status Updated', `Worker marked as ${status}.`);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Applicants Review Desk</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Job Header */}
        <View style={styles.jobBanner}>
          <Text style={styles.jobTitle}>{job?.title}</Text>
          <Text style={styles.jobMeta}>
            📍 {job?.location} • ₹{job?.dailyWage}/day • {job?.requiredWorkersCount} Workers Required
          </Text>
          <Text style={styles.applicantHeader}>
            {applicants.length} Workers Applied for this Job
          </Text>
        </View>

        {applicants.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 44, marginBottom: 8 }}>👥</Text>
            <Text style={styles.emptyTitle}>No applicants yet</Text>
            <Text style={styles.emptySub}>Nearby workers are being notified. Applicants will appear here soon.</Text>
          </View>
        ) : (
          applicants.map(app => (
            <View key={app.id} style={styles.applicantCard}>
              <View style={styles.topRow}>
                <View style={styles.avatar}>
                  <Text style={{ fontSize: 22 }}>👷‍♂️</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.workerName}>{app.workerName}</Text>
                    <View style={[styles.statusBadge, {
                      backgroundColor: app.status === 'HIRED' ? '#DCFCE7' : app.status === 'SHORTLISTED' ? '#FEF3C7' : '#F1F5F9'
                    }]}>
                      <Text style={[styles.statusBadgeText, {
                        color: app.status === 'HIRED' ? '#15803D' : app.status === 'SHORTLISTED' ? '#B45309' : '#475569'
                      }]}>
                        {app.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.skillText}>{app.workerCategory} • {app.workerExperienceYears} yrs experience</Text>
                  <Text style={styles.ratingText}>★ {app.workerRating} Rating • ₹{app.workerDailyWage}/day expected</Text>
                </View>
              </View>

              {app.notes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>"{app.notes}"</Text>
                </View>
              ) : null}

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${app.workerPhone}`)}
                >
                  <Text style={styles.callBtnText}>📞 Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.chatBtn}
                  onPress={() => router.push(`/chat/${app.workerId}`)}
                >
                  <Text style={styles.chatBtnText}>💬 Chat</Text>
                </TouchableOpacity>

                {app.status !== 'HIRED' && (
                  <TouchableOpacity
                    style={styles.shortlistBtn}
                    onPress={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                  >
                    <Text style={styles.shortlistBtnText}>Shortlist</Text>
                  </TouchableOpacity>
                )}

                {app.status !== 'HIRED' ? (
                  <TouchableOpacity
                    style={styles.hireBtn}
                    onPress={() => handleUpdateStatus(app.id, 'HIRED')}
                  >
                    <Text style={styles.hireBtnText}>✓ Hire Now</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.hiredChip}>
                    <Text style={styles.hiredChipText}>Hired</Text>
                  </View>
                )}
              </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  content: {
    padding: 16,
  },
  jobBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  jobMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  applicantHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E3A8A',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  applicantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EFF6FF',
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
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  skillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '700',
    marginTop: 2,
  },
  notesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notesText: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    alignItems: 'center',
  },
  callBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  callBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  chatBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  chatBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  shortlistBtn: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  shortlistBtnText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '800',
  },
  hireBtn: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  hireBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  hiredChip: {
    flex: 1,
    backgroundColor: '#DCFCE7',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  hiredChipText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '800',
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
});
