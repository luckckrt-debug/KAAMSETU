import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '@kaamsetu/api-client';
import { WorkerProfileData } from '@kaamsetu/shared';

export default function EmployerWorkerDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [worker, setWorker] = useState<WorkerProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorker() {
      try {
        const res = await apiClient.getWorkerById(id || 'wrk-1');
        if (res.success && res.worker) {
          setWorker(res.worker);
        }
      } catch (e) {
        console.warn('Error fetching worker profile:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchWorker();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (!worker) {
    return (
      <View style={styles.center}>
        <Text>Worker profile not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Worker Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Worker Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 36 }}>👷‍♂️</Text>
          </View>

          <Text style={styles.workerName}>{worker.fullName}</Text>
          <Text style={styles.workerSkill}>{worker.skills[0] || 'Tradesperson'}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Aadhaar KYC Verified</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {worker.ratingAvg} ({worker.ratingCount} reviews)</Text>
            </View>
          </View>
        </View>

        {/* Pricing & Experience Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Daily Wage</Text>
            <Text style={styles.metricValue}>₹{worker.expectedDailyWage}</Text>
            <Text style={styles.metricSub}>8 hours shift</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Experience</Text>
            <Text style={styles.metricValue}>{worker.experienceYears} Years</Text>
            <Text style={styles.metricSub}>Industry verified</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Completed Jobs</Text>
            <Text style={[styles.metricValue, { color: '#059669' }]}>
              {worker.completedJobsCount}
            </Text>
            <Text style={styles.metricSub}>100% on time</Text>
          </View>
        </View>

        {/* Skills Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Skills & Expertise</Text>
          <View style={styles.skillsRow}>
            {worker.skills.map((s, idx) => (
              <View key={idx} style={styles.skillChip}>
                <Text style={styles.skillText}>{s}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Professional Bio</Text>
          <Text style={styles.bioText}>{worker.bio}</Text>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Location / Working Area:</Text>
            <Text style={styles.infoValue}>{worker.preferredLocation || worker.city}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => router.push(`/chat/${worker.id}`)}
        >
          <Text style={styles.chatBtnText}>💬 Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => Linking.openURL(`tel:${worker.phoneNumber}`)}
        >
          <Text style={styles.callBtnText}>📞 Call Worker (+91 {worker.phoneNumber})</Text>
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
    paddingBottom: 90,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  workerName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  workerSkill: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
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
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 4,
  },
  metricSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  skillChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  skillText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
  },
  bioText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 14,
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  chatBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  callBtn: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
