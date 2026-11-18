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
import { useHiringState } from '../src/state';
import { apiClient } from '@kaamsetu/api-client';

export default function EmployerRegistrationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string }>();
  const phone = params.phone || '9911223399';
  const { login } = useHiringState();

  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('Home & Property Maintenance');
  const [city, setCity] = useState('Noida');
  const [address, setAddress] = useState('Sector 78, Noida');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your Full Name');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.registerEmployer({
        fullName,
        phoneNumber: phone,
        companyName: companyName || `${fullName}'s Business`,
        businessType,
        city,
        address,
      });

      if (res.success && res.employer) {
        login(res.token, { userId: res.employer.userId, phoneNumber: phone, role: 'EMPLOYER' }, res.employer);
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
        <Text style={styles.title}>Employer Account Setup</Text>
        <Text style={styles.subtitle}>Register your details to start posting jobs and hiring local workers</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Your Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Ananya Deshmukh"
          placeholderTextColor="#64748B"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Company / Business Name (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Deshmukh Solutions or Homeowner"
          placeholderTextColor="#64748B"
          value={companyName}
          onChangeText={setCompanyName}
        />

        <Text style={styles.label}>Hiring Category / Business Type</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Homeowner, Retail Shop, Office Renovation"
          placeholderTextColor="#64748B"
          value={businessType}
          onChangeText={setBusinessType}
        />

        <Text style={styles.label}>City *</Text>
        <TextInput
          style={styles.input}
          placeholder="Noida / Delhi / Gurugram"
          placeholderTextColor="#64748B"
          value={city}
          onChangeText={setCity}
        />

        <Text style={styles.label}>Address / Work Locality</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Tower 4, Sector 78, Noida"
          placeholderTextColor="#64748B"
          value={address}
          onChangeText={setAddress}
        />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Complete Setup & Start Hiring →</Text>
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
    backgroundColor: '#1E3A8A',
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
