import { useEffect } from 'react';
import { Animated, StyleSheet, useAnimatedValue, View } from 'react-native';

/** Soft, slow-moving decorative circles used behind every app screen. */
export function AmbientBackground() {
  const driftA = useAnimatedValue(0);
  const driftB = useAnimatedValue(0);

  useEffect(() => {
    const animationA = Animated.loop(
      Animated.sequence([
        Animated.timing(driftA, { toValue: 1, duration: 6200, useNativeDriver: true }),
        Animated.timing(driftA, { toValue: 0, duration: 6200, useNativeDriver: true }),
      ]),
    );
    const animationB = Animated.loop(
      Animated.sequence([
        Animated.timing(driftB, { toValue: 1, duration: 7800, useNativeDriver: true }),
        Animated.timing(driftB, { toValue: 0, duration: 7800, useNativeDriver: true }),
      ]),
    );

    animationA.start();
    animationB.start();
    return () => {
      animationA.stop();
      animationB.stop();
    };
  }, [driftA, driftB]);

  return (
    <View pointerEvents="none" style={styles.layer}>
      <Animated.View
        style={[
          styles.orb,
          styles.purpleOrb,
          {
            transform: [
              { translateX: driftA.interpolate({ inputRange: [0, 1], outputRange: [0, 13] }) },
              { translateY: driftA.interpolate({ inputRange: [0, 1], outputRange: [0, -17] }) },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.pinkOrb,
          {
            transform: [
              { translateX: driftB.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
              { translateY: driftB.interpolate({ inputRange: [0, 1], outputRange: [0, 15] }) },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.smallOrb,
          styles.tealOrb,
          {
            transform: [
              { translateX: driftA.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
              { translateY: driftB.interpolate({ inputRange: [0, 1], outputRange: [0, -11] }) },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
  },
  purpleOrb: {
    top: '13%',
    right: -64,
    backgroundColor: '#D8CEFF',
    opacity: 0.43,
  },
  pinkOrb: {
    top: '46%',
    left: -90,
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: '#FFD1E2',
    opacity: 0.32,
  },
  smallOrb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  tealOrb: {
    right: 10,
    bottom: '19%',
    backgroundColor: '#70D8E2',
    opacity: 0.75,
  },
});
