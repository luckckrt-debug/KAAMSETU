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
import { useContractorState } from '../../src/state';
import { apiClient } from '@kaamsetu/api-client';
import { ContractorProjectData } from '@kaamsetu/shared';

export default function ContractorHomeScreen() {
  const router = useRouter();
  const { t, contractor } = useContractorState();
  const [projects, setProjects] = useState<ContractorProjectData[]>([]);
  const [wageSummary, setWageSummary] = useState({ totalWagePayable: 1925, totalPresent: 2 });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const pRes = await apiClient.getContractorProjects(contractor?.id || 'cnt-1');
      if (pRes.success && pRes.projects) {
        setProjects(pRes.projects);
      }
      const wRes = await apiClient.getContractorWageSummary(contractor?.id || 'cnt-1');
      if (wRes.success) {
        setWageSummary({
          totalWagePayable: wRes.totalWagePayable || 1925,
          totalPresent: wRes.totalPresentCount || 2,
        });
      }
    } catch (e) {
      console.warn('Error loading contractor home:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [contractor]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const totalWorkers = projects.reduce((sum, p) => sum + (p.assignedWorkersCount || 0), 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Top Banner */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>DIGIWORK CONTRACTOR</Text>
          <Text style={styles.companyName}>{contractor?.companyName || 'Shri Ram Infra'}</Text>
          <View style={styles.gstBadge}>
            <Text style={styles.gstText}>GST: {contractor?.gstNumber || '07AAACS1429B1Z8'}</Text>
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
        {/* 4 Metric Cards */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Active Sites</Text>
            <Text style={styles.kpiValue}>{projects.length}</Text>
            <Text style={styles.kpiSub}>Civil & Commercial</Text>
          </View>

          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Total Workforce</Text>
            <Text style={[styles.kpiValue, { color: '#2563EB' }]}>{totalWorkers}</Text>
            <Text style={styles.kpiSub}>Contracted workers</Text>
          </View>

          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Today Present</Text>
            <Text style={[styles.kpiValue, { color: '#059669' }]}>{wageSummary.totalPresent}</Text>
            <Text style={styles.kpiSub}>Muster Roll logged</Text>
          </View>

          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Today's Wages</Text>
            <Text style={[styles.kpiValue, { color: '#EA580C' }]}>₹{wageSummary.totalWagePayable}</Text>
            <Text style={styles.kpiSub}>Payable labour</Text>
          </View>
        </View>

        {/* Action Grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/project/create')}
          >
            <Text style={styles.actionIcon}>🏗️</Text>
            <Text style={styles.actionTitle}>Create Project</Text>
            <Text style={styles.actionSub}>Add new site requirement</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/attendance/mark')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionTitle}>Mark Attendance</Text>
            <Text style={styles.actionSub}>Daily muster roll entry</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/wages')}
          >
            <Text style={styles.actionIcon}>💰</Text>
            <Text style={styles.actionTitle}>Wage Records</Text>
            <Text style={styles.actionSub}>Labour expense ledger</Text>
          </TouchableOpacity>
        </View>

        {/* Active Projects List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Construction Projects ({projects.length})</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/projects')}>
            <Text style={styles.seeAll}>Manage All →</Text>
          </TouchableOpacity>
        </View>

        {projects.map(p => (
          <TouchableOpacity
            key={p.id}
            style={styles.projectCard}
            activeOpacity={0.88}
            onPress={() => router.push(`/project/${p.id}`)}
          >
            <View style={styles.projTop}>
              <Text style={styles.projTitle}>{p.title}</Text>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>{p.status}</Text>
              </View>
            </View>

            <Text style={styles.projLocation}>📍 {p.location}, {p.city}</Text>
            <Text style={styles.projClient}>Client: {p.clientName} • Budget: ₹{(p.budget / 100000).toFixed(1)} Lakhs</Text>

            <View style={styles.projFooter}>
              <Text style={styles.workerCount}>👥 {p.assignedWorkersCount} Assigned Workers</Text>
              <Text style={styles.attRate}>Attendance: {p.attendanceRate}%</Text>
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
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  companyName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  gstBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gstText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  notifBtn: {
    backgroundColor: '#1E293B',
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
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 2,
  },
  kpiSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  actionSub: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
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
    color: '#F97316',
    fontWeight: '700',
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  projTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  projTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  activePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePillText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  projLocation: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  projClient: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 10,
  },
  projFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  workerCount: {
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '700',
  },
  attRate: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '800',
  },
});
