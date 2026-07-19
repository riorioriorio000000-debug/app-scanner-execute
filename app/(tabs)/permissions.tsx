import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, Linking, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/contexts/LanguageContext';

type PermStatus = 'granted' | 'denied' | 'unknown' | 'unavailable';

interface PermDef {
  id: string;
  label: string;
  desc: string;
  icon: string;
  androidOnly?: boolean;
  apkOnly?: boolean;
  check?: () => Promise<PermStatus>;
  requestFn: () => Promise<PermStatus>;
}

async function checkAndRequestMedia(request: boolean): Promise<PermStatus> {
  if (Platform.OS === 'web') return 'unavailable';
  try {
    const ML = await import('expo-media-library');
    const perm = await ML.getPermissionsAsync();
    if (!request) return perm.granted ? 'granted' : perm.status === 'denied' ? 'denied' : 'unknown';
    if (perm.granted) return 'granted';
    const res = await ML.requestPermissionsAsync();
    return res.granted ? 'granted' : 'denied';
  } catch { return 'unknown'; }
}

async function checkAndRequestCamera(request: boolean): Promise<PermStatus> {
  if (Platform.OS === 'web') return 'unavailable';
  try {
    const IP = await import('expo-image-picker');
    const perm = await IP.getCameraPermissionsAsync();
    if (!request) return perm.granted ? 'granted' : perm.status === 'denied' ? 'denied' : 'unknown';
    if (perm.granted) return 'granted';
    const res = await IP.requestCameraPermissionsAsync();
    return res.granted ? 'granted' : 'denied';
  } catch { return 'unknown'; }
}

async function checkAndRequestNotifs(request: boolean): Promise<PermStatus> {
  if (Platform.OS === 'web') return 'unavailable';
  try {
    const N = await import('expo-notifications');
    const perm = await N.getPermissionsAsync();
    if (!request) return perm.granted ? 'granted' : perm.status === 'denied' ? 'denied' : 'unknown';
    if (perm.granted) return 'granted';
    const res = await N.requestPermissionsAsync();
    return res.granted ? 'granted' : 'denied';
  } catch { return 'unknown'; }
}

async function checkAndRequestLocation(request: boolean): Promise<PermStatus> {
  if (Platform.OS === 'web') return 'unavailable';
  try {
    const L = await import('expo-location');
    const perm = await L.getForegroundPermissionsAsync();
    if (!request) return perm.granted ? 'granted' : perm.status === 'denied' ? 'denied' : 'unknown';
    if (perm.granted) return 'granted';
    const res = await L.requestForegroundPermissionsAsync();
    return res.granted ? 'granted' : 'denied';
  } catch { return 'unknown'; }
}

const PERM_DEFS: PermDef[] = [
  {
    id: 'media', label: 'Media Library', desc: 'Access photos, videos and files on device', icon: 'image',
    check: () => checkAndRequestMedia(false), requestFn: () => checkAndRequestMedia(true),
  },
  {
    id: 'camera', label: 'Camera', desc: 'Take screenshots and capture screen', icon: 'camera',
    check: () => checkAndRequestCamera(false), requestFn: () => checkAndRequestCamera(true),
  },
  {
    id: 'notifications', label: 'Notifications', desc: 'Show alerts and monitoring notifications', icon: 'bell',
    check: () => checkAndRequestNotifs(false), requestFn: () => checkAndRequestNotifs(true),
  },
  {
    id: 'location', label: 'Location', desc: 'Check device location during tests', icon: 'map-pin',
    check: () => checkAndRequestLocation(false), requestFn: () => checkAndRequestLocation(true),
  },
  {
    id: 'overlay', label: 'Draw Over Apps', desc: 'Show floating button above other apps — Android Settings',
    icon: 'layers', androidOnly: true, apkOnly: true,
    requestFn: async () => { if (Platform.OS === 'android') await Linking.openSettings(); return 'unknown'; },
  },
  {
    id: 'accessibility', label: 'Accessibility Service', desc: 'Control and interact with other apps — Android Settings',
    icon: 'eye', androidOnly: true, apkOnly: true,
    requestFn: async () => { if (Platform.OS === 'android') await Linking.openSettings(); return 'unknown'; },
  },
  {
    id: 'query_apps', label: 'Query Installed Apps', desc: 'See all apps — requires APK build with QUERY_ALL_PACKAGES',
    icon: 'grid', androidOnly: true, apkOnly: true,
    requestFn: async () => 'unknown',
  },
];

const STATUS_COLOR: Record<PermStatus, string> = {
  granted: '#34C759', denied: '#FF3B30', unknown: '#555555', unavailable: '#333333',
};

export default function PermissionsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [statuses, setStatuses] = useState<Record<string, PermStatus>>({});
  const [requesting, setRequesting] = useState<string | null>(null);

  const checkAll = useCallback(async () => {
    const results: Record<string, PermStatus> = {};
    for (const p of PERM_DEFS) {
      if (p.check) results[p.id] = await p.check();
      else results[p.id] = 'unknown';
    }
    setStatuses(results);
  }, []);

  useEffect(() => { checkAll(); }, [checkAll]);

  const handleRequest = async (perm: PermDef) => {
    if (perm.apkOnly && Platform.OS !== 'android') {
      Alert.alert('Android Only', 'This permission requires an Android APK build.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRequesting(perm.id);
    const result = await perm.requestFn();
    setStatuses(prev => ({ ...prev, [perm.id]: result }));
    setRequesting(null);
  };

  const standardPerms = PERM_DEFS.filter(p => !p.apkOnly);
  const apkPerms = PERM_DEFS.filter(p => p.apkOnly);
  const allStandardGranted = standardPerms.every(p => statuses[p.id] === 'granted');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.perms.title}</Text>
        <Text style={styles.subtitle}>{t.perms.subtitle}</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {allStandardGranted && (
          <View style={styles.allGrantedBanner}>
            <Feather name="check-circle" size={14} color="#34C759" />
            <Text style={styles.allGrantedText}>{t.perms.allGranted}</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>{t.perms.standard}</Text>
        {standardPerms.map(perm => {
          const status = statuses[perm.id] ?? 'unknown';
          const isGranted = status === 'granted';
          return (
            <View key={perm.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={[styles.iconBox, { backgroundColor: isGranted ? '#0D2518' : '#1A1A1A' }]}>
                  <Feather name={perm.icon as 'image'} size={18} color={isGranted ? '#34C759' : '#444'} />
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.labelRow}>
                    <Text style={styles.permLabel}>{perm.label}</Text>
                  </View>
                  <Text style={styles.permDesc}>{perm.desc}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[status] + '22' }]}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[status] }]} />
                    <Text style={[styles.statusText, { color: STATUS_COLOR[status] }]}>
                      {status === 'granted' ? t.perms.granted
                        : status === 'denied' ? t.perms.denied
                        : status === 'unavailable' ? t.perms.na
                        : t.perms.tapToReq}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.requestBtn, isGranted && styles.requestBtnGranted]}
                onPress={() => handleRequest(perm)}
                disabled={requesting === perm.id}
              >
                <Feather
                  name={isGranted ? 'check' : requesting === perm.id ? 'loader' : 'plus'}
                  size={16}
                  color={isGranted ? '#34C759' : '#FFFFFF'}
                />
              </TouchableOpacity>
            </View>
          );
        })}

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>{t.perms.androidReq}</Text>
        {apkPerms.map(perm => (
          <View key={perm.id} style={[styles.card, { opacity: 0.6 }]}>
            <View style={styles.cardLeft}>
              <View style={styles.iconBox}>
                <Feather name={perm.icon as 'layers'} size={18} color="#333" />
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.labelRow}>
                  <Text style={styles.permLabel}>{perm.label}</Text>
                  <View style={styles.apkBadge}>
                    <Text style={styles.apkBadgeText}>APK</Text>
                  </View>
                </View>
                <Text style={styles.permDesc}>{perm.desc}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.requestBtn} onPress={() => handleRequest(perm)}>
              <Feather name="settings" size={16} color="#444" />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.apkNote}>
          <Feather name="info" size={12} color="#333" />
          <Text style={styles.apkNoteText}>{t.perms.apkNote}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#444', marginTop: 2 },
  allGrantedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 12, padding: 10,
    backgroundColor: '#0D2518', borderRadius: 10, borderWidth: 1, borderColor: '#1A3A28',
  },
  allGrantedText: { color: '#34C759', fontSize: 13 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionLabel: { color: '#333', fontSize: 10, fontWeight: '600', letterSpacing: 1.5, marginBottom: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0D0D0D', borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#1E1E1E',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, gap: 3 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  permLabel: { color: '#DDDDDD', fontSize: 13, fontWeight: '500' },
  apkBadge: {
    backgroundColor: '#1A1A1A', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 1, borderWidth: 1, borderColor: '#2A2A2A',
  },
  apkBadgeText: { color: '#444', fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },
  permDesc: { color: '#444', fontSize: 11, lineHeight: 15 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginTop: 2,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '500' },
  requestBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2A2A2A', marginLeft: 8,
  },
  requestBtnGranted: { backgroundColor: '#0D2518', borderColor: '#1A3A28' },
  apkNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    marginTop: 12, padding: 10, backgroundColor: '#080808',
    borderRadius: 8, borderWidth: 1, borderColor: '#161616',
  },
  apkNoteText: { color: '#333', fontSize: 10, lineHeight: 15, flex: 1 },
});
