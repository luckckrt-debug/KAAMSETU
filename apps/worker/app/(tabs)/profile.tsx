import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useWorkerState } from '../../src/state';

export default function WorkerProfileScreen() {
  const router = useRouter();
  const { t, worker, language, setLanguage, logout } = useWorkerState();

  const handleLogout = () => {
    logout();
    router.replace('/welcome');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Top Banner */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 36 }}>👷‍♂️</Text>
        </View>

        <Text style={styles.workerName}>{worker?.fullName || 'Rajesh Sharma'}</Text>
        <Text style={styles.workerSkill}>{worker?.skills?.[0] || 'Senior Industrial Electrician'}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedBadgeText}>✓ Aadhaar KYC Verified</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {worker?.ratingAvg || 4.9} ({worker?.ratingCount || 84})</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Rate Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Daily Wage</Text>
            <Text style={styles.statValue}>₹{worker?.expectedDailyWage || 750}</Text>
            <Text style={styles.statSub}>8 hrs shift</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Experience</Text>
            <Text style={styles.statValue}>{worker?.experienceYears || 8} Yrs</Text>
            <Text style={styles.statSub}>Industry verified</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>{worker?.completedJobsCount || 112}</Text>
            <Text style={styles.statSub}>100% on time</Text>
          </View>
        </View>

        {/* Skills & Bio */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Verified Trade Skills (हुनर)</Text>
          <View style={styles.skillsContainer}>
            {worker?.skills.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.cardTitle, { marginTop: 16 }]}>About Me (परिचय)</Text>
          <Text style={styles.bioText}>
            {worker?.bio ||
              'Certified ITI Senior Industrial and Domestic Electrician. Experienced in residential complexes, 3-phase DB dressing, and inverter installation.'}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Preferred Locality:</Text>
            <Text style={styles.infoValue}>{worker?.preferredLocation || 'Sector 62, Indirapuram, Noida'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number:</Text>
            <Text style={styles.infoValue}>+91 {worker?.phoneNumber || '9876543211'}</Text>
          </View>
        </View>

        {/* Action List */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/earnings')}
          >
            <Text style={styles.menuIcon}>💰</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Earnings & Digital Wallet</Text>
              <Text style={styles.menuSub}>Available balance, withdrawals, ledger</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/notifications')}
          >
            <Text style={styles.menuIcon}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Notifications & Alerts</Text>
              <Text style={styles.menuSub}>Job offers and wage updates</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.menuIcon}>⚙️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Language & Settings (सेटिंग्स)</Text>
              <Text style={styles.menuSub}>{language === 'hi' ? 'वर्तमान: हिन्दी' : 'Current: English'}</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
          >
            <Text style={styles.menuIcon}>🚪</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: '#EF4444' }]}>{t.logout} (लॉग आउट)</Text>
              <Text style={styles.menuSub}>Switch account or logout</Text>
            </View>
            <Text style={[styles.menuArrow, { color: '#EF4444' }]}>→</Text>
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
  workerName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  workerSkill: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  verifiedBadgeText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
  },
  ratingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  ratingText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '800',
  },
  content: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 4,
  },
  statSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  sectionCard: {
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
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  skillText: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '700',
  },
  bioText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
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
  menuText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  menuSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 18,
    color: '#CBD5E1',
    fontWeight: '700',
  },
});
