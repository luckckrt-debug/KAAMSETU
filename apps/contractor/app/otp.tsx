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
import { useContractorState } from '../src/state';
import { apiClient } from '@kaamsetu/api-client';

export default function ContractorOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string }>();
  const phone = params.phone || '9811002233';
  const { login } = useContractorState();
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.verifyOtp(phone, otp, 'CONTRACTOR');
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
        router.replace('/(tabs)');
      }
    } catch (e) {
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

        <Text style={styles.title}>Contractor OTP</Text>
        <Text style={styles.subtitle}>Enter 6-digit security code sent to +91 {phone}</Text>

        <View style={styles.otpBox}>
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

        <View style={styles.testBadge}>
          <Text style={styles.testText}>💡 Test OTP: 123456</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.verifyBtn}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.verifyBtnText}>Verify & Open Console →</Text>
        )}
      </TouchableOpacity>
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
  },
  otpBox: {
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
  testBadge: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  testText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  verifyBtn: {
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
