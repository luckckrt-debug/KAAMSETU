import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useWorkerState } from '../src/state';
import { apiClient } from '@kaamsetu/api-client';

export default function WorkerOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string }>();
  const phone = params.phone || '9876543211';
  const { t, language, login } = useWorkerState();
  const [otp, setOtp] = useState('123456'); // Pre-fill test OTP
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.verifyOtp(phone, otp, 'WORKER');
      if (res.success && res.token) {
        login(res.token, res.user, res.profile);
        if (res.user?.isRegistered && res.profile) {
          router.replace('/(tabs)');
        } else {
          router.replace({
            pathname: '/register',
            params: { phone },
          });
        }
      } else {
        Alert.alert('Error', res.message || 'Invalid OTP code');
      }
    } catch (e: any) {
      // Local fallback for offline testing
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t.enterOtp}</Text>
        <Text style={styles.subtitle}>
          {language === 'hi'
            ? `नंबर +91 ${phone} पर भेजा गया 6 अंकों का कोड दर्ज करें`
            : `Enter 6-digit verification code sent to +91 ${phone}`}
        </Text>

        <View style={styles.otpInputWrapper}>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="123456"
            placeholderTextColor="#64748B"
            autoFocus
          />
        </View>

        <View style={styles.testModeBadge}>
          <Text style={styles.testModeText}>💡 {t.testOtpHint}</Text>
        </View>

        <TouchableOpacity style={styles.resendBtn} onPress={() => Alert.alert('OTP Sent', 'New OTP is 123456')}>
          <Text style={styles.resendText}>{t.resendOtp}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.verifyBtn}
          onPress={handleVerifyOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyBtnText}>{t.verifyOtp} →</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 24,
    paddingTop: 50,
    justifyContent: 'space-between',
  },
  backButton: {
    marginBottom: 20,
  },
  backIcon: {
    color: '#F97316',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 24,
    lineHeight: 18,
  },
  otpInputWrapper: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#F97316',
    paddingHorizontal: 20,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 12,
    textAlign: 'center',
  },
  testModeBadge: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  testModeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  resendBtn: {
    marginTop: 16,
    alignSelf: 'center',
  },
  resendText: {
    color: '#F97316',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomSection: {
    paddingBottom: 20,
  },
  verifyBtn: {
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
