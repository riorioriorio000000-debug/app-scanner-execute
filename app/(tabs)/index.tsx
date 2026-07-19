import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp, AppInfo } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppCard } from '@/components/AppCard';
import { FloatingCodeButton } from '@/components/FloatingCodeButton';

const PRESET_APPS: AppInfo[] = [
  { name: 'Chrome', packageName: 'com.android.chrome', category: 'Browser' },
  { name: 'YouTube', packageName: 'com.google.android.youtube', category: 'Media' },
  { name: 'WhatsApp', packageName: 'com.whatsapp', category: 'Messaging' },
  { name: 'Instagram', packageName: 'com.instagram.android', category: 'Social' },
  { name: 'TikTok', packageName: 'com.zhiliaoapp.musically', category: 'Social' },
  { name: 'Twitter/X', packageName: 'com.twitter.android', category: 'Social' },
  { name: 'Telegram', packageName: 'org.telegram.messenger', category: 'Messaging' },
  { name: 'Snapchat', packageName: 'com.snapchat.android', category: 'Social' },
  { name: 'Gmail', packageName: 'com.google.android.gm', category: 'Productivity' },
  { name: 'Maps', packageName: 'com.google.android.apps.maps', category: 'Navigation' },
];

export default function AppsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { selectedApp, setSelectedApp, customApps, addCustomApp, removeCustomApp } = useApp();

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPkg, setNewPkg] = useState('');

  const allApps = [...customApps, ...PRESET_APPS];
  const filtered = search.trim()
    ? allApps.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.packageName.toLowerCase().includes(search.toLowerCase())
      )
    : allApps;

  const handleSelect = (app: AppInfo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedApp(selectedApp?.packageName === app.packageName ? null : app);
  };

  const handleAdd = () => {
    const pkg = newPkg.trim();
    if (!pkg) return Alert.alert('Error', 'Package name is required');
    addCustomApp({ name: newName.trim() || pkg, packageName: pkg, category: 'Custom' });
    setNewName('');
    setNewPkg('');
    setShowAdd(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t.apps.title}</Text>
          <Text style={styles.subtitle}>
            {selectedApp ? `${t.apps.subtitleSelected}: ${selectedApp.name}` : t.apps.subtitle}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowAdd(v => !v)} style={styles.addBtn}>
          <Feather name={showAdd ? 'x' : 'plus'} size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {showAdd && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.addInput}
            placeholder={t.apps.namePlaceholder}
            placeholderTextColor="#444"
            value={newName}
            onChangeText={setNewName}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.addInput}
            placeholder={t.apps.pkgPlaceholder}
            placeholderTextColor="#444"
            value={newPkg}
            onChangeText={setNewPkg}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={handleAdd} style={styles.confirmBtn}>
            <Text style={styles.confirmText}>{t.apps.confirm}</Text>
          </TouchableOpacity>
          <Text style={styles.note}>{t.apps.note}</Text>
        </View>
      )}

      <View style={styles.searchBox}>
        <Feather name="search" size={14} color="#444" />
        <TextInput
          style={styles.searchInput}
          placeholder={t.apps.search}
          placeholderTextColor="#444"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>{t.apps.noApps}</Text>
        ) : (
          filtered.map(app => (
            <AppCard
              key={app.packageName}
              app={app}
              selected={selectedApp?.packageName === app.packageName}
              onSelect={() => handleSelect(app)}
              onRemove={customApps.some(a => a.packageName === app.packageName)
                ? () => removeCustomApp(app.packageName)
                : undefined}
            />
          ))
        )}
      </ScrollView>

      <FloatingCodeButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#444', marginTop: 2 },
  addBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2A2A2A',
  },
  addForm: {
    marginHorizontal: 16, padding: 12, backgroundColor: '#0D0D0D',
    borderRadius: 12, borderWidth: 1, borderColor: '#1E1E1E', marginBottom: 12,
  },
  addInput: {
    backgroundColor: '#1A1A1A', borderRadius: 8, padding: 10, color: '#FFFFFF',
    fontSize: 13, marginBottom: 8, borderWidth: 1, borderColor: '#2A2A2A',
  },
  confirmBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 8, padding: 10, alignItems: 'center',
  },
  confirmText: { color: '#000000', fontWeight: '600', fontSize: 13 },
  note: { color: '#333', fontSize: 10, marginTop: 8, lineHeight: 14 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 12, backgroundColor: '#0D0D0D',
    borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#1E1E1E',
  },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 13, paddingVertical: 10 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  empty: { color: '#333', fontSize: 14, textAlign: 'center', marginTop: 40 },
});
