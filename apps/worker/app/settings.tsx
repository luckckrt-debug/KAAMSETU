import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useWorkerState } from '../src/state';

export default function WorkerSettingsScreen() {
  const router = useRouter();
  const { t, language, setLanguage, logout } = useWorkerState();
  const [jobAlerts, setJobAlerts] = React.useState(true);
  const [paymentSms, setPaymentSms] = React.useState(true);

  const handleLogout = () => {
    logout();
    router.replace('/welcome');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.settings} (सेटिंग्स)</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Language Selection */}
        <Text style={styles.sectionTitle}>App Language (भाषा)</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.langOption, language === 'hi' && styles.langOptionActive]}
            onPress={() => setLanguage('hi')}
          >
            <View>
              <Text style={styles.langName}>हिन्दी (Hindi)</Text>
              <Text style={styles.langSub}>सरल भारतीय इंटरफेस</Text>
            </View>
            {language === 'hi' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langOption, language === 'en' && styles.langOptionActive, { borderBottomWidth: 0 }]}
            onPress={() => setLanguage('en')}
          >
            <View>
              <Text style={styles.langName}>English</Text>
              <Text style={styles.langSub}>Standard English</Text>
            </View>
            {language === 'en' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Instant Job Offer Alerts</Text>
              <Text style={styles.switchSub}>Receive notifications when employers post work nearby</Text>
            </View>
            <Switch value={jobAlerts} onValueChange={setJobAlerts} thumbColor="#F97316" />
          </View>

          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View>
              <Text style={styles.switchLabel}>Wage & Payment Alerts</Text>
              <Text style={styles.switchSub}>SMS & app notifications when earnings are credited</Text>
            </View>
            <Switch value={paymentSms} onValueChange={setPaymentSms} thumbColor="#F97316" />
          </View>
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>DigiWork Worker Support (मजदूर सहायता)</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => Alert.alert('Toll-Free Helpline', '1800-DIGIWORK')}
          >
            <Text style={styles.actionText}>📞 Toll-Free Helpline: 1800-DIGIWORK</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, { borderBottomWidth: 0 }]}
            onPress={() => Alert.alert('Aadhaar Security', 'Your document details are encrypted with 256-bit AES.')}
          >
            <Text style={styles.actionText}>🔒 Privacy & Verification Policy</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Log Out of Account (लॉग आउट)</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>DigiWork Worker v1.0.0 (Android Production)</Text>
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
    fontSize: 16,
    fontWeight: '800',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  langOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  langOptionActive: {
    backgroundColor: '#FFF7ED',
  },
  langName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  langSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: '#F97316',
    fontWeight: '900',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  switchSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    maxWidth: 240,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  arrow: {
    fontSize: 16,
    color: '#CBD5E1',
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },
  versionText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
});
