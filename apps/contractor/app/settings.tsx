import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useContractorState } from '../src/state';

export default function ContractorSettingsScreen() {
  const router = useRouter();
  const { contractor, language, setLanguage, logout } = useContractorState();

  const handleCallSupport = () => {
    Linking.openURL('tel:18001235226');
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Sign Out (लॉग आउट)',
      'Are you sure you want to sign out of your contractor account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contractor Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Firm Profile Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>REGISTERED ENTERPRISE</Text>
          <Text style={styles.firmName}>{contractor?.companyName || 'Apex Infra Buildcon Pvt Ltd'}</Text>
          <Text style={styles.firmDetail}>Owner: {contractor?.fullName || 'Vikramaditya Singhania'}</Text>
          <Text style={styles.firmDetail}>GSTIN: {contractor?.gstNumber || '07AAAAA0000A1Z5'}</Text>
          <Text style={styles.firmDetail}>License: {contractor?.licenseNumber || 'LIC-DL-2024-904'}</Text>
          <Text style={styles.firmDetail}>Location: {contractor?.city || 'Noida'}, Delhi NCR</Text>
        </View>

        {/* App Preferences */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>APP PREFERENCES</Text>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>Language (भाषा)</Text>
              <Text style={styles.rowSub}>Current: {language === 'hi' ? 'हिंदी (Hindi)' : 'English'}</Text>
            </View>
            <TouchableOpacity
              style={styles.langPill}
              onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            >
              <Text style={styles.langPillText}>
                {language === 'en' ? 'Switch to हिंदी' : 'Switch to English'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>Muster Roll Reminders</Text>
              <Text style={styles.rowSub}>Daily alert at 09:30 AM to log site attendance</Text>
            </View>
            <Switch value={true} trackColor={{ false: '#CBD5E1', true: '#10B981' }} />
          </View>
        </View>

        {/* Compliance & Legal */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>COMPLIANCE & STATUTORY</Text>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Labour License Verified', 'Central Labour License CLRA/2024/DEL-9081 valid till Dec 2027.')}
          >
            <Text style={styles.menuTitle}>Labour Commissioner License (CLRA)</Text>
            <Text style={styles.menuSubActive}>✓ Verified</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('EPFO / ESIC', 'PF Sub-code DL/CPM/008789 linked with 42 enrolled active workers.')}
          >
            <Text style={styles.menuTitle}>EPFO / ESIC Employer Registration</Text>
            <Text style={styles.menuSubActive}>✓ Linked</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Terms of Service', 'Standard KaamSetu Contractor & Labour Marketplace Terms.')}
          >
            <Text style={styles.menuTitle}>KaamSetu Contractor T&C</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Help & Support */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>SUPPORT & HELPLINE</Text>
          <TouchableOpacity style={styles.menuRow} onPress={handleCallSupport}>
            <View>
              <Text style={styles.menuTitle}>Contractor Key Account Desk</Text>
              <Text style={styles.menuSub}>Toll-Free: 1800-123-KAAM (9 AM - 8 PM)</Text>
            </View>
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        </View>

        {/* Version & Logout */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>KaamSetu Contractor v1.0.0 (Build 100)</Text>
          <Text style={styles.versionSub}>Package: com.kaamsetu.contractor</Text>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Sign Out (लॉग आउट)</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 17,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  firmName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  firmDetail: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  rowSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  langPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  langPillText: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  menuSubActive: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '700',
  },
  menuArrow: {
    fontSize: 18,
    color: '#94A3B8',
  },
  callIcon: {
    fontSize: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  versionText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  versionSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
});
