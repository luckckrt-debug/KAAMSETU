import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useWorkerState } from '../src/state';

export default function WelcomeScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useWorkerState();

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.logoBadge}>
          <Text style={{ fontSize: 44 }}>👷‍♂️</Text>
        </View>

        <Text style={styles.brandTitle}>KAAMSETU</Text>
        <Text style={styles.workerBadge}>WORKER APP (कारीगर / मजदूर)</Text>
        <Text style={styles.tagline}>{t.tagline}</Text>

        <View style={styles.benefitList}>
          <Text style={styles.benefitItem}>✓ Direct work calls from nearby homeowners</Text>
          <Text style={styles.benefitItem}>✓ High daily wages with zero contractor middleman cut</Text>
          <Text style={styles.benefitItem}>✓ Instant earnings withdrawal to your UPI account</Text>
          <Text style={styles.benefitItem}>✓ Verified digital work history and rating profile</Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.langLabel}>{t.selectLanguage}</Text>

        <View style={styles.langRow}>
          <TouchableOpacity
            style={[styles.langCard, language === 'hi' && styles.langCardActive]}
            onPress={() => setLanguage('hi')}
          >
            <Text style={[styles.langCardTitle, language === 'hi' && styles.langCardTitleActive]}>
              हिन्दी
            </Text>
            <Text style={styles.langCardSub}>आसान हिंदी में काम पाएं</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langCard, language === 'en' && styles.langCardActive]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[styles.langCardTitle, language === 'en' && styles.langCardTitleActive]}>
              English
            </Text>
            <Text style={styles.langCardSub}>Find work in English</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.continueBtnText}>
            {language === 'hi' ? 'मोबाइल नंबर से आगे बढ़ें →' : 'Continue with Mobile →'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guestLink}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.guestText}>Explore as Demo Worker</Text>
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
  workerBadge: {
    fontSize: 12,
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
  },
  langLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  langRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  langCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  langCardActive: {
    borderColor: '#F97316',
    backgroundColor: '#292524',
  },
  langCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#94A3B8',
  },
  langCardTitleActive: {
    color: '#F97316',
  },
  langCardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  continueBtn: {
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
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
