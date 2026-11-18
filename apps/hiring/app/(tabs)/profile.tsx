import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHiringState } from '../../src/state';

export default function EmployerProfileScreen() {
  const router = useRouter();
  const { t, employer, logout } = useHiringState();

  const handleLogout = () => {
    logout();
    router.replace('/welcome');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 36 }}>🏢</Text>
        </View>

        <Text style={styles.name}>{employer?.companyName || 'Deshmukh Home Services'}</Text>
        <Text style={styles.sub}>{employer?.fullName} • {employer?.city || 'Noida'}</Text>

        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Verified KaamSetu Employer</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Hiring Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Jobs Posted</Text>
            <Text style={styles.statNum}>{employer?.postedJobsCount || 4}</Text>
            <Text style={styles.statSub}>Total vacancies</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Workers Hired</Text>
            <Text style={[styles.statNum, { color: '#059669' }]}>
              {employer?.totalHiresCount || 5}
            </Text>
            <Text style={styles.statSub}>Verified hires</Text>
          </View>
        </View>

        {/* Company Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hiring Entity Profile</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact Person:</Text>
            <Text style={styles.infoValue}>{employer?.fullName || 'Ananya Deshmukh'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Business Type:</Text>
            <Text style={styles.infoValue}>{employer?.businessType || 'Residential & Commercial Hiring'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registered Mobile:</Text>
            <Text style={styles.infoValue}>+91 {employer?.phoneNumber || '9911223344'}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Office / Site Address:</Text>
            <Text style={styles.infoValue}>{employer?.address || 'Sector 78, Noida'}</Text>
          </View>
        </View>

        {/* Action Menu */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/post-job')}
          >
            <Text style={styles.menuIcon}>➕</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Post a New Job</Text>
              <Text style={styles.menuSub}>Find electricians, plumbers, and carpenters</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/notifications')}
          >
            <Text style={styles.menuIcon}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Notifications & Alerts</Text>
              <Text style={styles.menuSub}>Applicant alerts and messages</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.menuIcon}>⚙️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Settings & Language</Text>
              <Text style={styles.menuSub}>Change language, privacy policy</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
          >
            <Text style={styles.menuIcon}>🚪</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuTitle, { color: '#EF4444' }]}>{t.logout}</Text>
              <Text style={styles.menuSub}>Switch to Worker or Contractor App</Text>
            </View>
            <Text style={[styles.arrow, { color: '#EF4444' }]}>→</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 50,
    paddingBottom: 24,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#172554',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#93C5FD',
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    color: '#93C5FD',
    marginTop: 4,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 8,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  content: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 4,
  },
  statSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  menuSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: '#CBD5E1',
    fontWeight: '700',
  },
});
