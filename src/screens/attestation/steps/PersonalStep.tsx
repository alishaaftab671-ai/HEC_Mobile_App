import { ScrollView, StyleSheet, Text, View } from 'react-native';

import SelectField from '../../../components/SelectField';
import TextField from '../../../components/TextField';
import DateField from '../../../components/DateField';
import { CITY_BY_PROVINCE } from '../../../data/mockData';
import { GENDERS, NATIONALITIES } from '../wizardOptions';
import { colors, radius, spacing } from '../../../theme';
import type { StepProps } from '../stepProps';
import { formatCNIC } from '../../../utils/formatters';

export default function PersonalStep({ form, update, errors }: StepProps) {
  const p = form.personal;
  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          Enter your details exactly as printed on your CNIC. Mismatched records are the most common
          reason attestation requests are returned.
        </Text>
      </View>

      <TextField
        label="Full Name"
        required
        placeholder="As per CNIC"
        autoCapitalize="words"
        value={p.fullName}
        onChangeText={(t) => update({ personal: { ...p, fullName: t } })}
        error={errors.fullName}
      />
      <TextField
        label="Father's Name"
        required
        placeholder="As per CNIC"
        autoCapitalize="words"
        value={p.fatherName}
        onChangeText={(t) => update({ personal: { ...p, fatherName: t } })}
        error={errors.fatherName}
      />
      <TextField
        label="CNIC Number"
        required
        placeholder="35202-1234567-1"
        keyboardType="number-pad"
        value={p.cnic}
        onChangeText={(t) => update({ personal: { ...p, cnic: formatCNIC(t) } })}
        error={errors.cnic}
      />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <DateField
            label="Date of Birth"
            required
            value={p.dob}
            onChange={(dob) => update({ personal: { ...p, dob } })}
            error={errors.dob}
          />
        </View>
        <View style={{ width: spacing.lg }} />
        <View style={{ flex: 1 }}>
          <SelectField
            label="Gender"
            required
            value={p.gender}
            options={GENDERS}
            onSelect={(g) => update({ personal: { ...p, gender: g } })}
            error={errors.gender}
          />
        </View>
      </View>
      <SelectField
        label="Nationality"
        value={p.nationality}
        options={NATIONALITIES}
        onSelect={(n) => update({ personal: { ...p, nationality: n } })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingBottom: spacing.md,
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
  row: {
    flexDirection: 'row',
  },
});
