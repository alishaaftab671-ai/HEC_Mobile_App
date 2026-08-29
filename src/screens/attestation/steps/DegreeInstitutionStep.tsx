import { ScrollView, StyleSheet, Text, View } from 'react-native';

import SelectField from '../../../components/SelectField';
import TextField from '../../../components/TextField';
import SectionCard from '../../../components/SectionCard';
import { EDUCATION_LEVELS, RESULT_TYPES } from '../wizardOptions';
import { UNIVERSITIES } from '../../../data/mockData';
import { colors, spacing } from '../../../theme';
import type { StepProps } from '../stepProps';
import type { Option } from '../../../components/SelectField';

const UNIVERSITY_OPTIONS: Option<string>[] = UNIVERSITIES.map((u) => ({
  value: u.id,
  label: `${u.name} — ${u.city}`,
}));

const YEAR_RE = /^\d{4}$/;

export function validate(form: StepProps['form']): Record<string, string> {
  const e: Record<string, string> = {};
  const d = form.degree;
  const inst = form.institution;

  if (!d.degreeTitle.trim()) e.degreeTitle = 'Enter the degree title.';
  if (!d.major.trim()) e.major = 'Enter your major / specialization.';
  if (!YEAR_RE.test(d.sessionFrom)) e.sessionFrom = 'YYYY';
  if (!YEAR_RE.test(d.sessionTo)) e.sessionTo = 'YYYY';
  if (!YEAR_RE.test(d.passingYear)) e.passingYear = 'Enter a 4-digit year.';
  if (d.resultType === 'CGPA' && !d.cgpa.trim()) e.cgpa = 'Required';
  if (d.resultType === 'Marks') {
    if (!d.obtainedMarks.trim()) e.obtainedMarks = 'Required';
    if (!d.totalMarks.trim()) e.totalMarks = 'Required';
  }
  if (d.resultType === 'Grade' && !d.grade.trim()) e.grade = 'Required';

  if (!inst.universityId) e.universityName = 'Select your university.';
  if (!inst.campus.trim()) e.campus = 'Enter campus / main.';
  if (!inst.city.trim()) e.instCity = 'Enter the city of study.';
  if (!inst.rollNo.trim()) e.rollNo = 'Enter your university roll number.';

  return e;
}

export default function DegreeInstitutionStep({ form, update, errors }: StepProps) {
  const d = form.degree;
  const inst = form.institution;
  const selectedUni = UNIVERSITIES.find((u) => u.id === inst.universityId);

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <SectionCard title="Degree details">
        <TextField
          label="Degree Title"
          required
          placeholder="e.g. BS Computer Science"
          value={d.degreeTitle}
          onChangeText={(t) => update({ degree: { ...d, degreeTitle: t } })}
          error={errors.degreeTitle}
        />
        <SelectField
          label="Level"
          required
          value={d.level}
          options={EDUCATION_LEVELS}
          onSelect={(v) => update({ degree: { ...d, level: v } })}
        />
        <TextField
          label="Major / Specialization"
          required
          placeholder="e.g. Computer Science"
          value={d.major}
          onChangeText={(t) => update({ degree: { ...d, major: t } })}
          error={errors.major}
        />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Session From"
              required
              placeholder="2020"
              keyboardType="number-pad"
              maxLength={4}
              value={d.sessionFrom}
              onChangeText={(t) => update({ degree: { ...d, sessionFrom: t.replace(/\D/g, '') } })}
              error={errors.sessionFrom}
            />
          </View>
          <View style={{ width: spacing.md }} />
          <View style={{ flex: 1 }}>
            <TextField
              label="Session To"
              required
              placeholder="2024"
              keyboardType="number-pad"
              maxLength={4}
              value={d.sessionTo}
              onChangeText={(t) => update({ degree: { ...d, sessionTo: t.replace(/\D/g, '') } })}
              error={errors.sessionTo}
            />
          </View>
        </View>
        <TextField
          label="Passing Year"
          required
          placeholder="Year degree was awarded"
          keyboardType="number-pad"
          maxLength={4}
          value={d.passingYear}
          onChangeText={(t) => update({ degree: { ...d, passingYear: t.replace(/\D/g, '') } })}
          error={errors.passingYear}
        />

        <SelectField
          label="Result Type"
          required
          value={d.resultType}
          options={RESULT_TYPES}
          onSelect={(v) => update({ degree: { ...d, resultType: v } })}
        />
        {d.resultType === 'CGPA' ? (
          <TextField
            label="CGPA"
            required
            placeholder="e.g. 3.42 out of 4.00"
            keyboardType="decimal-pad"
            value={d.cgpa}
            onChangeText={(t) => update({ degree: { ...d, cgpa: t } })}
            error={errors.cgpa}
          />
        ) : d.resultType === 'Marks' ? (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Obtained Marks"
                required
                placeholder="1050"
                keyboardType="number-pad"
                value={d.obtainedMarks}
                onChangeText={(t) => update({ degree: { ...d, obtainedMarks: t.replace(/\D/g, '') } })}
                error={errors.obtainedMarks}
              />
            </View>
            <View style={{ width: spacing.md }} />
            <View style={{ flex: 1 }}>
              <TextField
                label="Total Marks"
                required
                placeholder="1100"
                keyboardType="number-pad"
                value={d.totalMarks}
                onChangeText={(t) => update({ degree: { ...d, totalMarks: t.replace(/\D/g, '') } })}
                error={errors.totalMarks}
              />
            </View>
          </View>
        ) : (
          <TextField
            label="Grade"
            required
            placeholder="e.g. A"
            autoCapitalize="characters"
            value={d.grade}
            onChangeText={(t) => update({ degree: { ...d, grade: t } })}
            error={errors.grade}
          />
        )}
      </SectionCard>

      <SectionCard title="Institution" style={styles.gap}>
        <Text style={styles.sectionNote}>
          Select the chartered Pakistani university that issued your degree.
        </Text>
        <SelectField
          label="University"
          required
          value={inst.universityId}
          options={UNIVERSITY_OPTIONS}
          placeholder={selectedUni ? selectedUni.name : 'Select university'}
          onSelect={(id) => {
            const uni = UNIVERSITIES.find((u) => u.id === id);
            update({
              institution: { ...inst, universityId: id, universityName: uni?.name ?? '', city: uni?.city ?? '' },
            });
          }}
          error={errors.universityName}
        />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Campus"
              required
              placeholder="Main / City campus"
              value={inst.campus}
              onChangeText={(t) => update({ institution: { ...inst, campus: t } })}
              error={errors.campus}
            />
          </View>
          <View style={{ width: spacing.md }} />
          <View style={{ flex: 1 }}>
            <TextField
              label="City of Study"
              required
              placeholder="City"
              value={inst.city}
              onChangeText={(t) => update({ institution: { ...inst, city: t } })}
              error={errors.instCity}
            />
          </View>
        </View>
        <TextField
          label="University Roll Number"
          required
          placeholder="As printed on your degree"
          autoCapitalize="characters"
          value={inst.rollNo}
          onChangeText={(t) => update({ institution: { ...inst, rollNo: t.toUpperCase() } })}
          error={errors.rollNo}
        />
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingBottom: spacing.lg,
  },
  gap: {
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  sectionNote: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.md,
    marginTop: -spacing.xs,
  },
});
