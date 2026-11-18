import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PENDING_WORKERS = [
  {
    id: 'w-101',
    name: 'Ramesh Sharma',
    trade: 'Electrician',
    city: 'Patna, Bihar',
    aadhaar: 'XXXX-XXXX-9182',
    date: 'Today, 10:30 AM',
    status: 'PENDING'
  },
  {
    id: 'w-102',
    name: 'Suraj Kumar',
    trade: 'Plumber',
    city: 'Ranchi, Jharkhand',
    aadhaar: 'XXXX-XXXX-4421',
    date: 'Yesterday, 4:15 PM',
    status: 'PENDING'
  },
  {
    id: 'w-103',
    name: 'Mohammed Aslam',
    trade: 'Carpenter & Furniture',
    city: 'Varanasi, UP',
    aadhaar: 'XXXX-XXXX-7729',
    date: '17 Nov 2026',
    status: 'PENDING'
  }
];

export default function VerificationsScreen() {
  const [workers, setWorkers] = useState(PENDING_WORKERS);

  const handleAction = (id: string, action: 'APPROVE' | 'REJECT') => {
    Alert.alert(
      action === 'APPROVE' ? 'Approve Worker KYC' : 'Reject Worker KYC',
      `Are you sure you want to ${action.toLowerCase()} this worker?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setWorkers(workers.filter(w => w.id !== id));
            Alert.alert('Success', `Worker ${action === 'APPROVE' ? 'Verified' : 'Rejected'} successfully.`);
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <Ionicons name="shield-checkmark" size={24} color="#10B981" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.bannerTitle}>Aadhaar & Police Verification</Text>
          <Text style={styles.bannerSub}>{workers.length} workers awaiting identity approval.</Text>
        </View>
      </View>

      {workers.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="checkmark-done-circle" size={48} color="#10B981" />
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptySub}>No pending KYC verifications in the queue.</Text>
        </View>
      ) : (
        workers.map(w => (
          <View key={w.id} style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.workerName}>{w.name}</Text>
                <Text style={styles.workerTrade}>{w.trade} • {w.city}</Text>
                <Text style={styles.workerAadhaar}>Aadhaar: {w.aadhaar}</Text>
              </View>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btn, styles.rejectBtn]}
                onPress={() => handleAction(w.id, 'REJECT')}
              >
                <Ionicons name="close" size={16} color="#EF4444" />
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.approveBtn]}
                onPress={() => handleAction(w.id, 'APPROVE')}
              >
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                <Text style={styles.approveText}>Approve KYC</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120' },
  content: { padding: 16, paddingBottom: 40 },
  banner: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  bannerTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  bannerSub: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  workerName: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  workerTrade: { color: '#FF6B00', fontSize: 12, fontWeight: '700', marginTop: 2 },
  workerAadhaar: { color: '#64748B', fontSize: 11, fontFamily: 'monospace', marginTop: 4 },
  pendingBadge: { backgroundColor: '#F59E0B22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pendingText: { color: '#F59E0B', fontSize: 10, fontWeight: '800' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#0F172A' },
  btn: { flex: 1, height: 40, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  rejectBtn: { backgroundColor: '#EF44441A', borderWidth: 1, borderColor: '#EF444433' },
  rejectText: { color: '#EF4444', fontWeight: '700', fontSize: 12 },
  approveBtn: { backgroundColor: '#10B981' },
  approveText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 12 },
  emptySub: { color: '#64748B', fontSize: 12, marginTop: 4 }
});
