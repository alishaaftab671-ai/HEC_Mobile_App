import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing } from '../theme';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  required?: boolean;
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  if (year && month && day) return new Date(year, month - 1, day);
  return new Date(2000, 0, 1);
}

function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function DateField({ label, value, onChange, error, required }: Props) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseDate(value) : new Date(2000, 0, 1);

  const picker = (
    <DateTimePicker
      value={selected}
      mode="date"
      display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
      maximumDate={new Date()}
      onChange={(event, date) => {
        if (Platform.OS !== 'ios') setOpen(false);
        if (date && event.type !== 'dismissed') onChange(formatDate(date));
      }}
    />
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.req}> *</Text> : null}
      </Text>
      <Pressable style={[styles.field, error && styles.fieldError]} onPress={() => setOpen(true)}>
        <Text style={[styles.value, !value && styles.placeholder]}>{value || 'YYYY-MM-DD'}</Text>
        <Ionicons name="calendar-outline" size={18} color={colors.green} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
            <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
              {picker}
              <Pressable style={styles.done} onPress={() => setOpen(false)}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : open ? picker : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  req: { color: colors.error },
  field: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.borderStrong, borderRadius: radius.sm, paddingHorizontal: spacing.md, minHeight: 47 },
  fieldError: { borderColor: colors.error },
  value: { flex: 1, fontSize: 15, color: colors.textPrimary },
  placeholder: { color: colors.textMuted },
  error: { marginTop: 5, fontSize: 12, color: colors.error },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: { backgroundColor: colors.surface, padding: spacing.lg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  done: { alignItems: 'center', backgroundColor: colors.green, borderRadius: radius.sm, paddingVertical: spacing.sm, marginTop: spacing.sm },
  doneText: { color: colors.surface, fontWeight: '800', fontSize: 14 },
});
