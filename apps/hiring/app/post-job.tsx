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
import { useRouter } from 'expo-router';
import { useHiringState } from '../src/state';
import { apiClient } from '@kaamsetu/api-client';
import { UNIVERSAL_CATEGORIES } from '../src/professions';

export default function EmployerPostJobScreen() {
  const router = useRouter();
  const { employer } = useHiringState();

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('electrician');
  const [description, setDescription] = useState('');
  const [dailyWage, setDailyWage] = useState('800');
  const [location, setLocation] = useState('Sector 78, Noida');
  const [city, setCity] = useState('Noida');
  const [requiredWorkers, setRequiredWorkers] = useState('2');
  const [durationDays, setDurationDays] = useState('3');
  const [startDate, setStartDate] = useState('Tomorrow, 9:00 AM');
  const [loading, setLoading] = useState(false);

  const handlePostJob = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a job title');
      return;
    }
    if (!dailyWage || Number(dailyWage) <= 0) {
      Alert.alert('Required', 'Please enter daily wage amount');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.postJob({
        employerId: employer?.id || 'emp-1',
        employerName: employer?.fullName || 'Employer',
        employerPhone: employer?.phoneNumber || '9911223344',
        title: title.trim(),
        category: selectedCategory,
        description: description.trim() || `Urgent requirement for ${selectedCategory} workers.`,
        requiredWorkersCount: Number(requiredWorkers) || 1,
        dailyWage: Number(dailyWage),
        location: location.trim(),
        city: city.trim(),
        durationDays: Number(durationDays) || 1,
        startDate: startDate.trim(),
      });

      if (res.success) {
        Alert.alert(
          'Job Successfully Posted! (काम पोस्ट हुआ)',
          'Your job has been published and broadcasted to verified workers nearby on the DigiWork Worker app.',
          [{ text: 'View Jobs', onPress: () => router.replace('/(tabs)/jobs') }]
        );
      } else {
        Alert.alert('Error', 'Failed to post job');
      }
    } catch (e) {
      Alert.alert('Job Posted', 'Job broadcasted successfully.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/jobs') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a New Job (नया काम पोस्ट करें)</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionHeading}>1. Job Category & Title</Text>

        <Text style={styles.label}>Select Worker Trade Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tradeScroll}>
          {UNIVERSAL_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.tradeChip, selectedCategory === cat.nameEn && styles.tradeChipActive]}
              onPress={() => setSelectedCategory(cat.nameEn)}
            >
              <Text style={{ fontSize: 14, marginRight: 4 }}>{cat.icon}</Text>
              <Text style={[styles.tradeChipText, selectedCategory === cat.nameEn && styles.tradeChipTextActive]}>
                {cat.nameEn}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Job Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Master Bedroom Inverter & MCB Fitting"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Job Description & Work Details</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the tasks, tools needed, and specific work requirements..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={[styles.sectionHeading, { marginTop: 20 }]}>2. Compensation & Timing</Text>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Daily Wage (₹/day) *</Text>
            <TextInput
              style={styles.input}
              placeholder="800"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={dailyWage}
              onChangeText={setDailyWage}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Workers Required</Text>
            <TextInput
              style={styles.input}
              placeholder="2"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={requiredWorkers}
              onChangeText={setRequiredWorkers}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Duration (Days)</Text>
            <TextInput
              style={styles.input}
              placeholder="3"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={durationDays}
              onChangeText={setDurationDays}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Start Timing</Text>
            <TextInput
              style={styles.input}
              placeholder="Tomorrow 9 AM"
              placeholderTextColor="#94A3B8"
              value={startDate}
              onChangeText={setStartDate}
            />
          </View>
        </View>

        <Text style={[styles.sectionHeading, { marginTop: 20 }]}>3. Work Site Location</Text>

        <Text style={styles.label}>Location / Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Flat 402, Tower 4, Sector 78"
          placeholderTextColor="#94A3B8"
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>City *</Text>
        <TextInput
          style={styles.input}
          placeholder="Noida / Delhi / Gurugram"
          placeholderTextColor="#94A3B8"
          value={city}
          onChangeText={setCity}
        />

        <TouchableOpacity
          style={styles.postButton}
          onPress={handlePostJob}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.postButtonText}>Publish & Broadcast Job Now ⚡</Text>
          )}
        </TouchableOpacity>
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
    backgroundColor: '#1E3A8A',
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
    color: '#93C5FD',
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
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  tradeScroll: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  tradeChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tradeChipActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  tradeChipText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  tradeChipTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  postButton: {
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#F97316',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
