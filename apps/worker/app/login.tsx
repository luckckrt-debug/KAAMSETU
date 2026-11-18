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
import { useRouter } from 'expo-router';
import { useWorkerState } from '../src/state';
import { apiClient } from '@kaamsetu/api-client';

export default function WorkerLoginScreen() {
  const router = useRouter();
  const { t, language } = useWorkerState();
  const [phoneNumber, setPhoneNumber] = useState('9876543211'); // Pre-fill sample worker
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.sendOtp(phoneNumber);
      if (res.success) {
        router.push({
          pathname: '/otp',
          params: { phone: phoneNumber },
        });
      } else {
        Alert.alert('Error', res.message || 'Failed to send OTP');
      }
    } catch (e: any) {
      // Offline fallback: navigate with phone
      router.push({
        pathname: '/otp',
        params: { phone: phoneNumber },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t.enterPhone}</Text>
        <Text style={styles.subtitle}>
          {language === 'hi'
            ? 'हम आपके मोबाइल नंबर पर 6 अंकों का ओटीपी भेजेंगे'
            : 'We will send a 6-digit OTP verification code to your phone'}
        </Text>

        <View style={styles.inputContainer}>
          <View style={styles.countryCode}>
            <Text style={styles.flag}>🇮🇳</Text>
            <Text style={styles.codeText}>+91</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="98765 43210"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            maxLength={10}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        <View style={styles.testHintBox}>
          <Text style={styles.testHintTitle}>💡 Demo / Testing Access:</Text>
          <Text style={styles.testHintText}>
            Pre-registered worker phone: 9876543211{'\n'}
            New worker registration: Enter any 10-digit number
          </Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSendOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>{t.sendOtp} →</Text>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#334155',
    paddingHorizontal: 14,
    height: 56,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#334155',
    gap: 6,
  },
  flag: {
    fontSize: 18,
  },
  codeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    paddingLeft: 14,
    letterSpacing: 1.5,
  },
  testHintBox: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  testHintTitle: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  testHintText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
  },
  bottomSection: {
    paddingBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
