import { ScrollView, StyleSheet } from 'react-native';

import SelectField from '../../../components/SelectField';
import TextField from '../../../components/TextField';
import { CITY_BY_PROVINCE, PROVINCES } from '../../../data/mockData';
import { spacing } from '../../../theme';
import type { StepProps } from '../stepProps';
import { formatPhone } from '../../../utils/formatters';

export default function ContactStep({ form, update, errors }: StepProps) {
  const c = form.contact;
  const cities = c.province ? (CITY_BY_PROVINCE[c.province] ?? []) : [];

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <TextField
        label="Email Address"
        required
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={c.email}
        onChangeText={(t) => update({ contact: { ...c, email: t } })}
        error={errors.email}
      />
      <TextField
        label="Mobile Number"
        required
        placeholder="0300-1234567"
        keyboardType="number-pad"
        value={c.phone}
        onChangeText={(t) => update({ contact: { ...c, phone: formatPhone(t) } })}
        error={errors.phone}
        hint="Status updates will be sent here."
      />
      <TextField
        label="Alternate Phone"
        placeholder="Optional"
        keyboardType="number-pad"
        value={c.altPhone}
        onChangeText={(t) => update({ contact: { ...c, altPhone: formatPhone(t) } })}
      />
      <TextField
        label="Postal Address"
        required
        placeholder="House, street, area"
        multiline
        value={c.address}
        onChangeText={(t) => update({ contact: { ...c, address: t } })}
        error={errors.address}
      />
      <SelectField
        label="Province"
        required
        value={c.province}
        options={PROVINCES}
        onSelect={(v) => update({ contact: { ...c, province: v, city: '' } })}
        error={errors.province}
      />
      <SelectField
        label="City"
        required
        value={c.city}
        options={cities}
        placeholder={c.province ? 'Select city' : 'Select province first'}
        onSelect={(v) => update({ contact: { ...c, city: v } })}
        error={errors.city}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingBottom: spacing.lg,
  },
});
