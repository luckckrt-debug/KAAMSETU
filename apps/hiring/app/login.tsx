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
import { apiClient } from '@kaamsetu/api-client';

export default function EmployerLoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('9911223344');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      await apiClient.sendOtp(phoneNumber);
      router.push({
        pathname: '/otp',
        params: { phone: phoneNumber },
      });
    } catch (e) {
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
      <View>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Employer Login</Text>
        <Text style={styles.subtitle}>Enter your registered mobile number to manage jobs and hire workers</Text>

        <View style={styles.inputContainer}>
          <View style={styles.countryCode}>
            <Text style={{ fontSize: 18 }}>🇮🇳</Text>
            <Text style={styles.codeText}>+91</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="99112 23344"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            maxLength={10}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        <View style={styles.testHintBox}>
          <Text style={styles.testHintTitle}>💡 Demo Employer Account:</Text>
          <Text style={styles.testHintText}>
            Phone: 9911223344 (Ananya Deshmukh){'\n'}
            Test OTP: 123456
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSendOtp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitBtnText}>Get OTP Verification Code →</Text>
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
    color: '#60A5FA',
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
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  testHintTitle: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  testHintText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
  },
  submitBtn: {
    backgroundColor: '#1E3A8A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
