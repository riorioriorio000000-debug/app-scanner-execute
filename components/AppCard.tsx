import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppInfo } from '@/contexts/AppContext';

interface Props {
  app: AppInfo;
  selected: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}

export function AppCard({ app, selected, onSelect, onRemove }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
        <Feather name="package" size={20} color={selected ? '#000000' : '#444444'} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{app.name || app.packageName}</Text>
        <Text style={styles.pkg} numberOfLines={1}>{app.packageName}</Text>
        {app.category ? (
          <Text style={styles.category}>{app.category}</Text>
        ) : null}
      </View>
      {selected && (
        <View style={styles.check}>
          <Feather name="check-circle" size={16} color="#000000" />
        </View>
      )}
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.remove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="x" size={14} color="#444" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#0D0D0D', borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#1E1E1E',
  },
  cardSelected: {
    backgroundColor: '#FFFFFF', borderColor: '#FFFFFF',
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center',
  },
  iconBoxSelected: { backgroundColor: '#E0E0E0' },
  info: { flex: 1 },
  name: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  pkg: { color: '#555', fontSize: 11 },
  category: { color: '#444', fontSize: 10, marginTop: 2 },
  check: { marginLeft: 4 },
  remove: { padding: 4 },
});
