import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

const DEFAULT_CODE = `// API.log("Hello!") — print to console
// await API.wait(1000) — wait 1 second  
// app — selected app info

API.log("App: " + (app ? app.name : "none selected"));
`;

export default function EditorScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { selectedApp, logs, addLog, clearLogs } = useApp();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [running, setRunning] = useState(false);

  const runCode = useCallback(async () => {
    if (!code.trim() || running) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRunning(true);
    const API = {
      log: (msg: unknown) => addLog(String(msg), 'log'),
      warn: (msg: unknown) => addLog(String(msg), 'warn'),
      error: (msg: unknown) => addLog(String(msg), 'error'),
      wait: (ms: number) => new Promise<void>(res => setTimeout(res, ms)),
    };
    const app = selectedApp;
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('API', 'app', `return (async () => { ${code} })()`);
      const result = await fn(API, app);
      if (result !== undefined) addLog(JSON.stringify(result, null, 2), 'result');
    } catch (e: unknown) {
      addLog(e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setRunning(false);
    }
  }, [code, running, selectedApp, addLog]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t.editor.title}</Text>
        {selectedApp ? (
          <View style={styles.targetBadge}>
            <Feather name="target" size={11} color="#555" />
            <Text style={styles.targetText} numberOfLines={1}>
              {selectedApp.name || selectedApp.packageName}
            </Text>
          </View>
        ) : (
          <Text style={styles.noApp}>{t.editor.noApp}</Text>
        )}
      </View>

      <TextInput
        style={styles.codeInput}
        multiline
        value={code}
        onChangeText={setCode}
        placeholder={`// ${t.editor.noOutput}`}
        placeholderTextColor="#333"
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        textAlignVertical="top"
      />

      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => { clearLogs(); Haptics.selectionAsync(); }} style={styles.clearBtn}>
          <Feather name="trash-2" size={14} color="#555" />
          <Text style={styles.clearText}>{t.editor.clear}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={runCode}
          style={[styles.runBtn, running && styles.runBtnRunning]}
          disabled={running}
        >
          <Feather name={running ? 'loader' : 'play'} size={14} color="#000000" />
          <Text style={styles.runText}>{running ? t.editor.running : t.editor.run}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.consoleHeader}>
        <Feather name="terminal" size={12} color="#444" />
        <Text style={styles.consoleLabel}>{t.editor.console}</Text>
        <Text style={styles.logCount}>{logs.length}</Text>
      </View>

      <ScrollView style={styles.console} contentContainerStyle={styles.consoleContent}>
        {logs.length === 0 ? (
          <Text style={styles.noOutput}>{t.editor.noOutput}</Text>
        ) : (
          logs.map(entry => (
            <View key={entry.id} style={styles.logRow}>
              <Text style={styles.logTime}>
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Text>
              <Text style={[styles.logMsg, styles['log_' + entry.type as keyof typeof styles]]}>
                {entry.message}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#0D0D0D',
  },
  title: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5 },
  targetBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4,
  },
  targetText: { color: '#555', fontSize: 11 },
  noApp: { color: '#333', fontSize: 11, marginTop: 4 },
  codeInput: {
    flex: 1, color: '#CCCCCC', fontSize: 13, padding: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlignVertical: 'top', backgroundColor: '#050505',
  },
  toolbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1A1A1A',
    backgroundColor: '#000000',
  },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8 },
  clearText: { color: '#555', fontSize: 13 },
  runBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
  },
  runBtnRunning: { backgroundColor: '#E0E0E0' },
  runText: { color: '#000000', fontWeight: '600', fontSize: 13 },
  consoleHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#080808', borderTopWidth: 1, borderTopColor: '#0D0D0D',
  },
  consoleLabel: { color: '#333', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  logCount: { color: '#2A2A2A', fontSize: 10 },
  console: { maxHeight: 200, backgroundColor: '#050505' },
  consoleContent: { padding: 12, paddingBottom: 20 },
  noOutput: {
    color: '#333', fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  logRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  logTime: { color: '#2A2A2A', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', paddingTop: 1 },
  logMsg: { fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', flex: 1, lineHeight: 18 },
  log_log: { color: '#CCCCCC' },
  log_error: { color: '#FF453A' },
  log_warn: { color: '#FF9F0A' },
  log_result: { color: '#30D158' },
});
