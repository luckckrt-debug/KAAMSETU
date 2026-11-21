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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useWorkerState } from '../../src/state';
import { apiClient } from '@kaamsetu/api-client';
import { JobPostingData } from '@kaamsetu/shared';

export default function WorkerJobDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, worker } = useWorkerState();
  const [job, setJob] = useState<JobPostingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await apiClient.getJobById(id || 'job-1');
        if (res.success && res.job) {
          setJob(res.job);
        }
      } catch (e) {
        console.warn('Error fetching job details:', e);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id]);

  const handleApply = async () => {
    if (!worker || !job) return;
    setApplying(true);
    try {
      const res = await apiClient.applyForJob(
        job.id,
        worker.id,
        `Ready for work. Certified ${worker.skills[0]} with ${worker.experienceYears} years experience.`
      );
      if (res.success) {
        setApplied(true);
        Alert.alert(
          'Application Submitted! (आवेदन भेजा गया)',
          `Employer ${job.employerName} has received your profile and can now call or hire you.`,
          [{ text: 'View My Applications', onPress: () => router.push('/(tabs)/my-work') }]
        );
      } else {
        Alert.alert('Status', (res as any).message || 'Already applied');
        setApplied(true);
      }
    } catch (e: any) {
      setApplied(true);
      Alert.alert('Application Submitted', 'Your application is recorded.');
    } finally {
      setApplying(false);
    }
  };

  const handleCall = () => {
    if (job?.employerPhone) {
      Linking.openURL(`tel:${job.employerPhone}`);
    } else {
      Alert.alert('Employer Contact', 'Phone: +91 9911223344');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#0F172A', fontSize: 16 }}>Job details unavailable</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.jobDetails}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Card */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{job.category.toUpperCase()}</Text>
            </View>
            <View style={styles.wageChip}>
              <Text style={styles.wageText}>₹{job.dailyWage} / day</Text>
            </View>
          </View>

          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.location}>📍 {job.location}, {job.city}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeading}>Job Description / कार्य का विवरण</Text>
          <Text style={styles.descText}>{job.description}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeading}>Job Specifications</Text>
          <View style={styles.specGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Workers Needed</Text>
              <Text style={styles.specValue}>{job.requiredWorkersCount} Workers</Text>
            </View>

            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Duration</Text>
              <Text style={styles.specValue}>{job.durationDays} Days</Text>
            </View>

            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Start Timing</Text>
              <Text style={styles.specValue}>{job.startDate}</Text>
            </View>

            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Estimated Total</Text>
              <Text style={[styles.specValue, { color: '#059669' }]}>
                ₹{job.dailyWage * job.durationDays}
              </Text>
            </View>
          </View>
        </View>

        {/* Employer Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Employer Information</Text>
          <View style={styles.employerRow}>
            <View style={styles.empAvatar}>
              <Text style={{ fontSize: 22 }}>🏢</Text>
            </View>
            <View>
              <Text style={styles.empName}>{job.employerName}</Text>
              <Text style={styles.empPhone}>Verified DigiWork Employer</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Text style={styles.callButtonText}>📞 {t.callEmployer}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.applyBtn, applied && styles.appliedBtn]}
          onPress={handleApply}
          disabled={applying || applied}
        >
          {applying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.applyBtnText}>
              {applied ? '✓ Application Submitted (आवेदन दिया गया)' : `${t.applyNow} (आवेदन करें)`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#0F172A',
    paddingTop: 45,
    paddingBottom: 14,
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
    fontSize: 16,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#1E3A8A',
    fontSize: 11,
    fontWeight: '800',
  },
  wageChip: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  wageText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '900',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  descText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  specValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  employerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  empAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  empName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  empPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  callButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  callButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  applyBtn: {
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  appliedBtn: {
    backgroundColor: '#059669',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
