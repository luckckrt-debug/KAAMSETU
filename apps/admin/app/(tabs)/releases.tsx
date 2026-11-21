import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RELEASED_APPS = [
  {
    name: 'DigiWork Worker',
    package: 'com.digiwork.worker',
    role: 'Workers & Daily Wage Labor',
    version: '1.0.0',
    size: '64.84 MB',
    file: 'DigiWork-Worker-preview.apk',
    url: 'https://expo.dev/artifacts/eas/6Zci0-hiEwLc53RGVoY4UVPl-gaA9eF2eVLPF4TRBYo.apk',
    color: '#0284C7',
    icon: 'hammer'
  },
  {
    name: 'DigiWork Hiring',
    package: 'com.digiwork.hiring',
    role: 'Customers, Homeowners & SMEs',
    version: '1.0.0',
    size: '64.83 MB',
    file: 'DigiWork-Hiring-preview.apk',
    url: 'https://expo.dev/artifacts/eas/TeHenQQP18h968-pHzZ_Odnc2wlMWrzpILU7AbxpUFE.apk',
    color: '#2563EB',
    icon: 'people'
  },
  {
    name: 'DigiWork Contractor',
    package: 'com.digiwork.contractor',
    role: 'Construction Contractors & Builders',
    version: '1.0.0',
    size: '64.84 MB',
    file: 'DigiWork-Contractor-preview.apk',
    url: 'https://expo.dev/artifacts/eas/JPCBbmDl3gfGcYUuCJad-c7QV8jZ39Vt7z736lLmeq0.apk',
    color: '#4338CA',
    icon: 'business'
  }
];

export default function ReleasesScreen() {
  const handleDownload = (app: any) => {
    Linking.openURL(app.url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTag}>CENTRAL DIRECTORY</Text>
        <Text style={styles.headerTitle}>All 3 Standalone Android APKs</Text>
        <Text style={styles.headerSubtitle}>
          Compiled into standalone release packages and stored in central-directory/apks/ on the host system.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Production Release Packages</Text>

      {RELEASED_APPS.map((app, idx) => (
        <View key={idx} style={styles.appCard}>
          <View style={styles.cardTop}>
            <View style={[styles.iconBox, { backgroundColor: app.color }]}>
              <Ionicons name={app.icon as any} size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.titleRow}>
                <Text style={styles.appName}>{app.name}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>APK</Text>
                </View>
              </View>
              <Text style={styles.appPackage}>{app.package}</Text>
              <Text style={styles.appRole}>{app.role}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Version</Text>
              <Text style={styles.metaVal}>{app.version}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>File Size</Text>
              <Text style={styles.metaVal}>{app.size}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Format</Text>
              <Text style={styles.metaVal}>Standalone APK</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.downloadBtn, { backgroundColor: app.color }]}
            onPress={() => handleDownload(app)}
          >
            <Ionicons name="cloud-download" size={18} color="#FFFFFF" />
            <Text style={styles.btnText}>Download APK ({app.size})</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.adbBox}>
        <Ionicons name="terminal" size={24} color="#10B981" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.adbTitle}>1-Click ADB USB Installation</Text>
          <Text style={styles.adbDesc}>
            Connect your Android phone to PC and double-click `central-directory/install-all-apks-adb.bat` to install all 3 applications at once.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120' },
  content: { padding: 16, paddingBottom: 40 },
  headerBox: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  headerTag: { color: '#FF6B00', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  headerSubtitle: { color: '#94A3B8', fontSize: 12, marginTop: 4, lineHeight: 18 },
  sectionTitle: { color: '#F1F5F9', fontWeight: '800', fontSize: 16, marginBottom: 14 },
  appCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appName: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  badge: { backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  appPackage: { color: '#64748B', fontSize: 11, fontFamily: 'monospace', marginTop: 1 },
  appRole: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginVertical: 14
  },
  metaItem: { alignItems: 'center' },
  metaLabel: { color: '#64748B', fontSize: 10, fontWeight: '700' },
  metaVal: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', marginTop: 2 },
  downloadBtn: {
    flexDirection: 'row',
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  btnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  adbBox: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B98144',
    marginTop: 10
  },
  adbTitle: { color: '#10B981', fontSize: 14, fontWeight: '800' },
  adbDesc: { color: '#94A3B8', fontSize: 11, marginTop: 2, lineHeight: 16 }
});
