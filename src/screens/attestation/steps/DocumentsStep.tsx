import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { colors, radius, spacing } from '../../../theme';
import type { DocSlot, UploadedDocMeta } from '../../../types/models';
import type { StepProps } from '../stepProps';
import type { RootStackParamList } from '../../../types/navigation';
import { formatFileSize } from '../../../utils/formatters';
import { uid } from '../../../utils/id';
import { extractTextFromImage } from '../../../services/ocr';

const REQUIRED_SLOTS: { slot: DocSlot; label: string; desc: string }[] = [
  { slot: 'degreeCertificate', label: 'Original Degree Certificate', desc: 'Complete certificate, all corners visible' },
  { slot: 'transcript', label: 'Final Transcript / DMC', desc: 'Detailed marks certificate or final transcript' },
  { slot: 'cnicFront', label: 'CNIC — Front Side', desc: 'Photo side of a valid CNIC' },
  { slot: 'cnicBack', label: 'CNIC — Back Side', desc: 'Address side of the same CNIC' },
];

const SUPPORTING_SLOT: { slot: DocSlot; label: string; desc: string } = {
  slot: 'supporting',
  label: 'Supporting Documents (Optional)',
  desc: 'Any additional letter requested by the receiving authority',
};

const DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_BYTES = 5 * 1024 * 1024;

export function validate(form: StepProps['form']): Record<string, string> {
  const e: Record<string, string> = {};
  for (const s of REQUIRED_SLOTS) {
    if (!form.documents.some((d) => d.slot === s.slot)) {
      e[s.slot] = `Upload ${s.label.toLowerCase()}.`;
    }
  }
  return e;
}

export default function DocumentsStep({ form, update, errors }: StepProps) {
  const navigation = useNavigation<NativeStackScreenProps<RootStackParamList>['navigation']>();
  const [busySlot, setBusySlot] = useState<DocSlot | null>(null);
  const [ocrSlot, setOcrSlot] = useState<DocSlot | null>(null);

  const addDoc = (slot: DocSlot, meta: Omit<UploadedDocMeta, 'id' | 'uploadedAt'>) => {
    const doc: UploadedDocMeta = { ...meta, id: uid(), uploadedAt: new Date().toISOString() };
    update({ documents: [...form.documents.filter((d) => d.slot !== slot), doc] });
  };

  const removeDoc = (slot: DocSlot) => {
    update({ documents: form.documents.filter((d) => d.slot !== slot) });
  };

  const runOcr = async (doc: UploadedDocMeta) => {
    setOcrSlot(doc.slot);
    try {
      const extractedText = await extractTextFromImage(doc.uri);
      update({
        documents: form.documents.map((item) => item.id === doc.id ? { ...item, extractedText } : item),
      });
      if (!extractedText) Alert.alert('No text found', 'Try a clearer, well-lit photo with all text visible.');
    } catch {
      Alert.alert('OCR unavailable', 'Text recognition needs a development build with ML Kit enabled. You can still upload the document normally.');
    } finally {
      setOcrSlot(null);
    }
  };

  const updateExtractedText = (doc: UploadedDocMeta, extractedText: string) => {
    update({
      documents: form.documents.map((item) => item.id === doc.id ? { ...item, extractedText } : item),
    });
  };

  const checkAndAdd = (slot: DocSlot, name: string, size: number | undefined, mimeType: string | undefined, uri: string) => {
    if (size && size > MAX_BYTES) {
      Alert.alert('File too large', `"${name}" is ${formatFileSize(size)}. Maximum allowed size is 5 MB.`);
      return;
    }
    addDoc(slot, {
      slot,
      name,
      size: size ?? 0,
      mimeType: mimeType ?? guessMime(name),
      uri,
    });
  };

  const pickFile = async (slot: DocSlot) => {
    setBusySlot(slot);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: DOC_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!res.canceled && res.assets.length > 0) {
        const a = res.assets[0];
        checkAndAdd(slot, a.name, a.size, a.mimeType, a.uri);
      }
    } finally {
      setBusySlot(null);
    }
  };

  const pickImage = async (slot: DocSlot, source: 'library' | 'camera') => {
    setBusySlot(slot);
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission needed', 'Camera access is required to take photos of your documents.');
          return;
        }
        const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
        if (!res.canceled && res.assets.length > 0) {
          const a = res.assets[0];
          checkAndAdd(slot, a.fileName ?? 'photo.jpg', a.fileSize, a.mimeType ?? 'image/jpeg', a.uri);
        }
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (!res.canceled && res.assets.length > 0) {
        const a = res.assets[0];
        checkAndAdd(slot, a.fileName ?? 'image.jpg', a.fileSize, a.mimeType ?? 'image/jpeg', a.uri);
      }
    } finally {
      setBusySlot(null);
    }
  };

  const showSourceSheet = (slot: DocSlot) => {
    Alert.alert('Upload document', 'Choose a source for this scan.', [
      { text: 'Take photo', onPress: () => void pickImage(slot, 'camera') },
      { text: 'Choose photo', onPress: () => void pickImage(slot, 'library') },
      { text: 'Browse file (PDF)', onPress: () => void pickFile(slot) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          Upload clear colour scans — JPG or PDF, max 5 MB each. For images, use Extract text (OCR) to read the
          document automatically and review the result before continuing.
        </Text>
      </View>

      {[...REQUIRED_SLOTS, SUPPORTING_SLOT].map((s) => {
        const doc = form.documents.find((d) => d.slot === s.slot);
        return (
          <View key={s.slot} style={[styles.slotCard, errors[s.slot] && styles.slotCardError]}>
            <View style={styles.slotTop}>
              <View style={[styles.slotIcon, doc && styles.slotIconDone]}>
                <Ionicons name={doc ? 'checkmark-sharp' : 'cloud-upload-outline'} size={19} color={colors.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.slotLabel}>{s.label}</Text>
                <Text style={styles.slotDesc}>{s.desc}</Text>
              </View>
            </View>

            {doc ? (
              <View>
                <View style={styles.fileChip}>
                  <Ionicons name={isPdf(doc.mimeType) ? 'document-text' : 'image-outline'} size={17} color={colors.greenDark} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fileName} numberOfLines={1}>{doc.name}</Text>
                    <Text style={styles.fileMeta}>{formatFileSize(doc.size)}</Text>
                  </View>
                  <Pressable hitSlop={10} onPress={() => removeDoc(s.slot)}>
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </Pressable>
                </View>
                {!isPdf(doc.mimeType) ? (
                  <>
                    <Pressable style={styles.ocrBtn} onPress={() => void runOcr(doc)} disabled={ocrSlot === doc.slot}>
                      {ocrSlot === doc.slot ? <ActivityIndicator size="small" color={colors.green} /> : <Ionicons name="scan-outline" size={16} color={colors.green} />}
                      <Text style={styles.ocrBtnText}>{ocrSlot === doc.slot ? 'Reading text...' : 'Extract text (OCR)'}</Text>
                    </Pressable>
                    {doc.extractedText !== undefined ? (
                      <View style={styles.ocrResult}>
                        <View style={styles.ocrResultHeader}>
                          <Ionicons name="sparkles-outline" size={15} color={colors.greenDark} />
                          <Text style={styles.ocrResultTitle}>Recognized text</Text>
                        </View>
                        <TextInput
                          multiline
                          value={doc.extractedText}
                          onChangeText={(value) => updateExtractedText(doc, value)}
                          placeholder="No text recognized"
                          placeholderTextColor={colors.textMuted}
                          style={styles.ocrInput}
                        />
                      </View>
                    ) : null}
                  </>
                ) : null}
              </View>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.uploadBtn, pressed && { opacity: 0.7 }, busySlot === s.slot && styles.uploadBusy]}
                  onPress={() => showSourceSheet(s.slot)}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.uploadBtnText}>Upload scan</Text>
                </Pressable>
                {errors[s.slot] ? <Text style={styles.error}>{errors[s.slot]}</Text> : null}
              </>
            )}
          </View>
        );
      })}

      <Pressable style={styles.helpRow} onPress={() => navigation.navigate('Main', { screen: 'HelpTab' })} hitSlop={6}>
        <Ionicons name="help-circle-outline" size={15} color={colors.textMuted} />
        <Text style={styles.helpText}>Scanning tips are available in Help & FAQs.</Text>
      </Pressable>
    </ScrollView>
  );
}

function isPdf(mime: string): boolean {
  return mime.includes('pdf');
}

function guessMime(name: string): string {
  return /\.pdf$/i.test(name) ? 'application/pdf' : 'image/jpeg';
}

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
  slotCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  slotCardError: {
    borderColor: colors.error,
  },
  slotTop: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
    alignItems: 'flex-start',
  },
  slotIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.green,
  },
  slotIconDone: {
    backgroundColor: colors.greenSoft,
    borderColor: colors.greenSoft,
  },
  slotLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  slotDesc: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.green,
    borderRadius: radius.sm,
    paddingVertical: 10,
    marginTop: spacing.sm + 2,
  },
  uploadBusy: {
    opacity: 0.5,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.mantisSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.sm + 2,
  },
  fileName: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  fileMeta: {
    fontSize: 11,
    color: colors.textMuted,
  },
  ocrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: radius.sm,
    paddingVertical: 9,
    marginTop: spacing.sm,
  },
  ocrBtnText: {
    color: colors.greenDark,
    fontSize: 12.5,
    fontWeight: '700',
  },
  ocrResult: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ocrResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  ocrResultTitle: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: '800',
  },
  ocrInput: {
    minHeight: 74,
    maxHeight: 150,
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 7,
    color: colors.textPrimary,
    fontSize: 12.5,
    lineHeight: 18,
    textAlignVertical: 'top',
  },
  error: {
    marginTop: 5,
    fontSize: 12,
    color: colors.error,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  helpText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
