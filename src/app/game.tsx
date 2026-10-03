import { Canvas, Circle, Path, Rect } from '@shopify/react-native-skia';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useAnimatedValue,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FloatingBackground } from '@/components/floating-background';
import { Palette } from '@/constants/palette';
import { ballColorFor, boardThemeFor, DEFAULT_BOARD_THEME, type BoardTheme } from '@/data/cosmetics';
import { getLevel, getNextLevel, type MazeLevel } from '@/data/levels';
import { getStartPosition, stepBall, type BallPoint, type BallVelocity } from '@/game/engine';
import { useTilt } from '@/game/sensors';
import { usePlayer } from '@/store/player';

type GameStatus = 'playing' | 'paused' | 'won';

const formatTime = (milliseconds: number) => {
  const centiseconds = Math.floor(milliseconds / 10) % 100;
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
};

function createWallPath(level: MazeLevel, cellSize: number) {
  const sections: string[] = [];
  level.rows.forEach((row, rowIndex) => {
    [...row].forEach((tile, columnIndex) => {
      if (tile === '#') {
        const x = columnIndex * cellSize;
        const y = rowIndex * cellSize;
        sections.push(`M ${x} ${y} h ${cellSize} v ${cellSize} h -${cellSize} Z`);
      }
    });
  });
  return sections.join(' ');
}

function findTiles(level: MazeLevel, tileType: string) {
  const result: BallPoint[] = [];
  level.rows.forEach((row, rowIndex) => {
    [...row].forEach((tile, columnIndex) => {
      if (tile === tileType) {
        result.push({ x: columnIndex + 0.5, y: rowIndex + 0.5 });
      }
    });
  });
  return result;
}

function MazeCanvas({
  level,
  cellSize,
  ball,
  ballColor,
  theme,
}: {
  level: MazeLevel;
  cellSize: number;
  ball: BallPoint;
  ballColor: string;
  theme: BoardTheme;
}) {
  const width = level.columns * cellSize;
  const height = level.rowCount * cellSize;
  const wallPath = useMemo(() => createWallPath(level, cellSize), [level, cellSize]);
  const holes = useMemo(() => findTiles(level, 'O'), [level]);
  const start = useMemo(() => findTiles(level, 'S'), [level]);
  const goal = useMemo(() => findTiles(level, 'G'), [level]);
  const markerRadius = cellSize * 0.29;

  return (
    <Canvas style={{ width, height }}>
      <Rect x={0} y={0} width={width} height={height} color={theme.board} />
      <Path path={wallPath} color={theme.wall} />
      {holes.map((hole) => (
        <Circle
          key={`hole-${hole.x}-${hole.y}`}
          cx={hole.x * cellSize}
          cy={hole.y * cellSize}
          r={markerRadius}
          color={theme.holeRim}
        />
      ))}
      {holes.map((hole) => (
        <Circle
          key={`hole-center-${hole.x}-${hole.y}`}
          cx={hole.x * cellSize}
          cy={hole.y * cellSize}
          r={markerRadius * 0.74}
          color={theme.hole}
        />
      ))}
      {start.map((point) => (
        <Circle
          key="start"
          cx={point.x * cellSize}
          cy={point.y * cellSize}
          r={markerRadius * 0.66}
          color={theme.start}
        />
      ))}
      {goal.map((point) => (
        <Circle
          key="goal-ring"
          cx={point.x * cellSize}
          cy={point.y * cellSize}
          r={markerRadius}
          color={theme.goal}
        />
      ))}
      {goal.map((point) => (
        <Circle
          key="goal-center"
          cx={point.x * cellSize}
          cy={point.y * cellSize}
          r={markerRadius * 0.53}
          color={theme.wall}
        />
      ))}
      <Circle
        cx={ball.x * cellSize}
        cy={ball.y * cellSize}
        r={cellSize * 0.22}
        color={ballColor}
      />
      <Circle
        cx={ball.x * cellSize - cellSize * 0.065}
        cy={ball.y * cellSize - cellSize * 0.07}
        r={cellSize * 0.065}
        color="rgba(255, 255, 255, 0.6)"
      />
    </Canvas>
  );
}

function GameButton({
  label,
  onPress,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary && styles.primaryButton,
        pressed && styles.buttonPressed,
      ]}>
      {primary && (
        <LinearGradient
          colors={Palette.cardPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientFill}
        />
      )}
      <Text style={[styles.buttonText, primary && styles.primaryButtonText]}>{label}</Text>
    </Pressable>
  );
}

function GameBoard({ level }: { level: MazeLevel }) {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const cellSize = Math.min(42, (windowWidth - 40) / level.columns);
  const boardWidth = cellSize * level.columns;
  const nextLevel = getNextLevel(level.id);
  const startPosition = useMemo(() => getStartPosition(level), [level]);
  const { tilt, available, calibrate } = useTilt(1.25);
  const equippedSkinId = usePlayer((state) => state.equipped.skinId);
  const equippedThemeId = usePlayer((state) => state.equipped.themeId);
  const completeLevel = usePlayer((state) => state.completeLevel);
  const ballColor = ballColorFor(equippedSkinId);
  const boardTheme = boardThemeFor(equippedThemeId);
  const popProgress = useAnimatedValue(0);
  const [ball, setBall] = useState<BallPoint>(startPosition);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [notice, setNotice] = useState<string | null>(null);
  const tiltRef = useRef(tilt);
  const ballRef = useRef<BallPoint>(startPosition);
  const velocityRef = useRef<BallVelocity>({ x: 0, y: 0 });
  const statusRef = useRef<GameStatus>('playing');
  const startedAtRef = useRef(0);
  const elapsedBeforeRef = useRef(0);
  const noticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    tiltRef.current = tilt;
  }, [tilt]);

  useEffect(() => {
    if (status === 'won') {
      popProgress.setValue(0);
      Animated.spring(popProgress, {
        toValue: 1,
        stiffness: 250,
        damping: 13,
        mass: 0.8,
        useNativeDriver: true,
      }).start();
    } else {
      popProgress.stopAnimation();
      popProgress.setValue(0);
    }

    return () => popProgress.stopAnimation();
  }, [popProgress, status]);

  useEffect(() => {
    let animationFrame = 0;
    let previousFrame = 0;
    let lastClockUpdate = 0;
    startedAtRef.current = Date.now();

    const animate = (frameTime: number) => {
      const deltaSeconds = previousFrame === 0 ? 0 : Math.min((frameTime - previousFrame) / 1000, 0.05);
      previousFrame = frameTime;

      if (statusRef.current === 'playing') {
        const result = stepBall(
          level,
          ballRef.current,
          velocityRef.current,
          tiltRef.current,
          deltaSeconds,
        );
        ballRef.current = result.position;
        velocityRef.current = result.velocity;
        setBall(result.position);

        const now = Date.now();
        const currentElapsed = elapsedBeforeRef.current + now - startedAtRef.current;
        if (frameTime - lastClockUpdate >= 100) {
          lastClockUpdate = frameTime;
          setElapsedMs(currentElapsed);
        }

        if (result.fell) {
          setNotice('¡Caíste en un hoyo! Vuelves al inicio.');
          if (noticeTimeoutRef.current) {
            clearTimeout(noticeTimeoutRef.current);
          }
          noticeTimeoutRef.current = setTimeout(() => setNotice(null), 1800);
        }

        if (result.won) {
          elapsedBeforeRef.current = currentElapsed;
          statusRef.current = 'won';
          completeLevel(level.id, currentElapsed);
          setElapsedMs(currentElapsed);
          setStatus('won');
          setNotice(null);
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrame);
      if (noticeTimeoutRef.current) {
        clearTimeout(noticeTimeoutRef.current);
      }
    };
  }, [completeLevel, level]);

  const togglePause = () => {
    if (statusRef.current === 'playing') {
      elapsedBeforeRef.current += Date.now() - startedAtRef.current;
      setElapsedMs(elapsedBeforeRef.current);
      statusRef.current = 'paused';
      setStatus('paused');
      return;
    }

    if (statusRef.current === 'paused') {
      startedAtRef.current = Date.now();
      statusRef.current = 'playing';
      setStatus('playing');
    }
  };

  const restart = () => {
    ballRef.current = startPosition;
    velocityRef.current = { x: 0, y: 0 };
    elapsedBeforeRef.current = 0;
    startedAtRef.current = Date.now();
    statusRef.current = 'playing';
    setBall(startPosition);
    setElapsedMs(0);
    setStatus('playing');
    setNotice(null);
    if (noticeTimeoutRef.current) {
      clearTimeout(noticeTimeoutRef.current);
    }
  };

  const centerSensor = () => {
    calibrate();
    velocityRef.current = { x: 0, y: 0 };
  };

  return (
    <FloatingBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.headingRow}>
            <View>
              <Text style={styles.eyebrow}>NIVEL {level.id}</Text>
              <Text style={styles.title}>{level.name}</Text>
            </View>
            <View style={styles.timerCard}>
              <Text style={styles.timerLabel}>TIEMPO</Text>
              <Text style={styles.timer}>{formatTime(elapsedMs)}</Text>
            </View>
          </View>

          {!available && (
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                No se detectó acelerómetro. Prueba en un teléfono físico para controlar la bola.
              </Text>
            </View>
          )}

          <View
            style={[
              styles.boardFrame,
              { width: boardWidth + 8, height: cellSize * level.rowCount + 8 },
            ]}>
            <MazeCanvas
              level={level}
              cellSize={cellSize}
              ball={ball}
              ballColor={ballColor}
              theme={boardTheme}
            />
            {status === 'won' && (
              <Animated.View style={[styles.boardOverlay, { opacity: popProgress }]}>
                <Animated.View
                  style={[
                    styles.overlayCard,
                    {
                      transform: [
                        {
                          scale: popProgress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.72, 1],
                          }),
                        },
                      ],
                    },
                  ]}>
                  <Text style={styles.overlayEyebrow}>🏆 ¡LO LOGRASTE!</Text>
                  <Text style={styles.overlayTitle}>Nivel completado</Text>
                  <Text style={styles.overlayCaption}>Tu tiempo</Text>
                  <Text style={styles.overlayTime}>{formatTime(elapsedMs)}</Text>
                  <View style={styles.overlayButtons}>
                    <GameButton label="Repetir" onPress={restart} />
                    {nextLevel && (
                      <GameButton
                        label="Siguiente"
                        primary
                        onPress={() =>
                          router.replace({
                            pathname: '/game',
                            params: { level: String(nextLevel.id) },
                          })
                        }
                      />
                    )}
                  </View>
                </Animated.View>
              </Animated.View>
            )}
          </View>

          <Text style={styles.instruction}>
            Inclina el teléfono para guiar la bola. Evita los hoyos oscuros y llega al círculo
            dorado.
          </Text>

          {notice && <Text style={styles.notice}>{notice}</Text>}

          {status !== 'won' && (
            <View style={styles.controls}>
              <GameButton label="Centrar" onPress={centerSensor} />
              <GameButton
                label={status === 'paused' ? 'Continuar' : 'Pausar'}
                onPress={togglePause}
                primary
              />
              <GameButton label="Reiniciar" onPress={restart} />
            </View>
          )}

          {status === 'paused' && <Text style={styles.pausedLabel}>Juego en pausa</Text>}

          <Link href="/sensors" style={styles.sensorLink}>
            Ver datos del acelerómetro
          </Link>
        </ScrollView>
      </SafeAreaView>
    </FloatingBackground>
  );
}

export default function GameScreen() {
  const params = useLocalSearchParams<{ level?: string }>();
  const level = useMemo(() => getLevel(Number(params.level ?? 1)), [params.level]);
  return <GameBoard key={level.id} level={level} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 16,
  },
  headingRow: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: Palette.periwinkle,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  title: {
    color: Palette.navy,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 3,
  },
  timerCard: {
    minWidth: 118,
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  timerLabel: {
    color: Palette.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  timer: {
    color: Palette.navy,
    fontVariant: ['tabular-nums'],
    fontSize: 20,
    fontWeight: '800',
    marginTop: 1,
  },
  boardFrame: {
    position: 'relative',
    overflow: 'hidden',
    borderColor: Palette.surface,
    borderWidth: 4,
    borderRadius: 18,
    backgroundColor: DEFAULT_BOARD_THEME.board,
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  boardOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 243, 255, 0.82)',
    padding: 14,
  },
  overlayCard: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderColor: Palette.border,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 8,
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  overlayEyebrow: {
    color: Palette.purple,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  overlayTitle: {
    color: Palette.navy,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  overlayCaption: {
    color: Palette.muted,
    fontSize: 12,
    marginTop: 4,
  },
  overlayTime: {
    color: Palette.gold,
    fontVariant: ['tabular-nums'],
    fontSize: 30,
    fontWeight: '800',
  },
  overlayButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  instruction: {
    color: Palette.muted,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 400,
    textAlign: 'center',
  },
  warningCard: {
    backgroundColor: '#FFF4D9',
    borderColor: '#FBD98A',
    borderWidth: 1,
    borderRadius: 14,
    maxWidth: 440,
    padding: 12,
  },
  warningText: {
    color: '#A9741B',
    fontSize: 13,
    textAlign: 'center',
  },
  notice: {
    color: '#D98B1F',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  controls: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  button: {
    minHeight: 46,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    shadowColor: '#6B5CA5',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryButton: {
    shadowColor: Palette.shadowPurple,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  gradientFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 14,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: Palette.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  primaryButtonText: {
    color: Palette.surface,
  },
  pausedLabel: {
    color: Palette.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  sensorLink: {
    color: Palette.purple,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
    paddingVertical: 4,
  },
});
