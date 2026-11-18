import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useContractorState } from '../../src/state';

export default function ContractorProfileScreen() {
  const router = useRouter();
  const { t, contractor, logout } = useContractorState();

  const handleLogout = () => {
    logout();
    router.replace('/welcome');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 36 }}>🏗️</Text>
        </View>

        <Text style={styles.name}>{contractor?.companyName || 'Shri Ram Infra & Civil'}</Text>
        <Text style={styles.sub}>{contractor?.fullName} • {contractor?.city || 'Noida'}</Text>

        <View style={styles.gstBadge}>
          <Text style={styles.gstText}>GST: {contractor?.gstNumber || '07AAACS1429B1Z8'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Metric Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Active Sites</Text>
            <Text style={styles.statNum}>{contractor?.activeProjectsCount || 2}</Text>
            <Text style={styles.statSub}>Commercial / Infra</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Workforce</Text>
            <Text style={[styles.statNum, { color: '#059669' }]}>
              {contractor?.totalWorkforceCount || 42}
            </Text>
            <Text style={styles.statSub}>On roster</Text>
          </View>
        </View>

        {/* Contractor Entity Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contractor Firm Details</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Managing Director:</Text>
            <Text style={styles.infoValue}>{contractor?.fullName || 'Vikram Singh'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>GST Registration:</Text>
            <Text style={styles.infoValue}>{contractor?.gstNumber || '07AAACS1429B1Z8'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PWD / Municipal License:</Text>
            <Text style={styles.infoValue}>{contractor?.licenseNumber || 'LIC-UP-2024-904'}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Registered Mobile:</Text>
            <Text style={styles.infoValue}>+91 {contractor?.phoneNumber || '9811002233'}</Text>
          </View>
        </View>

        {/* Action Menu */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/wages')}
          >
            <Text style={styles.menuIcon}>💰</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Wage & Expense Records</Text>
              <Text style={styles.menuSub}>Labour costs, daily disbursements, overtime</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/notifications')}
          >
            <Text style={styles.menuIcon}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Notifications</Text>
              <Text style={styles.menuSub}>Crew check-in alerts</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.menuIcon}>⚙️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Settings & Compliance</Text>
              <Text style={styles.menuSub}>Labour safety policy, export records</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
          >
            <Text style={styles.menuIcon}>🚪</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuTitle, { color: '#EF4444' }]}>Log Out</Text>
              <Text style={styles.menuSub}>Switch account or logout</Text>
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
    backgroundColor: '#0F172A',
    paddingTop: 50,
    paddingBottom: 24,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F97316',
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  gstBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gstText: {
    color: '#F97316',
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
