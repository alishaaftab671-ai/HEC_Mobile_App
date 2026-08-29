import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing } from '../theme';

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  label: string;
  value: T | '';
  options: readonly T[] | Option<T>[];
  onSelect: (value: T) => void;
  error?: string | null;
  hint?: string;
  required?: boolean;
  placeholder?: string;
}

function toOptions<T extends string>(options: readonly T[] | Option<T>[]): Option<T>[] {
  return (options as (T | Option<T>)[]).map((o) =>
    typeof o === 'string' ? ({ value: o as T, label: o as string } as Option<T>) : o,
  );
}

/** Labelled field that opens a modal list picker. */
export default function SelectField<T extends string>({
  label,
  value,
  options,
  onSelect,
  error,
  hint,
  required,
  placeholder = 'Select…',
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const opts = toOptions(options);
  const selected = opts.find((o) => o.value === value);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.req}> *</Text> : null}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.field, selected && styles.fieldSelected, error ? styles.fieldError : null]}
      >
        <Text
          numberOfLines={1}
          style={[styles.valueText, !selected && styles.placeholder]}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>
            <FlatList
              data={opts}
              keyExtractor={(o) => o.value}
              style={{ maxHeight: 380 }}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    style={({ pressed }) => [styles.row, active && styles.rowActive, pressed && { backgroundColor: colors.greenSoft }]}
                    onPress={() => {
                      onSelect(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.rowLabel, active && { color: colors.green, fontWeight: '700' }]}>
                      {item.label}
                    </Text>
                    {active ? <Ionicons name="checkmark" size={18} color={colors.green} /> : null}
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  req: {
    color: colors.error,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    minHeight: 47,
  },
  fieldError: {
    borderColor: colors.error,
  },
  fieldSelected: {
    backgroundColor: colors.mantisSoft,
    borderColor: colors.green,
  },
  valueText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  placeholder: {
    color: colors.textMuted,
  },
  error: {
    marginTop: 5,
    fontSize: 12,
    color: colors.error,
  },
  hint: {
    marginTop: 5,
    fontSize: 12,
    color: colors.textMuted,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: spacing.xs,
  },
  rowActive: {
    backgroundColor: colors.greenSoft,
    borderRadius: radius.sm,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
