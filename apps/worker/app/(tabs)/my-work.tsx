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
import { useWorkerState } from '../../src/state';
import { apiClient } from '@kaamsetu/api-client';
import { JobApplicationData, ContractorProjectData } from '@kaamsetu/shared';

export default function WorkerMyWorkScreen() {
  const router = useRouter();
  const { t, worker } = useWorkerState();
  const [activeTab, setActiveTab] = useState<'HIRED' | 'APPLICATIONS' | 'PROJECTS'>('HIRED');
  const [applications, setApplications] = useState<JobApplicationData[]>([]);
  const [projects, setProjects] = useState<ContractorProjectData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!worker) return;
    try {
      const res = await apiClient.getMyWork(worker.id);
      if (res.success) {
        setProjects(res.projectAssignments || []);
      }
      const appRes = await apiClient.getMyApplications(worker.id);
      if (appRes.success) {
        setApplications(appRes.applications || []);
      }
    } catch (e) {
      console.warn('Error fetching my work:', e);
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

  const hiredJobs = applications.filter(a => a.status === 'HIRED');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HIRED':
        return { bg: '#DCFCE7', text: '#15803D', label: 'Hired / काम पर रखा' };
      case 'SHORTLISTED':
        return { bg: '#FEF3C7', text: '#B45309', label: 'Shortlisted' };
      case 'REJECTED':
        return { bg: '#FEE2E2', text: '#B91C1C', label: 'Rejected' };
      case 'APPLIED':
      default:
        return { bg: '#E0E7FF', text: '#4338CA', label: 'Applied' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.navMyWork} (मेरा काम)</Text>
        <Text style={styles.headerSub}>Manage your active jobs, applications, and assigned sites</Text>

        {/* Tab Controls */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'HIRED' && styles.tabButtonActive]}
            onPress={() => setActiveTab('HIRED')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'HIRED' && styles.tabButtonTextActive]}>
              Active Jobs ({hiredJobs.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'APPLICATIONS' && styles.tabButtonActive]}
            onPress={() => setActiveTab('APPLICATIONS')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'APPLICATIONS' && styles.tabButtonTextActive]}>
              Applications ({applications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'PROJECTS' && styles.tabButtonActive]}
            onPress={() => setActiveTab('PROJECTS')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'PROJECTS' && styles.tabButtonTextActive]}>
              Site Projects ({projects.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* TAB 1: HIRED WORK */}
        {activeTab === 'HIRED' && (
          <View>
            {hiredJobs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 44, marginBottom: 8 }}>💼</Text>
                <Text style={styles.emptyTitle}>No active job right now</Text>
                <Text style={styles.emptySub}>Apply for jobs nearby to get hired by employers.</Text>
                <TouchableOpacity
                  style={styles.findJobsBtn}
                  onPress={() => router.push('/(tabs)/jobs')}
                >
                  <Text style={styles.findJobsBtnText}>Explore Jobs Now →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              hiredJobs.map(item => (
                <View key={item.id} style={styles.workCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.hiredBadge}>
                      <Text style={styles.hiredBadgeText}>✓ HIRED (सक्रिय काम)</Text>
                    </View>
                    <Text style={styles.wageText}>₹{item.dailyWage || 750} / day</Text>
                  </View>

                  <Text style={styles.workTitle}>{item.jobTitle}</Text>
                  <Text style={styles.employerLine}>Employer: {item.employerName || 'Employer'}</Text>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.contactBtn}
                      onPress={() => router.push(`/chat/${item.employerId || 'emp-1'}`)}
                    >
                      <Text style={styles.contactBtnText}>💬 Message Employer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.completeBtn}
                      onPress={() => router.push('/earnings')}
                    >
                      <Text style={styles.completeBtnText}>Earnings Desk</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: ALL APPLICATIONS */}
        {activeTab === 'APPLICATIONS' && (
          <View>
            {applications.map(app => {
              const badge = getStatusBadge(app.status);
              return (
                <View key={app.id} style={styles.appCard}>
                  <View style={styles.appHeader}>
                    <Text style={styles.appJobTitle}>{app.jobTitle}</Text>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                  </View>

                  <Text style={styles.appEmployer}>Employer: {app.employerName}</Text>
                  <Text style={styles.appTime}>Applied: {new Date(app.appliedAt).toLocaleDateString()}</Text>

                  {app.notes ? <Text style={styles.appNotes}>"{app.notes}"</Text> : null}
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 3: CONTRACTOR SITE PROJECTS */}
        {activeTab === 'PROJECTS' && (
          <View>
            {projects.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 44, marginBottom: 8 }}>🏗️</Text>
                <Text style={styles.emptyTitle}>No contractor site assignments</Text>
                <Text style={styles.emptySub}>Contractors will assign you to construction sites directly.</Text>
              </View>
            ) : (
              projects.map(proj => (
                <View key={proj.id} style={styles.projectCard}>
                  <View style={styles.projHeader}>
                    <Text style={styles.projTitle}>{proj.title}</Text>
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>{proj.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.projMeta}>📍 Location: {proj.location}</Text>
                  <Text style={styles.projMeta}>🏢 Client: {proj.clientName}</Text>
                  <Text style={styles.projMeta}>👥 Site Workforce: {proj.assignedWorkersCount} Workers</Text>
                  <Text style={styles.projMeta}>⏱️ Duration: {proj.startDate} - {proj.endDate}</Text>

                  <View style={styles.attendanceBar}>
                    <Text style={styles.attText}>Site Attendance: {proj.attendanceRate}%</Text>
                  </View>
                </View>
              ))
            )}
          </View>
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
    backgroundColor: '#0F172A',
    paddingTop: 45,
    paddingBottom: 16,
    paddingHorizontal: 16,
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
    marginBottom: 14,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: '#F97316',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  workCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hiredBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hiredBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
  },
  wageText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '900',
  },
  workTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  employerLine: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  contactBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  completeBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  completeBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  appCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  appJobTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  appEmployer: {
    fontSize: 13,
    color: '#475569',
  },
  appTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  appNotes: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 6,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  projHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  activePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activePillText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '800',
  },
  projMeta: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 4,
  },
  attendanceBar: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  attText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
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
  findJobsBtn: {
    backgroundColor: '#F97316',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  findJobsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
