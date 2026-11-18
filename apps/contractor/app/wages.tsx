import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useContractorState } from '../src/state';

interface WorkerWageRecord {
  id: string;
  name: string;
  trade: string;
  daysPresent: number;
  halfDays: number;
  otHours: number;
  dailyRate: number;
  grossAmount: number;
  advanceDeduction: number;
  netPayable: number;
  status: 'PAID' | 'PENDING';
  upiId?: string;
}

export default function ContractorWagesScreen() {
  const router = useRouter();
  const { contractor } = useContractorState();

  const [wageRecords, setWageRecords] = useState<WorkerWageRecord[]>([
    {
      id: 'wrk-1',
      name: 'Rajesh Sharma',
      trade: 'Electrician',
      daysPresent: 24,
      halfDays: 1,
      otHours: 16,
      dailyRate: 750,
      grossAmount: 19875,
      advanceDeduction: 2000,
      netPayable: 17875,
      status: 'PENDING',
      upiId: 'rajesh.sharma@okaxis',
    },
    {
      id: 'wrk-3',
      name: 'Ramswaroop Yadav',
      trade: 'Mason',
      daysPresent: 26,
      halfDays: 0,
      otHours: 8,
      dailyRate: 850,
      grossAmount: 22950,
      advanceDeduction: 1500,
      netPayable: 21450,
      status: 'PAID',
      upiId: 'ramswaroop@ybl',
    },
    {
      id: 'wrk-2',
      name: 'Manoj Kumar Bind',
      trade: 'Plumber',
      daysPresent: 22,
      halfDays: 2,
      otHours: 4,
      dailyRate: 700,
      grossAmount: 16450,
      advanceDeduction: 1000,
      netPayable: 15450,
      status: 'PENDING',
      upiId: 'manoj.bind@paytm',
    },
    {
      id: 'wrk-5',
      name: 'Bablu Kumar',
      trade: 'Painter',
      daysPresent: 20,
      halfDays: 3,
      otHours: 0,
      dailyRate: 650,
      grossAmount: 13975,
      advanceDeduction: 500,
      netPayable: 13475,
      status: 'PENDING',
      upiId: 'bablu99@oksbi',
    },
    {
      id: 'wrk-6',
      name: 'Vikram Singh',
      trade: 'Welder',
      daysPresent: 25,
      halfDays: 0,
      otHours: 20,
      dailyRate: 900,
      grossAmount: 24750,
      advanceDeduction: 3000,
      netPayable: 21750,
      status: 'PAID',
      upiId: 'vikram.singh@icici',
    },
  ]);

  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'NEFT' | 'CASH'>('UPI');

  const totalGross = wageRecords.reduce((sum, r) => sum + r.grossAmount, 0);
  const totalNet = wageRecords.reduce((sum, r) => sum + r.netPayable, 0);
  const totalPending = wageRecords.filter(r => r.status === 'PENDING').reduce((sum, r) => sum + r.netPayable, 0);
  const totalPaid = wageRecords.filter(r => r.status === 'PAID').reduce((sum, r) => sum + r.netPayable, 0);

  const displayedRecords = wageRecords.filter(r => {
    if (filter === 'PENDING') return r.status === 'PENDING';
    if (filter === 'PAID') return r.status === 'PAID';
    return true;
  });

  const handlePayAllPending = () => {
    setWageRecords(prev =>
      prev.map(r => ({
        ...r,
        status: 'PAID',
      }))
    );
    setShowPayModal(false);
    Alert.alert(
      'Disbursement Initiated (भुगतान सफल)',
      `₹${totalPending.toLocaleString('en-IN')} has been disbursed via ${selectedMethod} batch processing to ${wageRecords.filter(r => r.status === 'PENDING').length} workers.`
    );
  };

  const handlePaySingle = (record: WorkerWageRecord) => {
    Alert.alert(
      'Confirm Wage Payout',
      `Pay ₹${record.netPayable.toLocaleString('en-IN')} to ${record.name} (${record.upiId || 'Bank Account'})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: () => {
            setWageRecords(prev =>
              prev.map(r => (r.id === record.id ? { ...r, status: 'PAID' } : r))
            );
            Alert.alert('Payment Successful', `Transferred ₹${record.netPayable} to ${record.name}`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wage Ledger (मजदूरी हिसाब)</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('Report Exported', 'Muster Wage Sheet PDF generated and saved to device.')}
        >
          <Text style={styles.exportText}>📥 Export</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* KPI Summary Card */}
        <View style={styles.kpiCard}>
          <Text style={styles.kpiCardTitle}>MONTHLY PAYROLL SUMMARY (मई 2026)</Text>
          <View style={styles.kpiRow}>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiItemLabel}>Total Gross</Text>
              <Text style={styles.kpiItemVal}>₹{totalGross.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiItemLabel}>Pending Payout</Text>
              <Text style={[styles.kpiItemVal, { color: '#EA580C' }]}>₹{totalPending.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiItemLabel}>Disbursed</Text>
              <Text style={[styles.kpiItemVal, { color: '#059669' }]}>₹{totalPaid.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'ALL' && styles.filterBtnActive]}
            onPress={() => setFilter('ALL')}
          >
            <Text style={[styles.filterBtnText, filter === 'ALL' && styles.filterBtnTextActive]}>
              All ({wageRecords.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'PENDING' && styles.filterBtnActive]}
            onPress={() => setFilter('PENDING')}
          >
            <Text style={[styles.filterBtnText, filter === 'PENDING' && styles.filterBtnTextActive]}>
              Pending ({wageRecords.filter(r => r.status === 'PENDING').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'PAID' && styles.filterBtnActive]}
            onPress={() => setFilter('PAID')}
          >
            <Text style={[styles.filterBtnText, filter === 'PAID' && styles.filterBtnTextActive]}>
              Paid ({wageRecords.filter(r => r.status === 'PAID').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Batch Payout Action Button */}
        {totalPending > 0 && (
          <TouchableOpacity style={styles.batchPayBtn} onPress={() => setShowPayModal(true)}>
            <Text style={styles.batchPayBtnText}>
              ⚡ Pay All Pending Wages (₹{totalPending.toLocaleString('en-IN')})
            </Text>
          </TouchableOpacity>
        )}

        {/* Worker Wage List */}
        <Text style={styles.sectionHeading}>Worker Breakdown</Text>
        {displayedRecords.map(r => (
          <View key={r.id} style={styles.wageCard}>
            <View style={styles.wageHeader}>
              <View>
                <Text style={styles.workerName}>{r.name}</Text>
                <Text style={styles.workerTrade}>{r.trade} • ₹{r.dailyRate}/day</Text>
              </View>
              <View style={[styles.statusBadge, r.status === 'PAID' ? styles.badgePaid : styles.badgePending]}>
                <Text style={[styles.statusText, r.status === 'PAID' ? styles.statusPaidText : styles.statusPendingText]}>
                  {r.status === 'PAID' ? '✓ PAID' : '⏳ PENDING'}
                </Text>
              </View>
            </View>

            <View style={styles.statGrid}>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>Days Worked</Text>
                <Text style={styles.statCellVal}>{r.daysPresent} Days {r.halfDays > 0 ? `(${r.halfDays} HD)` : ''}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>OT Hours</Text>
                <Text style={styles.statCellVal}>{r.otHours} hrs</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>Gross Wage</Text>
                <Text style={styles.statCellVal}>₹{r.grossAmount}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>Advance Deducted</Text>
                <Text style={[styles.statCellVal, { color: '#DC2626' }]}>- ₹{r.advanceDeduction}</Text>
              </View>
            </View>

            <View style={styles.wageFooter}>
              <View>
                <Text style={styles.netLabel}>Net Payable (कुल देय राशि)</Text>
                <Text style={styles.netVal}>₹{r.netPayable.toLocaleString('en-IN')}</Text>
              </View>
              {r.status === 'PENDING' ? (
                <TouchableOpacity style={styles.paySingleBtn} onPress={() => handlePaySingle(r)}>
                  <Text style={styles.paySingleText}>Pay Now →</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.receiptTag}>
                  <Text style={styles.receiptText}>TXN #{r.id.toUpperCase()}-OK</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Batch Pay Modal */}
      <Modal visible={showPayModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Batch Wage Disbursement</Text>
            <Text style={styles.modalSub}>
              Disbursing total ₹{totalPending.toLocaleString('en-IN')} to {wageRecords.filter(r => r.status === 'PENDING').length} workers.
            </Text>

            <Text style={styles.methodHeader}>Select Payment Mode</Text>
            {(['UPI', 'NEFT', 'CASH'] as const).map(method => (
              <TouchableOpacity
                key={method}
                style={[styles.methodOption, selectedMethod === method && styles.methodOptionActive]}
                onPress={() => setSelectedMethod(method)}
              >
                <Text style={styles.methodIcon}>
                  {method === 'UPI' ? '📱' : method === 'NEFT' ? '🏦' : '💵'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodName}>
                    {method === 'UPI' ? 'UPI Direct Payout' : method === 'NEFT' ? 'Bank Account Batch (NEFT/IMPS)' : 'Cash Muster Voucher'}
                  </Text>
                  <Text style={styles.methodDesc}>
                    {method === 'UPI' ? 'Instant credit directly to workers’ UPI addresses' : method === 'NEFT' ? 'Direct bank transfer to verified account numbers' : 'Generate signed cash disbursement receipts'}
                  </Text>
                </View>
                {selectedMethod === method && <Text style={styles.checkIcon}>✓</Text>}
              </TouchableOpacity>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPayModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handlePayAllPending}>
                <Text style={styles.confirmBtnText}>Authorize Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 17,
    fontWeight: '800',
  },
  exportText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  kpiCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  kpiCardTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kpiItem: {
    flex: 1,
  },
  kpiItemLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  kpiItemVal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBtnActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterBtnTextActive: {
    color: '#FFFFFF',
  },
  batchPayBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  batchPayBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  wageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  workerTrade: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePaid: {
    backgroundColor: '#DCFCE7',
  },
  badgePending: {
    backgroundColor: '#FFEDD5',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusPaidText: {
    color: '#16A34A',
  },
  statusPendingText: {
    color: '#EA580C',
  },
  statGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  statCell: {
    flex: 1,
  },
  statCellLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  statCellVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  wageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  netLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  netVal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  paySingleBtn: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  paySingleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  receiptTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  receiptText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
  },
  methodHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  methodOptionActive: {
    borderColor: '#1E3A8A',
    backgroundColor: '#EFF6FF',
  },
  methodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  methodDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  checkIcon: {
    fontSize: 18,
    color: '#1E3A8A',
    fontWeight: '800',
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
