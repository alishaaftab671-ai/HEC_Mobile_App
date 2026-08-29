import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

interface LoadingBarProps {
  visible?: boolean;
  height?: number;
  color1?: string;
  color2?: string;
}

export default function LoadingBar({
  visible = true,
  height = 4,
  color1 = colors.lime,
  color2 = colors.green,
}: LoadingBarProps) {
  const translateX = useSharedValue(-200);

  useEffect(() => {
    if (visible) {
      translateX.value = -200;
      translateX.value = withRepeat(
        withTiming(400, {
          duration: 1100,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        -1,
        false
      );
    }
  }, [visible, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (!visible) return null;

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View style={[styles.bar, animatedStyle]}>
        <LinearGradient
          colors={[color1, color2, color1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(0, 144, 73, 0.15)',
    overflow: 'hidden',
    position: 'relative',
  },
  bar: {
    width: 200,
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    flex: 1,
  },
});
