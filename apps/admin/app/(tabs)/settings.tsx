import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminSettingsScreen() {
  const [autoApprove, setAutoApprove] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.adminName}>Super Administrator</Text>
          <Text style={styles.adminEmail}>admin@kaamsetu.in • Root Access</Text>
          <View style={styles.activeTag}>
            <Text style={styles.activeText}>Active Session</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Central Server & Architecture</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Central API Endpoint</Text>
          <Text style={styles.val}>http://10.10.31.251:5000</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Database Engine</Text>
          <Text style={styles.val}>PostgreSQL / Prisma ORM</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Real-time Engine</Text>
          <Text style={styles.val}>Socket.IO WebSockets</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Platform Commission</Text>
          <Text style={styles.val}>10% Flat on Completed Jobs</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Administrative Controls</Text>

      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Instant Push Notifications</Text>
            <Text style={styles.switchSub}>Alert when new worker registers or dispute is raised</Text>
          </View>
          <Switch value={pushAlerts} onValueChange={setPushAlerts} thumbColor="#FF6B00" />
        </View>

        <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: '#0F172A', paddingTop: 14 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Automated KYC Document Verification</Text>
            <Text style={styles.switchSub}>Verify Aadhaar OCR automatically</Text>
          </View>
          <Switch value={autoApprove} onValueChange={setAutoApprove} thumbColor="#FF6B00" />
        </View>
      </View>

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => Alert.alert('Cache Cleared', 'System cache and temporary tables cleared.')}
      >
        <Ionicons name="refresh" size={18} color="#FFFFFF" />
        <Text style={styles.actionBtnText}>Purge Central Temporary Cache</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120' },
  content: { padding: 16, paddingBottom: 40 },
  profileBox: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  adminName: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  adminEmail: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  activeTag: {
    backgroundColor: '#10B98122',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6
  },
  activeText: { color: '#10B981', fontSize: 10, fontWeight: '800' },
  sectionTitle: { color: '#F1F5F9', fontWeight: '800', fontSize: 16, marginBottom: 12, marginTop: 10 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { color: '#94A3B8', fontSize: 12 },
  val: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  switchLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  switchSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  actionBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 10
  },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 }
});
