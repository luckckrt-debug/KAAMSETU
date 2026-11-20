import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHiringState, MobileBooking } from '../../src/state';

export default function BookingsManagementScreen() {
  const router = useRouter();
  const { bookings, updateBookingStatus } = useHiringState();
  const [tab, setTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');

  const activeList = bookings.filter(
    b => b.status !== 'COMPLETED' && b.status !== 'PAID' && b.status !== 'CANCELLED'
  );
  const completedList = bookings.filter(
    b => b.status === 'COMPLETED' || b.status === 'PAID'
  );

  const displayList = tab === 'ACTIVE' ? activeList : completedList;

  const handleAdvanceStatus = (b: MobileBooking) => {
    if (b.status === 'REQUESTED' || b.status === 'ASSIGNED') {
      updateBookingStatus(b.id, 'EN_ROUTE');
      Alert.alert('Worker Updated', 'Worker is now on the way to your address.');
    } else if (b.status === 'EN_ROUTE') {
      updateBookingStatus(b.id, 'IN_PROGRESS');
      Alert.alert('Duty Commenced', 'Worker verified Start OTP and work is now in progress.');
    } else if (b.status === 'IN_PROGRESS') {
      updateBookingStatus(b.id, 'COMPLETED');
      Alert.alert('Work Finished', 'Work completed successfully. Please settle payment.');
    } else if (b.status === 'COMPLETED') {
      updateBookingStatus(b.id, 'PAID');
      Alert.alert('Payment Settled', `₹${b.totalAmount} paid to ${b.workerName}. Thank you!`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bookings & Live Dispatch (बुकिंग व ट्रैकिंग)</Text>
          <Text style={styles.headerSub}>Real-time telemetry, worker GPS & OTP safety verification</Text>
        </View>

        <TouchableOpacity
          style={styles.newBookBtn}
          onPress={() => router.push('/book')}
        >
          <Text style={styles.newBookBtnText}>+ Book</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, tab === 'ACTIVE' && styles.tabItemActive]}
          onPress={() => setTab('ACTIVE')}
        >
          <Text style={[styles.tabText, tab === 'ACTIVE' && styles.tabTextActive]}>
            Active / Ongoing ({activeList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, tab === 'COMPLETED' && styles.tabItemActive]}
          onPress={() => setTab('COMPLETED')}
        >
          <Text style={[styles.tabText, tab === 'COMPLETED' && styles.tabTextActive]}>
            Completed History ({completedList.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {displayList.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48, marginBottom: 8 }}>⚡</Text>
            <Text style={styles.emptyTitle}>
              {tab === 'ACTIVE' ? 'No Active Bookings' : 'No Completed History Yet'}
            </Text>
            <Text style={styles.emptySub}>
              {tab === 'ACTIVE'
                ? 'Need an electrician, plumber, driver or labour? Book now for 15-minute doorstep dispatch.'
                : 'Completed service records and digital receipts will appear here.'}
            </Text>
            {tab === 'ACTIVE' && (
              <TouchableOpacity
                style={styles.firstBookBtn}
                onPress={() => router.push('/book')}
              >
                <Text style={styles.firstBookBtnText}>⚡ Book Instant Worker Now</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          displayList.map(item => {
            const isCompleted = item.status === 'COMPLETED' || item.status === 'PAID';

            return (
              <View key={item.id} style={styles.bookingCard}>
                {/* Top Row: Category + Status Chip */}
                <View style={styles.cardHeader}>
                  <View style={styles.categoryBadge}>
                    <Text style={{ fontSize: 18, marginRight: 6 }}>{item.categoryIcon || '🛠️'}</Text>
                    <View>
                      <Text style={styles.cardProfession}>{item.profession}</Text>
                      <Text style={styles.cardCatName}>{item.categoryName}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      item.status === 'EN_ROUTE' ? styles.statusPillEnRoute :
                      item.status === 'IN_PROGRESS' ? styles.statusPillProgress :
                      item.status === 'PAID' ? styles.statusPillPaid :
                      styles.statusPillDefault,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        item.status === 'EN_ROUTE' ? styles.statusTextEnRoute :
                        item.status === 'IN_PROGRESS' ? styles.statusTextProgress :
                        item.status === 'PAID' ? styles.statusTextPaid :
                        styles.statusTextDefault,
                      ]}
                    >
                      {item.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                {/* Progress Steps Visualizer */}
                <View style={styles.timelineRow}>
                  <View style={[styles.timelineStep, styles.stepDone]}>
                    <Text style={styles.timelineStepNum}>✓</Text>
                    <Text style={styles.timelineStepLabel}>Booked</Text>
                  </View>
                  <View style={[styles.timelineLine, item.status !== 'REQUESTED' && styles.lineDone]} />

                  <View style={[styles.timelineStep, item.status !== 'REQUESTED' && styles.stepDone]}>
                    <Text style={styles.timelineStepNum}>✓</Text>
                    <Text style={styles.timelineStepLabel}>Assigned</Text>
                  </View>
                  <View
                    style={[
                      styles.timelineLine,
                      (item.status === 'EN_ROUTE' || item.status === 'IN_PROGRESS' || isCompleted) && styles.lineDone,
                    ]}
                  />

                  <View
                    style={[
                      styles.timelineStep,
                      (item.status === 'EN_ROUTE' || item.status === 'IN_PROGRESS' || isCompleted) && styles.stepDone,
                    ]}
                  >
                    <Text style={styles.timelineStepNum}>
                      {item.status === 'EN_ROUTE' ? '3' : '✓'}
                    </Text>
                    <Text style={styles.timelineStepLabel}>En Route</Text>
                  </View>
                  <View
                    style={[
                      styles.timelineLine,
                      (item.status === 'IN_PROGRESS' || isCompleted) && styles.lineDone,
                    ]}
                  />

                  <View
                    style={[
                      styles.timelineStep,
                      (item.status === 'IN_PROGRESS' || isCompleted) && styles.stepDone,
                    ]}
                  >
                    <Text style={styles.timelineStepNum}>
                      {item.status === 'IN_PROGRESS' ? '4' : isCompleted ? '✓' : '4'}
                    </Text>
                    <Text style={styles.timelineStepLabel}>Working</Text>
                  </View>
                  <View style={[styles.timelineLine, isCompleted && styles.lineDone]} />

                  <View style={[styles.timelineStep, isCompleted && styles.stepDone]}>
                    <Text style={styles.timelineStepNum}>{isCompleted ? '✓' : '5'}</Text>
                    <Text style={styles.timelineStepLabel}>Done</Text>
                  </View>
                </View>

                {/* Worker Details Box */}
                <View style={styles.workerRow}>
                  <View style={styles.workerAvatar}>
                    <Text style={{ fontSize: 22 }}>👷‍♂️</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.workerName}>{item.workerName}</Text>
                    <Text style={styles.workerLocation}>📍 {item.address}, {item.city}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.callIconBtn}
                    onPress={() => Linking.openURL(`tel:${item.workerPhone.replace(/\s+/g, '')}`)}
                  >
                    <Text style={{ fontSize: 16 }}>📞</Text>
                    <Text style={styles.callIconText}>Call</Text>
                  </TouchableOpacity>
                </View>

                {/* OTP & Wage Info */}
                <View style={styles.infoRow}>
                  {!isCompleted ? (
                    <View style={styles.otpBox}>
                      <Text style={styles.otpLabel}>START PIN (कारीगर को बताएं):</Text>
                      <Text style={styles.otpCode}>{item.startOtp}</Text>
                    </View>
                  ) : (
                    <View style={styles.otpBox}>
                      <Text style={styles.otpLabel}>PAYMENT STATUS:</Text>
                      <Text style={[styles.otpCode, { color: '#059669' }]}>
                        {item.status === 'PAID' ? 'PAID IN FULL ✓' : 'PAYMENT DUE'}
                      </Text>
                    </View>
                  )}

                  <View style={styles.fareBox}>
                    <Text style={styles.fareLabel}>Total Fare:</Text>
                    <Text style={styles.fareAmount}>₹{item.totalAmount}</Text>
                    <Text style={styles.fareMeta}>({item.estimatedHours}h @ ₹{item.ratePerHour}/h)</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                {!isCompleted ? (
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.actionBtnPrimary}
                      activeOpacity={0.85}
                      onPress={() => handleAdvanceStatus(item)}
                    >
                      <Text style={styles.actionBtnPrimaryText}>
                        {item.status === 'EN_ROUTE'
                          ? 'Worker Arrived & Started Work (काम शुरू हुआ) →'
                          : item.status === 'IN_PROGRESS'
                          ? 'Mark Work Completed (काम समाप्त हुआ) →'
                          : 'Update Status →'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : item.status === 'COMPLETED' ? (
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={[styles.actionBtnPrimary, { backgroundColor: '#059669' }]}
                      activeOpacity={0.85}
                      onPress={() => handleAdvanceStatus(item)}
                    >
                      <Text style={styles.actionBtnPrimaryText}>
                        Settle Payment (₹{item.totalAmount} Pay via UPI / Cash) ✓
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.paidFooter}>
                    <Text style={styles.paidFooterText}>
                      ✓ Settle via {item.paymentMode} • Digital Receipt Confirmed
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    color: '#93C5FD',
    fontSize: 11,
    marginTop: 2,
  },
  newBookBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newBookBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#1E3A8A',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#1E3A8A',
  },
  list: {
    padding: 16,
    paddingBottom: 35,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    marginTop: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  firstBookBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 18,
  },
  firstBookBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 14,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardProfession: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardCatName: {
    fontSize: 11,
    color: '#64748B',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillEnRoute: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  statusPillProgress: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statusPillPaid: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusPillDefault: {
    backgroundColor: '#F1F5F9',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusTextEnRoute: {
    color: '#EA580C',
  },
  statusTextProgress: {
    color: '#2563EB',
  },
  statusTextPaid: {
    color: '#059669',
  },
  statusTextDefault: {
    color: '#64748B',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginBottom: 14,
  },
  timelineStep: {
    alignItems: 'center',
    width: 44,
  },
  timelineStepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 22,
  },
  timelineStepLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  stepDone: {
    opacity: 1,
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  lineDone: {
    backgroundColor: '#EA580C',
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  workerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  workerLocation: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  callIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  callIconText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  otpBox: {
    flex: 1,
  },
  otpLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9A3412',
  },
  otpCode: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 2,
  },
  fareBox: {
    alignItems: 'flex-end',
  },
  fareLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  fareAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  fareMeta: {
    fontSize: 9,
    color: '#94A3B8',
  },
  cardActionsRow: {
    marginTop: 4,
  },
  actionBtnPrimary: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  paidFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    alignItems: 'center',
  },
  paidFooterText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
});
