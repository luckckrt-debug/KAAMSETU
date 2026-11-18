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

export default function ContractorProjectsScreen() {
  const router = useRouter();
  const { contractor } = useContractorState();
  const [projects, setProjects] = useState<ContractorProjectData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await apiClient.getContractorProjects(contractor?.id || 'cnt-1');
      if (res.success && res.projects) {
        setProjects(res.projects);
      }
    } catch (e) {
      console.warn('Error fetching projects:', e);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [contractor]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Construction Projects</Text>
          <Text style={styles.headerSub}>Manage sites, deadlines, and workforce assignments</Text>
        </View>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push('/project/create')}
        >
          <Text style={styles.createBtnText}>+ New Project</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {projects.map(p => (
          <TouchableOpacity
            key={p.id}
            style={styles.card}
            activeOpacity={0.88}
            onPress={() => router.push(`/project/${p.id}`)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.title}>{p.title}</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{p.status}</Text>
              </View>
            </View>

            <Text style={styles.locText}>📍 {p.location}, {p.city}</Text>
            <Text style={styles.clientText}>Developer: {p.clientName}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Site Budget</Text>
                <Text style={styles.statVal}>₹{(p.budget / 100000).toFixed(1)} L</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Assigned Crew</Text>
                <Text style={[styles.statVal, { color: '#2563EB' }]}>
                  {p.assignedWorkersCount} Workers
                </Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Attendance</Text>
                <Text style={[styles.statVal, { color: '#059669' }]}>{p.attendanceRate}%</Text>
              </View>
            </View>

            <View style={styles.tradesRow}>
              {p.requiredTrades.map((t, idx) => (
                <View key={idx} style={styles.tradeChip}>
                  <Text style={styles.tradeText}>{t}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.dateText}>Timeline: {p.startDate} - {p.endDate}</Text>
              <Text style={styles.viewLink}>Manage Workforce →</Text>
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
    backgroundColor: '#0F172A',
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
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  createBtn: {
    backgroundColor: '#F97316',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  createBtnText: {
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
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  statusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  locText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  clientText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
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
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  tradesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tradeChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tradeText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '700',
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
    color: '#F97316',
  },
});
