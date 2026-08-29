import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../../components/Button';
import SelectField from '../../../components/SelectField';
import TextField from '../../../components/TextField';
import { COUNTRY_LIST, EDUCATION_LEVELS, RESULT_TYPES } from '../wizardOptions';
import { colors, radius, spacing } from '../../../theme';
import type { EducationRecord, ResultType } from '../../../types/models';
import type { StepProps } from '../stepProps';
import { uid } from '../../../utils/id';

const EDU_COUNTRIES = ['Pakistan', ...COUNTRY_LIST] as const;

const REQUIRED_FIELDS: (keyof EducationRecord)[] = [
  'degreeTitle',
  'institution',
  'city',
  'enrollmentYear',
  'completionYear',
];

function emptyRecord(): EducationRecord {
  return {
    id: uid(),
    level: "Bachelor's",
    degreeTitle: '',
    institution: '',
    country: 'Pakistan',
    city: '',
    registrationNo: '',
    enrollmentYear: '',
    completionYear: '',
    resultType: 'CGPA',
    cgpa: '',
    obtainedMarks: '',
    totalMarks: '',
    grade: '',
  };
}

function missingFields(r: EducationRecord): (keyof EducationRecord)[] {
  const missing = REQUIRED_FIELDS.filter((f) => !String(r[f] ?? '').trim());
  const yearOk = (y: string) => /^\d{4}$/.test(y.trim());
  if (r.enrollmentYear.trim() && !yearOk(r.enrollmentYear)) missing.push('enrollmentYear');
  if (r.completionYear.trim() && !yearOk(r.completionYear)) missing.push('completionYear');
  return missing;
}

export function validate(form: StepProps['form']): Record<string, string> {
  if (form.educationRecords.length === 0) {
    return { records: 'Add at least one education record.' };
  }
  const incomplete = form.educationRecords
    .map((r, i) => ({ r, i, missing: missingFields(r) }))
    .filter((x) => x.missing.length > 0);
  if (incomplete.length) {
    const labels = incomplete
      .map((x) => `Record ${x.i + 1}: ${x.missing.map((m) => FIELD_LABELS[m]).join(', ')}`)
      .join(' · ');
    return { records: labels };
  }
  return {};
}

const FIELD_LABELS: Partial<Record<keyof EducationRecord, string>> = {
  degreeTitle: 'degree title',
  institution: 'institution',
  city: 'city',
  enrollmentYear: 'enrollment year',
  completionYear: 'completion year',
};

export default function EducationStep({ form, update, errors }: StepProps) {
  const [editing, setEditing] = useState<EducationRecord | null>(null);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const saveRecord = () => {
    if (!editing) return;
    const next: Record<string, string> = {};
    for (const f of REQUIRED_FIELDS) {
      if (!String(editing[f] ?? '').trim()) next[f] = 'Required';
    }
    if (editing.enrollmentYear && !/^\d{4}$/.test(editing.enrollmentYear)) next.enrollmentYear = 'YYYY';
    if (editing.completionYear && !/^\d{4}$/.test(editing.completionYear)) next.completionYear = 'YYYY';
    setLocalErrors(next);
    if (Object.keys(next).length) return;

    const exists = form.educationRecords.some((r) => r.id === editing.id);
    update({
      educationRecords: exists
        ? form.educationRecords.map((r) => (r.id === editing.id ? editing : r))
        : [...form.educationRecords, editing],
    });
    setEditing(null);
    setLocalErrors({});
  };

  const removeRecord = (id: string) => {
    update({ educationRecords: form.educationRecords.filter((r) => r.id !== id) });
    if (editing?.id === id) setEditing(null);
  };

  const setField = (key: keyof EducationRecord, value: string) => {
    if (!editing) return;
    setEditing({ ...editing, [key]: value });
  };

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          List your academic history starting from Matric. At least the highest qualification must be included.
        </Text>
      </View>

      {errors.records ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={15} color={colors.error} />
          <Text style={styles.errorBannerText}>{errors.records}</Text>
        </View>
      ) : null}

      {form.educationRecords.map((r, i) => (
        <View key={r.id} style={[styles.recordCard, shadowCard]}>
          <View style={styles.recordTop}>
            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>{r.level}</Text>
            </View>
            <Text style={styles.recordIndex}>#{i + 1}</Text>
          </View>
          <Text style={styles.recordTitle}>{r.degreeTitle || 'Untitled qualification'}</Text>
          <Text style={styles.recordSub}>
            {[r.institution, r.city, r.country].filter(Boolean).join(' · ')}
          </Text>
          <Text style={styles.recordMeta}>
            {r.enrollmentYear || '—'} → {r.completionYear || '—'} ·{' '}
            {r.resultType === 'CGPA'
              ? `CGPA ${r.cgpa || '—'}`
              : r.resultType === 'Marks'
                ? `${r.obtainedMarks || '—'}/${r.totalMarks || '—'}`
                : `Grade ${r.grade || '—'}`}
          </Text>
          <View style={styles.recordActions}>
            <Pressable style={styles.actionBtn} hitSlop={8} onPress={() => { setEditing({ ...r }); setLocalErrors({}); }}>
              <Ionicons name="create-outline" size={16} color={colors.navyMuted} />
              <Text style={styles.actionText}>Edit</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} hitSlop={8} onPress={() => removeRecord(r.id)}>
              <Ionicons name="trash-outline" size={16} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.error }]}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ))}

      {editing ? (
        <View style={[styles.editorCard, shadowCard]}>
          <Text style={styles.editorTitle}>
            {form.educationRecords.some((r) => r.id === editing.id) ? 'Edit record' : 'New education record'}
          </Text>

          <SelectField
            label="Level"
            required
            value={editing.level}
            options={EDUCATION_LEVELS}
            onSelect={(v) => setField('level', v)}
          />
          <TextField
            label="Degree / Certificate Title"
            required
            placeholder="e.g. BS Computer Science"
            value={editing.degreeTitle}
            onChangeText={(t) => setField('degreeTitle', t)}
            error={localErrors.degreeTitle}
          />
          <TextField
            label="Institution"
            required
            placeholder="Board / university name"
            value={editing.institution}
            onChangeText={(t) => setField('institution', t)}
            error={localErrors.institution}
          />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <SelectField
                label="Country"
                value={editing.country}
                options={EDU_COUNTRIES}
                onSelect={(v) => setField('country', v)}
              />
            </View>
            <View style={{ width: spacing.md }} />
            <View style={{ flex: 1 }}>
              <TextField
                label="City"
                required
                placeholder="City"
                value={editing.city}
                onChangeText={(t) => setField('city', t)}
                error={localErrors.city}
              />
            </View>
          </View>
          <TextField
            label="Registration / Roll No."
            placeholder="Optional"
            value={editing.registrationNo}
            onChangeText={(t) => setField('registrationNo', t)}
          />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Enrollment Year"
                required
                placeholder="2020"
                keyboardType="number-pad"
                maxLength={4}
                value={editing.enrollmentYear}
                onChangeText={(t) => setField('enrollmentYear', t.replace(/\D/g, ''))}
                error={localErrors.enrollmentYear}
              />
            </View>
            <View style={{ width: spacing.md }} />
            <View style={{ flex: 1 }}>
              <TextField
                label="Completion Year"
                required
                placeholder="2024"
                keyboardType="number-pad"
                maxLength={4}
                value={editing.completionYear}
                onChangeText={(t) => setField('completionYear', t.replace(/\D/g, ''))}
                error={localErrors.completionYear}
              />
            </View>
          </View>

          <SelectField
            label="Result Type"
            required
            value={editing.resultType}
            options={RESULT_TYPES}
            onSelect={(v) => setField('resultType', v as ResultType)}
          />
          {editing.resultType === 'CGPA' ? (
            <TextField
              label="CGPA"
              required
              placeholder="e.g. 3.42"
              keyboardType="decimal-pad"
              value={editing.cgpa}
              onChangeText={(t) => setField('cgpa', t)}
            />
          ) : editing.resultType === 'Marks' ? (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Obtained Marks"
                  required
                  placeholder="1050"
                  keyboardType="number-pad"
                  value={editing.obtainedMarks}
                  onChangeText={(t) => setField('obtainedMarks', t.replace(/\D/g, ''))}
                />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <TextField
                  label="Total Marks"
                  required
                  placeholder="1100"
                  keyboardType="number-pad"
                  value={editing.totalMarks}
                  onChangeText={(t) => setField('totalMarks', t.replace(/\D/g, ''))}
                />
              </View>
            </View>
          ) : (
            <TextField
              label="Grade"
              required
              placeholder="e.g. A"
              autoCapitalize="characters"
              value={editing.grade}
              onChangeText={(t) => setField('grade', t)}
            />
          )}

          <View style={styles.editorButtons}>
            <Button label="Cancel" variant="secondary" small onPress={() => { setEditing(null); setLocalErrors({}); }} style={{ flex: 1 }} />
            <Button label="Save record" icon="checkmark" small onPress={saveRecord} style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <Button
          label="Add education record"
          variant="secondary"
          icon="add"
          onPress={() => setEditing(emptyRecord())}
          style={styles.addBtn}
        />
      )}
    </ScrollView>
  );
}

const shadowCard = {
  backgroundColor: colors.surface,
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: colors.border,
};

const styles = StyleSheet.create({
  body: {
    paddingBottom: spacing.lg,
  },
  noteCard: {
    backgroundColor: colors.greenSoft,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.green,
  },
  noteText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.greenDark,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.errorBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.error,
  },
  recordCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  recordTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.greenSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  levelPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.greenDark,
  },
  recordIndex: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textMuted,
  },
  recordTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  recordSub: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recordMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  recordActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm + 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.navyMuted,
  },
  editorCard: {
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  editorTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  editorButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  addBtn: {
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
});
