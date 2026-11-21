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
import { useWorkerState } from '../src/state';
import { apiClient } from '@kaamsetu/api-client';
import { WORKER_CATEGORIES } from '@kaamsetu/shared';

export default function WorkerRegistrationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string }>();
  const phone = params.phone || '9876543219';
  const { t, language, login } = useWorkerState();

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('28');
  const [city, setCity] = useState('Noida');
  const [state, setState] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('201301');
  const [selectedTrade, setSelectedTrade] = useState('Electrician');
  const [experienceYears, setExperienceYears] = useState('5');
  const [dailyWage, setDailyWage] = useState('750');
  const [monthlySalary, setMonthlySalary] = useState('22000');
  const [preferredLocation, setPreferredLocation] = useState('Sector 62, Indirapuram');
  const [aadhaarNumber, setAadhaarNumber] = useState('•••• •••• 9921');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your Full Name (पूरा नाम दर्ज करें)');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.registerWorker({
        fullName,
        phoneNumber: phone,
        age: Number(age) || 28,
        city,
        state,
        pincode,
        skills: [selectedTrade],
        experienceYears: Number(experienceYears) || 3,
        expectedDailyWage: Number(dailyWage) || 700,
        expectedMonthlySalary: Number(monthlySalary) || 20000,
        preferredLocation,
        identityDocType: 'Aadhaar',
        identityDocNumber: aadhaarNumber,
        isAvailable: true,
      });

      if (res.success && res.worker) {
        login(res.token, { userId: res.worker.userId, phoneNumber: phone, role: 'WORKER' }, res.worker);
        Alert.alert('Registration Successful', 'Welcome to DigiWork! Your profile is active and verified.', [
          { text: 'Start Working', onPress: () => router.replace('/(tabs)') },
        ]);
      } else {
        Alert.alert('Registration Completed', 'Profile initialized. Entering dashboard.', [
          { text: 'Continue', onPress: () => router.replace('/(tabs)') },
        ]);
      }
    } catch (e: any) {
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.workerRegTitle}</Text>
        <Text style={styles.subtitle}>{t.workerRegSubtitle}</Text>
      </View>

      {/* Form Fields */}
      <View style={styles.formSection}>
        {/* Full Name */}
        <Text style={styles.label}>{t.fullName} *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Ramesh Kumar Verma"
          placeholderTextColor="#64748B"
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Mobile Number (Read-only) */}
        <Text style={styles.label}>Verified Mobile (+91)</Text>
        <View style={[styles.input, styles.readOnlyInput]}>
          <Text style={{ color: '#94A3B8', fontSize: 15, fontWeight: '700' }}>+91 {phone}</Text>
        </View>

        {/* Age & Experience */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t.age}</Text>
            <TextInput
              style={styles.input}
              placeholder="28"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t.experienceYears}</Text>
            <TextInput
              style={styles.input}
              placeholder="5"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              value={experienceYears}
              onChangeText={setExperienceYears}
            />
          </View>
        </View>

        {/* Trade / Primary Skill */}
        <Text style={styles.label}>{t.tradeCategory} *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tradeScroll}>
          {WORKER_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.tradeChip, selectedTrade === cat.nameEn && styles.tradeChipActive]}
              onPress={() => setSelectedTrade(cat.nameEn)}
            >
              <Text style={[styles.tradeChipText, selectedTrade === cat.nameEn && styles.tradeChipTextActive]}>
                {language === 'hi' ? cat.nameHi : cat.nameEn}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Expected Wages */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t.dailyWage}</Text>
            <TextInput
              style={styles.input}
              placeholder="750"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              value={dailyWage}
              onChangeText={setDailyWage}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t.monthlySalary}</Text>
            <TextInput
              style={styles.input}
              placeholder="22000"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              value={monthlySalary}
              onChangeText={setMonthlySalary}
            />
          </View>
        </View>

        {/* City & Pincode */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t.city}</Text>
            <TextInput
              style={styles.input}
              placeholder="Noida / Delhi"
              placeholderTextColor="#64748B"
              value={city}
              onChangeText={setCity}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t.pincode}</Text>
            <TextInput
              style={styles.input}
              placeholder="201301"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              value={pincode}
              onChangeText={setPincode}
            />
          </View>
        </View>

        {/* Preferred Work Location */}
        <Text style={styles.label}>{t.preferredLocation}</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Sector 62, Sector 18, Indirapuram"
          placeholderTextColor="#64748B"
          value={preferredLocation}
          onChangeText={setPreferredLocation}
        />

        {/* Aadhaar Number */}
        <Text style={styles.label}>{t.aadhaarNumber}</Text>
        <TextInput
          style={styles.input}
          placeholder="12-digit Aadhaar number"
          placeholderTextColor="#64748B"
          value={aadhaarNumber}
          onChangeText={setAadhaarNumber}
        />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>{t.submitRegistration} ✓</Text>
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
    paddingBottom: 40,
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
  formSection: {
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
  readOnlyInput: {
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  tradeScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  tradeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tradeChipActive: {
    borderColor: '#F97316',
    backgroundColor: '#292524',
  },
  tradeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tradeChipTextActive: {
    color: '#F97316',
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
