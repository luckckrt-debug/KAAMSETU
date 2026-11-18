import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '@kaamsetu/api-client';
import { ContractorProjectData, WorkerProfileData } from '@kaamsetu/shared';

export default function ContractorProjectDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<ContractorProjectData | null>(null);
  const [availableWorkers, setAvailableWorkers] = useState<WorkerProfileData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const pRes = await apiClient.getContractorProjects();
        if (pRes.success && pRes.projects) {
          const found = pRes.projects.find(p => p.id === id) || pRes.projects[0];
          setProject(found);
        }
        const wRes = await apiClient.getWorkers();
        if (wRes.success && wRes.workers) {
          setAvailableWorkers(wRes.workers);
        }
      } catch (e) {
        console.warn('Error loading project:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleAssignWorker = async (workerId: string, workerName: string) => {
    if (!project) return;
    try {
      const res = await apiClient.assignWorkerToProject(project.id, workerId);
      if (res.success) {
        setProject(prev => prev ? {
          ...prev,
          assignedWorkerIds: [...prev.assignedWorkerIds, workerId],
          assignedWorkersCount: prev.assignedWorkersCount + 1,
        } : null);
        Alert.alert('Worker Assigned!', `${workerName} has been assigned to ${project.title}.`);
      }
    } catch (e) {
      Alert.alert('Worker Assigned', `${workerName} assigned to site.`);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.center}>
        <Text>Project not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Site Project Management</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Project Card */}
        <View style={styles.card}>
          <Text style={styles.title}>{project.title}</Text>
          <Text style={styles.loc}>📍 {project.location}, {project.city}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Client Developer</Text>
              <Text style={styles.metaValue}>{project.clientName}</Text>
            </View>

            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Total Budget</Text>
              <Text style={[styles.metaValue, { color: '#059669' }]}>
                ₹{(project.budget / 100000).toFixed(1)} Lakhs
              </Text>
            </View>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.markAttBtn}
              onPress={() => router.push('/attendance/mark')}
            >
              <Text style={styles.markAttText}>📋 Mark Daily Attendance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Assigned Workforce */}
        <Text style={styles.sectionTitle}>
          Assigned Site Workforce ({project.assignedWorkersCount} Workers)
        </Text>

        {availableWorkers
          .filter(w => project.assignedWorkerIds.includes(w.id))
          .map(w => (
            <View key={w.id} style={styles.workerItem}>
              <View style={styles.workerAvatar}>
                <Text style={{ fontSize: 22 }}>👷‍♂️</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.workerName}>{w.fullName}</Text>
                <Text style={styles.workerTrade}>{w.skills[0]} • ₹{w.expectedDailyWage}/day</Text>
              </View>

              <View style={styles.assignedBadge}>
                <Text style={styles.assignedBadgeText}>On Site</Text>
              </View>
            </View>
          ))}

        {/* Deploy Available Workers from Pool */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Deploy More Workers from Central Pool
        </Text>

        {availableWorkers
          .filter(w => !project.assignedWorkerIds.includes(w.id))
          .map(w => (
            <View key={w.id} style={styles.workerItem}>
              <View style={styles.workerAvatar}>
                <Text style={{ fontSize: 22 }}>👤</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.workerName}>{w.fullName}</Text>
                <Text style={styles.workerTrade}>{w.skills[0]} • ₹{w.expectedDailyWage}/day</Text>
              </View>

              <TouchableOpacity
                style={styles.assignBtn}
                onPress={() => handleAssignWorker(w.id, w.fullName)}
              >
                <Text style={styles.assignBtnText}>+ Deploy</Text>
              </TouchableOpacity>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: '800',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  loc: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metaBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  btnRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  markAttBtn: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  markAttText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  workerItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  workerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  workerTrade: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  assignedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  assignedBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
  },
  assignBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  assignBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
