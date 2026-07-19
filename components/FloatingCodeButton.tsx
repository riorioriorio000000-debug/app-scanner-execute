import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Modal, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function FloatingCodeButton() {
  const { selectedApp, logs, addLog, clearLogs, floatingVisible } = useApp();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const runCode = useCallback(async () => {
    if (!code.trim() || running) return;
    setRunning(true);
    const API = {
      log: (msg: string) => addLog(String(msg), 'log'),
      warn: (msg: string) => addLog(String(msg), 'warn'),
      error: (msg: string) => addLog(String(msg), 'error'),
      wait: (ms: number) => new Promise(res => setTimeout(res, ms)),
    };
    const app = selectedApp;
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('API', 'app', `return (async () => { ${code} })()`);
      const result = await fn(API, app);
      if (result !== undefined) addLog(JSON.stringify(result), 'result');
    } catch (e: unknown) {
      addLog(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setRunning(false);
    }
  }, [code, running, selectedApp, addLog]);

  if (!floatingVisible) return null;

  return (
    <>
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
      >
        <Feather name="code" size={22} color="#000000" />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
            <Text style={styles.title}>{t.float.editor}</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Feather name="x" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {selectedApp && (
            <View style={styles.targetBar}>
              <Feather name="target" size={12} color="#555" />
              <Text style={styles.targetText}>{selectedApp.name || selectedApp.packageName}</Text>
            </View>
          )}

          <TextInput
            style={styles.input}
            multiline
            value={code}
            onChangeText={setCode}
            placeholder={t.float.placeholder}
            placeholderTextColor="#333"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={clearLogs} style={styles.clearBtn}>
              <Feather name="trash-2" size={14} color="#555" />
              <Text style={styles.clearBtnText}>{t.float.clear}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={runCode}
              style={[styles.runBtn, running && styles.runBtnActive]}
              disabled={running}
            >
              <Feather name={running ? 'loader' : 'play'} size={14} color="#000000" />
              <Text style={styles.runBtnText}>{running ? '...' : t.float.run}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.console}>
            {logs.length === 0 ? (
              <Text style={styles.noOutput}>{t.editor.noOutput}</Text>
            ) : (
              logs.map(entry => (
                <Text key={entry.id} style={[styles.logLine, styles['log_' + entry.type as keyof typeof styles]]}>
                  {entry.message}
                </Text>
              ))
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', right: 20,
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8,
    elevation: 8,
  },
  modal: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#1A1A1A',
  },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  targetBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#0D0D0D',
  },
  targetText: { color: '#555', fontSize: 11 },
  input: {
    flex: 1, color: '#CCCCCC', fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    padding: 16, textAlignVertical: 'top', minHeight: 160,
  },
  actions: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1A1A1A',
  },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8 },
  clearBtnText: { color: '#555', fontSize: 13 },
  runBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
  },
  runBtnActive: { backgroundColor: '#E0E0E0' },
  runBtnText: { color: '#000000', fontSize: 13, fontWeight: '600' },
  console: { flex: 1, backgroundColor: '#050505', padding: 12, maxHeight: 200 },
  noOutput: { color: '#333', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  logLine: { fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginBottom: 3, lineHeight: 18 },
  log_log: { color: '#CCCCCC' },
  log_error: { color: '#FF453A' },
  log_warn: { color: '#FF9F0A' },
  log_result: { color: '#30D158' },
});
