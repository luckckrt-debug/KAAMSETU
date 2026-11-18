import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PENDING_PAYOUTS = [
  {
    id: 'pay-201',
    worker: 'Deepak Verma',
    trade: 'AC Technician',
    amount: 1450,
    upi: 'deepak.ac@oksbi',
    jobId: '#JOB-8821',
    time: '20 mins ago'
  },
  {
    id: 'pay-202',
    worker: 'Amit Paswan',
    trade: 'Mason / Mistri',
    amount: 2200,
    upi: 'amit.paswan@paytm',
    jobId: '#JOB-8819',
    time: '1 hour ago'
  },
  {
    id: 'pay-203',
    worker: 'Rajesh Carpenter',
    trade: 'Woodwork Specialist',
    amount: 3800,
    upi: 'rajesh.wood@icici',
    jobId: '#JOB-8805',
    time: '3 hours ago'
  }
];

export default function PayoutsScreen() {
  const [payouts, setPayouts] = useState(PENDING_PAYOUTS);

  const handleDisburse = (id: string, name: string, amt: number) => {
    Alert.alert(
      'Disburse Instant UPI Payout',
      `Approve transfer of ₹${amt} to ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disburse Funds',
          onPress: () => {
            setPayouts(payouts.filter(p => p.id !== id));
            Alert.alert('Transferred', `₹${amt} disbursed successfully via UPI webhook.`);
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>TOTAL PLATFORM ESCROW BALANCE</Text>
        <Text style={styles.summaryAmount}>₹1,84,500.00</Text>
        <Text style={styles.summarySub}>Protected customer funds held for active workforce bookings</Text>
      </View>

      <Text style={styles.sectionTitle}>Pending Worker UPI Withdrawals</Text>

      {payouts.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="checkmark-circle" size={48} color="#10B981" />
          <Text style={styles.emptyTitle}>Zero Pending Payouts</Text>
          <Text style={styles.emptySub}>All completed worker withdrawals have been disbursed.</Text>
        </View>
      ) : (
        payouts.map(p => (
          <View key={p.id} style={styles.payoutCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.workerName}>{p.worker}</Text>
                <Text style={styles.workerTrade}>{p.trade} • {p.jobId}</Text>
                <Text style={styles.upiText}>UPI: {p.upi}</Text>
              </View>
              <Text style={styles.amountText}>₹{p.amount.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.timeText}>{p.time}</Text>
              <TouchableOpacity
                style={styles.disburseBtn}
                onPress={() => handleDisburse(p.id, p.worker, p.amount)}
              >
                <Ionicons name="flash" size={14} color="#FFFFFF" />
                <Text style={styles.disburseBtnText}>Approve & Disburse</Text>
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
  summaryCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#10B98133'
  },
  summaryLabel: { color: '#10B981', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  summaryAmount: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginTop: 6 },
  summarySub: { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  sectionTitle: { color: '#F1F5F9', fontWeight: '800', fontSize: 16, marginBottom: 12 },
  payoutCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  workerName: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  workerTrade: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  upiText: { color: '#64748B', fontSize: 11, fontFamily: 'monospace', marginTop: 4 },
  amountText: { color: '#10B981', fontSize: 20, fontWeight: '900' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#0F172A' },
  timeText: { color: '#64748B', fontSize: 11 },
  disburseBtn: { backgroundColor: '#059669', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, gap: 6 },
  disburseBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 12 },
  emptySub: { color: '#64748B', fontSize: 12, marginTop: 4 }
});
