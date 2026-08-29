import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';

interface Props {
  title: string;
  navigation: NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList>;
  subtitle?: string;
}

/** Deep-green header bar with a back button for pushed stack screens. */
export default function ScreenHeader({ title, subtitle, navigation }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.row}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={({ pressed }) => [styles.backBtn, pressed && { backgroundColor: 'rgba(255,255,255,0.28)' }]}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.greenDeep,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12.5,
    marginTop: 2,
  },
});
