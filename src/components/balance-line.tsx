import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, useAnimatedValue } from 'react-native';

import { Palette } from '@/constants/palette';

const BALL_SIZE = 24;
const EDGE_PADDING = 18;
const WRAPPER_HEIGHT = 34;

/** Línea punteada con la pelota dorada tambaleándose de lado a lado. */
export function BalanceLine() {
  const [width, setWidth] = useState(0);
  const progress = useAnimatedValue(0);

  useEffect(() => {
    if (width === 0) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [progress, width]);

  const travel = Math.max(0, width - BALL_SIZE - EDGE_PADDING * 2);
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [EDGE_PADDING, EDGE_PADDING + travel],
  });
  const scale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.12, 1],
  });

  return (
    <View style={styles.wrapper} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <View style={styles.line} />
      <View style={styles.endDot} />
      <Animated.View style={[styles.ball, { transform: [{ translateX }, { scale }] }]}>
        <LinearGradient
          colors={Palette.ball}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.ballFill}>
          <View style={styles.ballHighlight} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: WRAPPER_HEIGHT,
    width: '88%',
    maxWidth: 340,
    alignSelf: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  line: {
    height: 0,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: Palette.line,
    marginHorizontal: 6,
  },
  endDot: {
    position: 'absolute',
    right: 2,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Palette.pinkDot,
  },
  ball: {
    position: 'absolute',
    top: (WRAPPER_HEIGHT - BALL_SIZE) / 2,
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    shadowColor: '#E0A21B',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ballFill: {
    flex: 1,
    borderRadius: BALL_SIZE / 2,
    padding: 5,
  },
  ballHighlight: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
});
