import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useContractorState } from '../src/state';
import { apiClient } from '@kaamsetu/api-client';

export default function ContractorRegistrationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string }>();
  const phone = params.phone || '9811002288';
  const { login } = useContractorState();

  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('07AAACS1429B1Z8');
  const [licenseNumber, setLicenseNumber] = useState('LIC-UP-2026-PWD');
  const [city, setCity] = useState('Noida');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim() || !companyName.trim()) {
      Alert.alert('Required', 'Please enter your Full Name and Company Name');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.registerContractor({
        fullName,
        phoneNumber: phone,
        companyName,
        gstNumber,
        licenseNumber,
        city,
      });

      if (res.success && res.contractor) {
        login(res.token, { userId: res.contractor.userId, phoneNumber: phone, role: 'CONTRACTOR' }, res.contractor);
        router.replace('/(tabs)');
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Contractor Registration</Text>
        <Text style={styles.subtitle}>Register your civil contracting / manpower supply firm to manage project workforce</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Contractor / Director Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Vikram Singh"
          placeholderTextColor="#64748B"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Firm / Company Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Shri Ram Infra Projects Pvt Ltd"
          placeholderTextColor="#64748B"
          value={companyName}
          onChangeText={setCompanyName}
        />

        <Text style={styles.label}>GST Registration Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 07AAACS1429B1Z8"
          placeholderTextColor="#64748B"
          value={gstNumber}
          onChangeText={setGstNumber}
        />

        <Text style={styles.label}>PWD / Labour Contractor License</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. LIC-UP-2024-904"
          placeholderTextColor="#64748B"
          value={licenseNumber}
          onChangeText={setLicenseNumber}
        />

        <Text style={styles.label}>Operating City / Hub *</Text>
        <TextInput
          style={styles.input}
          placeholder="Noida / Greater Noida / Delhi"
          placeholderTextColor="#64748B"
          value={city}
          onChangeText={setCity}
        />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Register Firm & Start Managing →</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 18,
  },
  form: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 12,
    height: 46,
  },
  submitBtn: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
