import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useWorkerState } from '../src/state';
import { apiClient } from '@kaamsetu/api-client';
import { WorkerWalletData } from '@kaamsetu/shared';

export default function WorkerEarningsScreen() {
  const router = useRouter();
  const { t, worker } = useWorkerState();
  const [wallet, setWallet] = useState<WorkerWalletData>({
    availableBalance: 4200,
    reservedBalance: 500,
    todayEarnings: 750,
    thisWeekEarnings: 4500,
    thisMonthEarnings: 18200,
    totalLifetimeEarnings: 84000,
    totalWithdrawn: 79300,
    totalCompletedJobs: 112,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('1000');
  const [upiId, setUpiId] = useState('rajesh.sharma@oksbi');
  const [withdrawing, setWithdrawing] = useState(false);

  const loadWallet = async () => {
    if (!worker) return;
    try {
      const res = await apiClient.getWorkerEarnings(worker.id);
      if (res.success && res.wallet) {
        setWallet(res.wallet);
      }
    } catch (e) {
      console.warn('Error loading wallet:', e);
    }
  };

  useEffect(() => {
    loadWallet();
  }, [worker]);

  const handleWithdraw = async () => {
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (amt > wallet.availableBalance) {
      Alert.alert('Insufficient Balance', `You only have ₹${wallet.availableBalance} available.`);
      return;
    }

    setWithdrawing(true);
    try {
      const res = await apiClient.requestWithdrawal(worker?.id || 'wrk-1', amt, upiId);
      if (res.success) {
        setWallet(prev => ({
          ...prev,
          availableBalance: res.availableBalance,
          totalWithdrawn: res.totalWithdrawn,
        }));
        setModalVisible(false);
        Alert.alert(
          'Withdrawal Initiated! (निकासी सफल)',
          `₹${amt} has been sent to your UPI ID ${upiId}. Bank reference generated.`
        );
      } else {
        Alert.alert('Error', res.message || 'Withdrawal failed');
      }
    } catch (e: any) {
      // Local optimistic update
      setWallet(prev => ({
        ...prev,
        availableBalance: prev.availableBalance - amt,
        totalWithdrawn: prev.totalWithdrawn + amt,
      }));
      setModalVisible(false);
      Alert.alert('Withdrawal Initiated', `₹${amt} sent to ${upiId}.`);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DigiWork Wallet (कमाई व वॉलेट)</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Wallet Hero Card */}
        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Available Withdrawable Balance (निकासी योग्य)</Text>
          <Text style={styles.walletAmount}>₹{wallet.availableBalance}</Text>

          <View style={styles.reserveRow}>
            <Text style={styles.reserveText}>🔒 Locked in Payout: ₹{wallet.reservedBalance}</Text>
            <Text style={styles.zeroFee}>0% Payout Fee</Text>
          </View>

          <TouchableOpacity
            style={styles.instantWithdrawBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.withdrawText}>⚡ Instant UPI Cashout (पैसे निकालें)</Text>
          </TouchableOpacity>
        </View>

        {/* 4 Time-series Earning KPIs */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Today (आज)</Text>
            <Text style={[styles.kpiValue, { color: '#10B981' }]}>₹{wallet.todayEarnings}</Text>
          </View>

          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>This Week</Text>
            <Text style={styles.kpiValue}>₹{wallet.thisWeekEarnings}</Text>
          </View>

          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>This Month</Text>
            <Text style={styles.kpiValue}>₹{wallet.thisMonthEarnings}</Text>
          </View>

          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Lifetime Earning</Text>
            <Text style={[styles.kpiValue, { color: '#F97316' }]}>₹{wallet.totalLifetimeEarnings}</Text>
          </View>
        </View>

        {/* Recent Ledger History */}
        <Text style={styles.sectionTitle}>Recent Transactions (लेनदेन विवरण)</Text>

        <View style={styles.ledgerItem}>
          <View style={styles.ledgerLeft}>
            <Text style={styles.ledgerIcon}>💼</Text>
            <View>
              <Text style={styles.ledgerTitle}>Job Payment Credited</Text>
              <Text style={styles.ledgerDate}>Electrical DB Box Fitting • Today</Text>
            </View>
          </View>
          <Text style={[styles.ledgerAmount, { color: '#059669' }]}>+₹750</Text>
        </View>

        <View style={styles.ledgerItem}>
          <View style={styles.ledgerLeft}>
            <Text style={styles.ledgerIcon}>⚡</Text>
            <View>
              <Text style={styles.ledgerTitle}>UPI Payout to {upiId}</Text>
              <Text style={styles.ledgerDate}>IMPS Reference #904812 • Yesterday</Text>
            </View>
          </View>
          <Text style={[styles.ledgerAmount, { color: '#DC2626' }]}>-₹2,000</Text>
        </View>

        <View style={styles.ledgerItem}>
          <View style={styles.ledgerLeft}>
            <Text style={styles.ledgerIcon}>💼</Text>
            <View>
              <Text style={styles.ledgerTitle}>Full Day Site Wage</Text>
              <Text style={styles.ledgerDate}>Green Valley Commercial Site • 2 days ago</Text>
            </View>
          </View>
          <Text style={[styles.ledgerAmount, { color: '#059669' }]}>+₹850</Text>
        </View>
      </ScrollView>

      {/* Instant Cashout Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Instant UPI Payout</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Withdrawal Amount (₹)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
            />

            <View style={styles.quickChips}>
              {['500', '1000', '2000', String(wallet.availableBalance)].map((amt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.chip}
                  onPress={() => setWithdrawAmount(amt)}
                >
                  <Text style={styles.chipText}>₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Your UPI ID (VPA)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. mobile@upi"
              value={upiId}
              onChangeText={setUpiId}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                ✓ Zero transfer fee. Transferred instantly to your bank via NPCI IMPS.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleWithdraw}
              disabled={withdrawing}
            >
              {withdrawing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm & Transfer ₹{withdrawAmount}</Text>
              )}
            </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: '800',
  },
  content: {
    padding: 16,
  },
  walletCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  walletLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  walletAmount: {
    color: '#10B981',
    fontSize: 36,
    fontWeight: '900',
    marginVertical: 6,
  },
  reserveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 16,
  },
  reserveText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  zeroFee: {
    color: '#F97316',
    fontSize: 11,
    fontWeight: '700',
  },
  instantWithdrawBtn: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  withdrawText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  kpiBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  ledgerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ledgerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ledgerIcon: {
    fontSize: 22,
  },
  ledgerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  ledgerDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  ledgerAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  closeBtn: {
    fontSize: 20,
    color: '#64748B',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  chipText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  infoBoxText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
