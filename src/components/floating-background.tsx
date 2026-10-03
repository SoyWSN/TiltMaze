import { useEffect } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  useAnimatedValue,
  type ViewProps,
} from 'react-native';

import { Palette } from '@/constants/palette';

type CircleConfig = {
  color: string;
  size: number;
  opacity: number;
  duration: number;
  dx: number;
  dy: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

/** Círculos pastel que flotan suavemente detrás del contenido. */
const CIRCLES: CircleConfig[] = [
  { color: '#F7A8CE', size: 132, top: 36, right: -52, opacity: 0.45, duration: 5200, dx: 16, dy: 22 },
  { color: '#BFA8F5', size: 96, top: 206, left: -48, opacity: 0.4, duration: 6400, dx: 22, dy: 16 },
  { color: '#8FE3EC', size: 150, bottom: 24, left: -62, opacity: 0.38, duration: 7200, dx: 24, dy: 26 },
  { color: '#F7A8CE', size: 30, bottom: 208, right: 26, opacity: 0.75, duration: 4200, dx: 10, dy: 14 },
  { color: '#8FE3EC', size: 42, top: 430, right: -18, opacity: 0.6, duration: 5600, dx: 12, dy: 18 },
  { color: '#F6DD8B', size: 74, top: 318, left: 18, opacity: 0.32, duration: 7600, dx: 18, dy: 20 },
];

function FloatingCircle({ config }: { config: CircleConfig }) {
  const progress = useAnimatedValue(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: config.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: config.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [config.duration, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-config.dx, config.dx],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-config.dy, config.dy],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.circle,
        {
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: config.color,
          opacity: config.opacity,
          top: config.top,
          bottom: config.bottom,
          left: config.left,
          right: config.right,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    />
  );
}

/** Envuelve el contenido de una pantalla con el fondo animado de la app. */
export function FloatingBackground({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[styles.container, style]} {...rest}>
      {CIRCLES.map((config, index) => (
        <FloatingCircle key={index} config={config} />
      ))}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  circle: {
    position: 'absolute',
  },
});
