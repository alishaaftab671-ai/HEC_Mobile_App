import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Share, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import StatusBadge from '../../components/StatusBadge';
import { CardIn } from '../../components/Motion';
import { useApp } from '../../context/AppContext';
import { colors, gradients, radius, shadow, spacing } from '../../theme';
import type { RootStackParamList } from '../../types/navigation';
import { formatDate } from '../../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'ApplicationStatusDetail'>;

export default function ApplicationStatusDetailScreen({ route, navigation }: Props) {
  const { applicationId } = route.params;
  const insets = useSafeAreaInsets();
  const { applications } = useApp();

  const [modalVisible, setModalVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const app = applications.find((a) => a.id === applicationId) || applications[0];
  const estimatedCompletion = new Date(new Date(app.submittedAt).getTime() + 14 * 24 * 3600 * 1000).toISOString();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `HEC Application Status - Ref: ${app.referenceId} (${app.serviceName}). Status: ${app.status}.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setModalVisible(true);
    }, 1200);
  };

  return (
    <View style={styles.root}>
      <LinearGradient style={styles.background} colors={gradients.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Application Detail</Text>
            <Text style={styles.headerSub}>{app.referenceId}</Text>
          </View>
          <Pressable onPress={handleShare} hitSlop={8} style={styles.shareBtn}>
            <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing.xl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Overview Card */}
          <CardIn>
            <View style={[styles.mainCard, shadow.card]}>
              <View style={styles.rowBetween}>
                <Text style={styles.serviceName}>{app.serviceName}</Text>
                <StatusBadge status={app.status} />
              </View>

              <View style={styles.metaDivider} />

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Submitted On</Text>
                  <Text style={styles.infoVal}>{formatDate(app.submittedAt)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Estimated Decision</Text>
                   <Text style={styles.infoVal}>{formatDate(estimatedCompletion)}</Text>
                </View>
              </View>

              {app.status === 'Completed' ? (
                <Pressable
                  style={[styles.downloadCertBtn, downloaded && styles.downloadedBtn]}
                  onPress={handleDownload}
                  disabled={downloading}
                >
                  <Ionicons
                    name={downloading ? 'reload-outline' : 'download-outline'}
                    size={18}
                    color="#FFFFFF"
                    style={downloading ? styles.spinning : undefined}
                  />
                  <Text style={styles.downloadCertText}>
                    {downloading ? 'Downloading Certificate...' : downloaded ? 'Certificate Downloaded ✓' : 'Download Verified Certificate'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </CardIn>

          {/* Timeline / Progress Steps */}
          <CardIn delay={100}>
            <View style={[styles.timelineCard, shadow.card]}>
              <Text style={styles.sectionTitle}>Application Timeline</Text>
              
              <View style={styles.timelineList}>
                {app.timeline.map((item, index) => {
                  const isDone = item.state === 'done' || item.state === 'current';
                  const isLast = index === app.timeline.length - 1;

                  return (
                    <View key={index} style={styles.timelineRow}>
                      <View style={styles.timelineIndicatorCol}>
                        <View style={[styles.timelineNode, isDone ? styles.nodeDone : styles.nodePending]}>
                          <Ionicons
                            name={isDone ? 'checkmark' : 'ellipse'}
                            size={isDone ? 14 : 8}
                            color={isDone ? '#FFFFFF' : colors.textMuted}
                          />
                        </View>
                        {!isLast ? <View style={[styles.timelineLine, isDone ? styles.lineDone : styles.linePending]} /> : null}
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={[styles.timelineTitle, !isDone && styles.textMuted]}>{item.label}</Text>
                        <Text style={styles.timelineDate}>{item.date ? formatDate(item.date) : 'Pending'}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </CardIn>
        </ScrollView>
      </LinearGradient>

      {/* Success Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="checkmark-circle" size={48} color={colors.green} />
            </View>
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalBody}>Your verified certificate has been downloaded successfully to your device.</Text>
            <Pressable style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  background: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11.5, fontWeight: '600' },
  body: { padding: spacing.lg },
  mainCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceName: { fontSize: 16, fontWeight: '900', color: colors.textPrimary, flex: 1, marginRight: 8 },
  metaDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  infoVal: { fontSize: 13.5, fontWeight: '800', color: colors.textPrimary, marginTop: 2 },
  downloadCertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
    gap: 8,
  },
  downloadedBtn: { backgroundColor: colors.greenDark },
  downloadCertText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '800' },
  spinning: { transform: [{ rotate: '45deg' }] },
  timelineCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: colors.textPrimary, marginBottom: spacing.md },
  timelineList: { paddingLeft: 4 },
  timelineRow: { flexDirection: 'row', minHeight: 60 },
  timelineIndicatorCol: { alignItems: 'center', marginRight: spacing.md },
  timelineNode: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  nodeDone: { backgroundColor: colors.green },
  nodePending: { backgroundColor: colors.border },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.green, marginVertical: 2 },
  lineDone: { backgroundColor: colors.green },
  linePending: { backgroundColor: colors.border },
  timelineContent: { flex: 1, paddingBottom: spacing.md },
  timelineTitle: { fontSize: 13.5, fontWeight: '800', color: colors.textPrimary },
  timelineDate: { fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
  textMuted: { color: colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, width: '100%', maxWidth: 340, alignItems: 'center' },
  modalIconWrap: { marginBottom: spacing.md },
  modalTitle: { fontSize: 20, fontWeight: '900', color: colors.textPrimary, marginBottom: 4 },
  modalBody: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  modalCloseBtn: { backgroundColor: colors.navy, borderRadius: radius.md, paddingVertical: spacing.sm + 4, width: '100%', alignItems: 'center' },
  modalCloseText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
