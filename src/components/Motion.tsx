import { memo, useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface CardInProps {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/** Card that springs in with a fade + slide-up on mount. */
export const CardIn = memo(function CardIn({ children, delay = 0, style }: CardInProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay)
        .springify()
        .damping(17)
        .stiffness(150)}
      style={style}
    >
      {children}
    </Animated.View>
  );
});

interface TapCardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

/** Pressable card that scales down and darkens while touched. */
export function TapCard({ children, onPress, style, disabled }: TapCardProps) {
  const scale = useSharedValue(1);
  const shade = useSharedValue(0);
  const flatRadius = StyleSheet.flatten(style)?.borderRadius;
  const shadeStyle = useAnimatedStyle(() => ({
    opacity: shade.value * 0.14,
  }));
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 20, stiffness: 380 });
        shade.value = withTiming(1, { duration: 110 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 300 });
        shade.value = withTiming(0, { duration: 180 });
      }}
    >
      <Animated.View style={[animatedStyle, style]}>
        {children}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: '#04150D',
              borderRadius: typeof flatRadius === 'number' ? flatRadius : 18,
              opacity: 0,
            },
            shadeStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

interface PulseProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Loop duration in ms for the gentle breathing effect. */
  duration?: number;
}

/** Wrapper with a subtle looping "breathing" scale — used for hero icons. */
export function Breathe({ children, style, duration = 2200 }: PulseProps) {
  const progress = useSharedValue(1);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: duration / 2, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progress.value }],
  }));
  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
