import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SectionCard from '../../components/SectionCard';
import { CardIn } from '../../components/Motion';
import { ANNOUNCEMENTS, FAQS } from '../../data/mockData';
import { colors, radius, shadow, spacing } from '../../theme';
import { formatDate } from '../../utils/formatters';

const CATEGORIES = ['All', 'Degree Attestation', 'Payments', 'Account', 'Equivalence'];

export default function HelpScreen() {
  const [category, setCategory] = useState('All');
  const [openId, setOpenId] = useState<string | null>(null);

  const faqs = useMemo(
    () => (category === 'All' ? FAQS : FAQS.filter((f) => f.category === category)),
    [category],
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help & Announcements</Text>
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Latest announcements</Text>
        {ANNOUNCEMENTS.map((a, i) => (
          <CardIn key={a.id} delay={Math.min(i, 5) * 70} style={{ marginBottom: spacing.sm }}>
            <AnnouncementCard tag={a.tag} title={a.title} body={a.body} date={formatDate(a.date)} />
          </CardIn>
        ))}

        <Text style={styles.sectionTitle}>Frequently asked questions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {faqs.map((f, i) => {
          const open = openId === f.id;
          return (
            <CardIn key={f.id} delay={Math.min(i, 8) * 45} style={{ marginBottom: spacing.sm }}>
              <Pressable
                style={[styles.faq, shadow.card, open && styles.faqOpen]}
                onPress={() => setOpenId(open ? null : f.id)}
              >
                <View style={styles.faqHeader}>
                  <Ionicons
                    name="help-circle"
                    size={17}
                    color={open ? colors.green : colors.navyMuted}
                    style={{ marginTop: 1 }}
                  />
                  <Text style={[styles.question, open && { color: colors.greenDark }]}>{f.question}</Text>
                  <Ionicons name={open ? 'remove' : 'add'} size={18} color={colors.textMuted} />
                </View>
                {open ? <Text style={styles.answer}>{f.answer}</Text> : null}
              </Pressable>
            </CardIn>
          );
        })}

        <SectionCard title="Still need help?" style={{ marginTop: spacing.lg }}>
          <View style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <Ionicons name="call" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.contactLabel}>Helpline</Text>
              <Text style={styles.contactValue}>051-111-119-432 · Mon–Fri 9am–5pm</Text>
            </View>
          </View>
          <View style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <Ionicons name="mail" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>eservices@hec.gov.pk</Text>
            </View>
          </View>
        </SectionCard>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function AnnouncementCard({ tag, title, body, date }: { tag: string; title: string; body: string; date: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable style={[styles.annCard, shadow.card]} onPress={() => setExpanded((e) => !e)}>
      <View style={styles.tagPill}>
        <Text style={styles.tagText}>{tag}</Text>
      </View>
      <Text style={styles.annTitle}>{title}</Text>
      <Text numberOfLines={expanded ? undefined : 2} style={styles.annBody}>
        {body}
      </Text>
      <Text style={styles.annDate}>{date}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.greenDeep,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg + 22,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },
  body: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  annCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.mantisSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4E8F3D',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  annTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  annBody: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  annDate: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  faq: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqOpen: {
    borderColor: colors.green,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  question: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 19,
  },
  answer: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginTop: spacing.sm,
    paddingLeft: spacing.sm + 17,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  contactIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green,
  },
  contactLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  contactValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
});
