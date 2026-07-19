import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [showStack, setShowStack] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, backgroundColor: colors.bg }]}>
      <View style={styles.iconBox}>
        <Feather name="alert-triangle" size={32} color="#FF3B30" />
      </View>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{error.message}</Text>

      {error.stack && (
        <Pressable onPress={() => setShowStack(true)} style={styles.stackBtn}>
          <Text style={styles.stackBtnText}>View stack trace</Text>
        </Pressable>
      )}

      <Pressable onPress={resetError} style={styles.resetBtn}>
        <Text style={styles.resetBtnText}>Try Again</Text>
      </Pressable>

      <Modal visible={showStack} animationType="slide" onRequestClose={() => setShowStack(false)}>
        <View style={[styles.modal, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Stack Trace</Text>
            <Pressable onPress={() => setShowStack(false)}>
              <Feather name="x" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
          <ScrollView style={styles.stackScroll}>
            <Text style={styles.stack}>{error.stack}</Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  iconBox: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: '#1A0000',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: {
    fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 8,
  },
  message: {
    fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24, lineHeight: 20,
  },
  stackBtn: {
    marginBottom: 12, paddingVertical: 8, paddingHorizontal: 16,
    borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 8,
  },
  stackBtnText: { color: '#666', fontSize: 13 },
  resetBtn: {
    paddingVertical: 12, paddingHorizontal: 32,
    backgroundColor: '#1A1A1A', borderRadius: 12,
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  resetBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  modal: { flex: 1, backgroundColor: '#000000' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#1A1A1A',
  },
  modalTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  stackScroll: { flex: 1, padding: 16 },
  stack: { color: '#888', fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 18 },
});
