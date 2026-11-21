import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ContractorWelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.logoBadge}>
          <Text style={{ fontSize: 44 }}>🏗️</Text>
        </View>

        <Text style={styles.brandTitle}>DIGIWORK</Text>
        <Text style={styles.contractorBadge}>CONTRACTOR & BUILDER APP</Text>
        <Text style={styles.tagline}>Civil Construction, Infra & Workforce Operations</Text>

        <View style={styles.benefitList}>
          <Text style={styles.benefitItem}>✓ Bulk hire skilled tradespeople & labour crews</Text>
          <Text style={styles.benefitItem}>✓ Multi-site project management & workforce allocation</Text>
          <Text style={styles.benefitItem}>✓ Daily digital muster roll attendance tracking</Text>
          <Text style={styles.benefitItem}>✓ Real-time labour wage calculations and expense ledgers</Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.continueBtnText}>Continue with Mobile Number →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guestLink}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.guestText}>Explore as Demo Contractor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
  },
  topSection: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  contractorBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F97316',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 6,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 10,
    textAlign: 'center',
  },
  benefitList: {
    marginTop: 28,
    alignSelf: 'stretch',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  benefitItem: {
    fontSize: 13,
    color: '#F1F5F9',
    fontWeight: '600',
  },
  bottomSection: {
    width: '100%',
    paddingBottom: 20,
  },
  continueBtn: {
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  guestLink: {
    marginTop: 14,
    alignItems: 'center',
  },
  guestText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
});
