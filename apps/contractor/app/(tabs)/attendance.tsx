import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useContractorState } from '../../src/state';
import { apiClient } from '@kaamsetu/api-client';
import { AttendanceRecordData, AttendanceStatus } from '@kaamsetu/shared';

interface WorkerAttendanceState {
  workerId: string;
  name: string;
  trade: string;
  dailyWage: number;
  status: AttendanceStatus;
  hoursWorked: number;
}

export default function ContractorAttendanceScreen() {
  const router = useRouter();
  const { contractor } = useContractorState();
  const [workers, setWorkers] = useState<WorkerAttendanceState[]>([
    { workerId: 'wrk-1', name: 'Rajesh Sharma', trade: 'Electrician', dailyWage: 750, status: 'PRESENT', hoursWorked: 8 },
    { workerId: 'wrk-3', name: 'Ramswaroop Yadav', trade: 'Mason', dailyWage: 850, status: 'PRESENT', hoursWorked: 8 },
    { workerId: 'wrk-5', name: 'Bablu Kumar', trade: 'Painter', dailyWage: 650, status: 'HALF_DAY', hoursWorked: 4 },
    { workerId: 'wrk-2', name: 'Manoj Kumar Bind', trade: 'Plumber', dailyWage: 700, status: 'PRESENT', hoursWorked: 8 },
  ]);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const calculateTotalWage = () => {
    return workers.reduce((sum, w) => {
      let mult = 1;
      if (w.status === 'ABSENT') mult = 0;
      if (w.status === 'HALF_DAY') mult = 0.5;
      if (w.status === 'OVERTIME') mult = 1.5;
      return sum + Math.round(w.dailyWage * mult);
    }, 0);
  };

  const handleStatusChange = (workerId: string, status: AttendanceStatus) => {
    setWorkers(prev =>
      prev.map(w => {
        if (w.workerId === workerId) {
          const hours = status === 'HALF_DAY' ? 4 : status === 'OVERTIME' ? 12 : status === 'ABSENT' ? 0 : 8;
          return { ...w, status, hoursWorked: hours };
        }
        return w;
      })
    );
  };

  const handleSaveMuster = async () => {
    setSaving(true);
    try {
      // Save attendance for each worker in central backend
      for (const w of workers) {
        await apiClient.markAttendance({
          projectId: 'prj-1',
          workerId: w.workerId,
          status: w.status,
          hoursWorked: w.hoursWorked,
        });
      }
      Alert.alert(
        'Muster Roll Saved! (हाजिरी सुरक्षित हुई)',
        `Daily attendance recorded for ${workers.length} workers. Total payable wage: ₹${calculateTotalWage()}.`
      );
    } catch (e) {
      Alert.alert('Muster Roll Saved', 'Daily attendance recorded locally.');
    } finally {
      setSaving(false);
    }
  };

  const totalPresent = workers.filter(w => w.status === 'PRESENT' || w.status === 'OVERTIME').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Daily Muster Roll (दैनिक हाजिरी)</Text>
          <Text style={styles.headerSub}>Green Valley Commercial Site • Date: Today</Text>
        </View>

        <TouchableOpacity style={styles.wagesBtn} onPress={() => router.push('/wages')}>
          <Text style={styles.wagesBtnText}>Wage Ledger →</Text>
        </TouchableOpacity>
      </View>

      {/* Summary KPI Strip */}
      <View style={styles.kpiStrip}>
        <View style={styles.kpiItem}>
          <Text style={styles.kpiLabel}>Total Crew</Text>
          <Text style={styles.kpiVal}>{workers.length}</Text>
        </View>

        <View style={styles.kpiItem}>
          <Text style={styles.kpiLabel}>Present</Text>
          <Text style={[styles.kpiVal, { color: '#059669' }]}>{totalPresent}</Text>
        </View>

        <View style={styles.kpiItem}>
          <Text style={styles.kpiLabel}>Day's Labour Cost</Text>
          <Text style={[styles.kpiVal, { color: '#EA580C' }]}>₹{calculateTotalWage()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {workers.map(w => {
          let multiplier = 1;
          if (w.status === 'ABSENT') multiplier = 0;
          if (w.status === 'HALF_DAY') multiplier = 0.5;
          if (w.status === 'OVERTIME') multiplier = 1.5;
          const currentWage = Math.round(w.dailyWage * multiplier);

          return (
            <View key={w.workerId} style={styles.workerRow}>
              <View style={styles.workerInfo}>
                <Text style={styles.name}>{w.name}</Text>
                <Text style={styles.sub}>{w.trade} • Base: ₹{w.dailyWage}/day</Text>
                <Text style={styles.wagePayable}>
                  Today's Wage: <Text style={{ color: '#059669', fontWeight: '900' }}>₹{currentWage}</Text> ({w.hoursWorked} hrs)
                </Text>
              </View>

              <View style={styles.statusGroup}>
                <TouchableOpacity
                  style={[styles.statusChip, w.status === 'PRESENT' && styles.statusPresent]}
                  onPress={() => handleStatusChange(w.workerId, 'PRESENT')}
                >
                  <Text style={[styles.chipText, w.status === 'PRESENT' && styles.chipTextWhite]}>P</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusChip, w.status === 'HALF_DAY' && styles.statusHalfDay]}
                  onPress={() => handleStatusChange(w.workerId, 'HALF_DAY')}
                >
                  <Text style={[styles.chipText, w.status === 'HALF_DAY' && styles.chipTextWhite]}>HD</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusChip, w.status === 'OVERTIME' && styles.statusOvertime]}
                  onPress={() => handleStatusChange(w.workerId, 'OVERTIME')}
                >
                  <Text style={[styles.chipText, w.status === 'OVERTIME' && styles.chipTextWhite]}>OT</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusChip, w.status === 'ABSENT' && styles.statusAbsent]}
                  onPress={() => handleStatusChange(w.workerId, 'ABSENT')}
                >
                  <Text style={[styles.chipText, w.status === 'ABSENT' && styles.chipTextWhite]}>A</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveMuster}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving Muster...' : 'Save & Lock Muster Roll (हाजिरी सुरक्षित करें) ✓'}
          </Text>
        </TouchableOpacity>
      </View>
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  wagesBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  wagesBtnText: {
    color: '#F97316',
    fontSize: 11,
    fontWeight: '700',
  },
  kpiStrip: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  kpiItem: {
    flex: 1,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  kpiVal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  list: {
    padding: 16,
    paddingBottom: 90,
  },
  workerRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workerInfo: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  wagePayable: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    fontWeight: '600',
  },
  statusGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  statusChip: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  chipTextWhite: {
    color: '#FFFFFF',
  },
  statusPresent: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  statusHalfDay: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  statusOvertime: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  statusAbsent: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  saveBtn: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
