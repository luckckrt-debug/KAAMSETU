import React, { useState } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useHiringState, MobileBooking } from '../src/state';
import { UNIVERSAL_CATEGORIES, MobileCategory } from '../src/professions';

export default function InstantBookScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addBooking, currentAddress } = useHiringState();

  // Find initial category if passed via params
  const initialCat = params.preselectCategory
    ? UNIVERSAL_CATEGORIES.find(c => c.id === params.preselectCategory) || UNIVERSAL_CATEGORIES[0]
    : UNIVERSAL_CATEGORIES[0];

  const [selectedCat, setSelectedCat] = useState<MobileCategory>(initialCat);
  const [selectedProfession, setSelectedProfession] = useState<string>(
    (params.trade as string) || initialCat.popularProfessions[0] || 'Professional Worker'
  );
  const [workScope, setWorkScope] = useState<'IMMEDIATE' | 'SCHEDULED'>('IMMEDIATE');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [address, setAddress] = useState<string>(currentAddress);
  const [city, setCity] = useState<string>('Noida');
  const [notes, setNotes] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'CASH'>('UPI');

  // Live Dispatch Simulation Modal
  const [dispatching, setDispatching] = useState(false);
  const [dispatchStep, setDispatchStep] = useState(1);
  const [matchedWorker, setMatchedWorker] = useState<any>(null);

  const ratePerHour = selectedCat.baseHourlyRate;
  const totalAmount = ratePerHour * durationHours;

  const handleStartDispatch = () => {
    if (!address.trim()) {
      Alert.alert('Address Required', 'Please enter your service address');
      return;
    }

    setDispatching(true);
    setDispatchStep(1);

    // Step 1: Pinging radar in 1-3km
    setTimeout(() => {
      setDispatchStep(2);
    }, 1200);

    // Step 2: Match found!
    setTimeout(() => {
      setDispatchStep(3);
      setMatchedWorker({
        name: params.workerName || (selectedCat.code === 'A' ? 'Jagdish Mistri' : selectedCat.code === 'B' ? 'Ramesh Kumar Verma' : 'Suresh Sharma'),
        phone: '+91 98765 43210',
        rating: 4.9,
        eta: 14,
      });
    }, 2500);
  };

  const handleConfirmAndTrack = () => {
    const booking = addBooking({
      categoryName: selectedCat.nameEn,
      categoryIcon: selectedCat.icon,
      profession: selectedProfession,
      workerName: matchedWorker?.name || 'Assigned Verified Worker',
      workerPhone: matchedWorker?.phone || '+91 98765 43210',
      status: 'EN_ROUTE',
      address: address.trim(),
      city: city.trim(),
      estimatedHours: durationHours,
      ratePerHour: ratePerHour,
      totalAmount: totalAmount,
      scheduledTime: workScope === 'IMMEDIATE' ? 'Immediate Dispatch (~15 Min)' : 'Tomorrow, 10:00 AM',
      etaMinutes: matchedWorker?.eta || 15,
      paymentMode: paymentMode,
    });

    setDispatching(false);
    router.replace('/(tabs)/bookings');
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Instant Worker Dispatch (तत्काल बुकिंग)</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Step 1: Select Industry Category */}
        <Text style={styles.stepTitle}>1. Select Profession Category (कार्य श्रेणी)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {UNIVERSAL_CATEGORIES.map(cat => {
            const isSelected = selectedCat.id === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, isSelected && styles.catChipActive]}
                onPress={() => {
                  setSelectedCat(cat);
                  setSelectedProfession(cat.popularProfessions[0]);
                }}
              >
                <Text style={styles.catChipIcon}>{cat.icon}</Text>
                <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                  {cat.nameEn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Popular sub-professions pills */}
        <Text style={styles.label}>Specific Role / Trade *</Text>
        <View style={styles.profPillsRow}>
          {selectedCat.popularProfessions.map((prof, idx) => {
            const isProfSelected = selectedProfession === prof;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.profPill, isProfSelected && styles.profPillActive]}
                onPress={() => setSelectedProfession(prof)}
              >
                <Text style={[styles.profPillText, isProfSelected && styles.profPillTextActive]}>
                  {prof}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Step 2: Time Requirement */}
        <Text style={[styles.stepTitle, { marginTop: 20 }]}>2. When Do You Need Work Done?</Text>
        <View style={styles.scopeRow}>
          <TouchableOpacity
            style={[styles.scopeBtn, workScope === 'IMMEDIATE' && styles.scopeBtnActive]}
            onPress={() => setWorkScope('IMMEDIATE')}
          >
            <Text style={{ fontSize: 18, marginBottom: 4 }}>⚡</Text>
            <Text style={[styles.scopeTitle, workScope === 'IMMEDIATE' && styles.scopeTitleActive]}>
              Instant (तुरंत चाहिए)
            </Text>
            <Text style={styles.scopeSub}>Worker arrives in 15-30 min</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.scopeBtn, workScope === 'SCHEDULED' && styles.scopeBtnActive]}
            onPress={() => setWorkScope('SCHEDULED')}
          >
            <Text style={{ fontSize: 18, marginBottom: 4 }}>📅</Text>
            <Text style={[styles.scopeTitle, workScope === 'SCHEDULED' && styles.scopeTitleActive]}>
              Schedule Later (बाद के लिए)
            </Text>
            <Text style={styles.scopeSub}>Choose date & time slot</Text>
          </TouchableOpacity>
        </View>

        {/* Step 3: Duration & Wage Calculation */}
        <Text style={[styles.stepTitle, { marginTop: 20 }]}>3. Estimated Duration & Transparent Fare</Text>
        <View style={styles.durationRow}>
          {[1, 2, 4, 8].map(hrs => (
            <TouchableOpacity
              key={hrs}
              style={[styles.durationChip, durationHours === hrs && styles.durationChipActive]}
              onPress={() => setDurationHours(hrs)}
            >
              <Text style={[styles.durationNum, durationHours === hrs && styles.durationNumActive]}>
                {hrs === 8 ? 'Full Day (8h)' : `${hrs} Hr`}
              </Text>
              <Text style={[styles.durationPrice, durationHours === hrs && styles.durationPriceActive]}>
                ₹{ratePerHour * hrs}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Step 4: Service Address */}
        <Text style={[styles.stepTitle, { marginTop: 20 }]}>4. Service Location (काम का पता)</Text>
        <View style={styles.addressBox}>
          <Text style={styles.label}>House/Flat No., Building, Area *</Text>
          <TextInput
            style={styles.textInput}
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. Flat 402, Tower 4, Sector 78"
            placeholderTextColor="#94A3B8"
          />

          <View style={styles.cityPincodeRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.textInput}
                value={city}
                onChangeText={setCity}
                placeholder="Noida"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <TouchableOpacity
              style={styles.gpsDetectBtn}
              onPress={() => {
                setAddress('Tower 4, Sector 78, Noida, Uttar Pradesh');
                Alert.alert('GPS Location Detected', 'Updated location to current position.');
              }}
            >
              <Text style={styles.gpsDetectText}>📍 Auto GPS</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Work Description / Notes (वैकल्पिक)</Text>
          <TextInput
            style={[styles.textInput, { height: 60 }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Switchboard sparking, need replacement & wiring fix"
            placeholderTextColor="#94A3B8"
            multiline
          />
        </View>

        {/* Step 5: Payment Mode */}
        <Text style={[styles.stepTitle, { marginTop: 20 }]}>5. Payment Mode (भुगतान का तरीका)</Text>
        <View style={styles.paymentRow}>
          <TouchableOpacity
            style={[styles.payChip, paymentMode === 'UPI' && styles.payChipActive]}
            onPress={() => setPaymentMode('UPI')}
          >
            <Text style={{ fontSize: 16 }}>📱</Text>
            <Text style={[styles.payText, paymentMode === 'UPI' && styles.payTextActive]}>UPI / Online (GPay/PhonePe)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.payChip, paymentMode === 'CASH' && styles.payChipActive]}
            onPress={() => setPaymentMode('CASH')}
          >
            <Text style={{ fontSize: 16 }}>💵</Text>
            <Text style={[styles.payText, paymentMode === 'CASH' && styles.payTextActive]}>Cash on Completion (काम के बाद नकद)</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Professional Category:</Text>
            <Text style={styles.summaryVal}>{selectedProfession}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated Time:</Text>
            <Text style={styles.summaryVal}>{durationHours} Hours</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Standard Rate:</Text>
            <Text style={styles.summaryVal}>₹{ratePerHour}/hr</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <Text style={styles.totalLabel}>Total Payable Fare:</Text>
            <Text style={styles.totalAmount}>₹{totalAmount}</Text>
          </View>
        </View>

        {/* Dispatch Action Button */}
        <TouchableOpacity
          style={styles.dispatchHeroBtn}
          activeOpacity={0.88}
          onPress={handleStartDispatch}
        >
          <Text style={styles.dispatchBtnText}>
            ⚡ Dispatch Nearest {selectedProfession} (तुरंत कारीगर बुलाएं)
          </Text>
          <Text style={styles.dispatchBtnSub}>Zero Booking Fee • Transparent Hourly Pricing</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Live Dispatching Radar Modal */}
      <Modal visible={dispatching} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {dispatchStep < 3 ? (
              <>
                <View style={styles.radarPulseContainer}>
                  <ActivityIndicator size="large" color="#EA580C" />
                  <Text style={{ fontSize: 36, marginTop: 16 }}>{selectedCat.icon}</Text>
                </View>

                <Text style={styles.modalTitle}>
                  {dispatchStep === 1
                    ? 'Scanning 3km Workforce Radar...'
                    : 'Pinging Nearest Verified Workers...'}
                </Text>
                <Text style={styles.modalSub}>
                  Matching certified {selectedProfession} near {city}...
                </Text>

                <View style={styles.stepProgressBar}>
                  <View
                    style={[
                      styles.stepProgressFill,
                      { width: dispatchStep === 1 ? '50%' : '85%' },
                    ]}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.matchedBadge}>
                  <Text style={{ fontSize: 32 }}>🎉</Text>
                </View>

                <Text style={styles.matchedTitle}>Worker Found & Accepted!</Text>
                <Text style={styles.matchedSub}>कारीगर ने काम स्वीकार कर लिया है</Text>

                <View style={styles.workerSummaryBox}>
                  <Text style={{ fontSize: 36, marginRight: 12 }}>👷‍♂️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.workerSummaryName}>{matchedWorker?.name}</Text>
                    <Text style={styles.workerSummaryMeta}>
                      ★ {matchedWorker?.rating} Rating • Aadhaar Verified
                    </Text>
                    <Text style={styles.workerSummaryEta}>
                      ⏱️ ETA: ~{matchedWorker?.eta} Minutes to your doorstep
                    </Text>
                  </View>
                </View>

                <View style={styles.otpSecurityNotice}>
                  <Text style={styles.otpNoticeLabel}>SAFETY START OTP:</Text>
                  <Text style={styles.otpNoticeVal}>4821</Text>
                  <Text style={styles.otpNoticeHint}>Share this PIN when worker arrives to start duty.</Text>
                </View>

                <TouchableOpacity
                  style={styles.confirmTrackBtn}
                  onPress={handleConfirmAndTrack}
                >
                  <Text style={styles.confirmTrackText}>Confirm & Track Live →</Text>
                </TouchableOpacity>
              </>
            )}
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
    paddingHorizontal: 8,
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
  stepTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  catScroll: {
    gap: 8,
    paddingBottom: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  catChipActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  catChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  catChipTextActive: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
    marginBottom: 6,
  },
  profPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  profPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  profPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  profPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  profPillTextActive: {
    color: '#FFFFFF',
  },
  scopeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scopeBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  scopeBtnActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  scopeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  scopeTitleActive: {
    color: '#C2410C',
  },
  scopeSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  durationChipActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  durationNum: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  durationNumActive: {
    color: '#FFFFFF',
  },
  durationPrice: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '700',
  },
  durationPriceActive: {
    color: '#93C5FD',
  },
  addressBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
    marginBottom: 8,
  },
  cityPincodeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  gpsDetectBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  gpsDetectText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  paymentRow: {
    flexDirection: 'column',
    gap: 8,
  },
  payChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    borderRadius: 12,
  },
  payChipActive: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  payText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  payTextActive: {
    color: '#065F46',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 8,
    paddingTop: 10,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EA580C',
  },
  dispatchHeroBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#EA580C',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dispatchBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  dispatchBtnSub: {
    color: '#FFEDD5',
    fontSize: 10,
    marginTop: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  radarPulseContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  stepProgressFill: {
    height: '100%',
    backgroundColor: '#EA580C',
  },
  matchedBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchedTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#065F46',
  },
  matchedSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 16,
  },
  workerSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    marginBottom: 14,
  },
  workerSummaryName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  workerSummaryMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  workerSummaryEta: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
    marginTop: 4,
  },
  otpSecurityNotice: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  otpNoticeLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9A3412',
    letterSpacing: 1,
  },
  otpNoticeVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#EA580C',
    marginVertical: 2,
    letterSpacing: 3,
  },
  otpNoticeHint: {
    fontSize: 9,
    color: '#7C2D12',
    textAlign: 'center',
  },
  confirmTrackBtn: {
    backgroundColor: '#1E3A8A',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmTrackText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
