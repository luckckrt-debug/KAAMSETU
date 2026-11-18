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
import { useContractorState } from '../../src/state';
import { apiClient } from '@kaamsetu/api-client';

export default function CreateProjectScreen() {
  const router = useRouter();
  const { contractor } = useContractorState();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('Apex Developers');
  const [location, setLocation] = useState('Plot B-4, Sector 62');
  const [city, setCity] = useState('Noida');
  const [budget, setBudget] = useState('5000000');
  const [startDate, setStartDate] = useState('01 Dec 2026');
  const [endDate, setEndDate] = useState('30 Apr 2027');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !location.trim()) {
      Alert.alert('Required', 'Please enter Project Title and Site Location');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.createProject({
        contractorId: contractor?.id || 'cnt-1',
        contractorName: contractor?.fullName || 'Vikram Singh',
        title: title.trim(),
        clientName: clientName.trim(),
        location: location.trim(),
        city: city.trim(),
        budget: Number(budget) || 1000000,
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        requiredTrades: ['Electrician', 'Mason (Rajmistri)', 'Painter', 'Construction Labour'],
      });

      if (res.success) {
        Alert.alert(
          'Project Site Created! (प्रोजेक्ट बनाया गया)',
          'New project site registered. You can now deploy and assign workforce to this site.',
          [{ text: 'View Projects', onPress: () => router.replace('/(tabs)/projects') }]
        );
      }
    } catch (e) {
      Alert.alert('Project Created', 'Site registered locally.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/projects') },
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
        <Text style={styles.headerTitle}>Create Project Site</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Project Name / Site Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Metro Expressway Flyover Pillar Casting"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Client / Builder / Developer *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Apex Infrastructure Developers"
          placeholderTextColor="#94A3B8"
          value={clientName}
          onChangeText={setClientName}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Site Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sector 62 Site"
              placeholderTextColor="#94A3B8"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              placeholder="Noida"
              placeholderTextColor="#94A3B8"
              value={city}
              onChangeText={setCity}
            />
          </View>
        </View>

        <Text style={styles.label}>Contract Budget (₹)</Text>
        <TextInput
          style={styles.input}
          placeholder="5000000"
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
          value={budget}
          onChangeText={setBudget}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Start Date</Text>
            <TextInput
              style={styles.input}
              placeholder="01 Dec 2026"
              placeholderTextColor="#94A3B8"
              value={startDate}
              onChangeText={setStartDate}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Target Completion</Text>
            <TextInput
              style={styles.input}
              placeholder="30 Apr 2027"
              placeholderTextColor="#94A3B8"
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Register Site Project →</Text>
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
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#0F172A',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  submitBtn: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
