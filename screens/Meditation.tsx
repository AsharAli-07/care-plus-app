import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  ImageBackground,
  Dimensions,
  StatusBar,
  Easing,
  Modal,
  FlatList,
} from "react-native";
import { AppState, AppStateStatus } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BASE_URL } from "../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

// ─── GAME KEYS (must match DB column names) ──────────────────────────────────

type GameKey = "memory" | "stroop" | "sequence" | "tapstar" | "reverse" | "gratitude";

const GAME_LABELS: Record<GameKey, string> = {
  memory:    "Memory",
  stroop:    "Color Match",
  sequence:  "Sequence Recall",
  tapstar:   "Tap Stars",
  reverse:   "Reverse Seq",
  gratitude: "Gratitude",
};

// ─── DB SCORE HELPERS ─────────────────────────────────────────────────────────

async function fetchGameScores(): Promise<{ today: Partial<Record<GameKey, number>>; previous: Partial<Record<GameKey, number>> }> {
  try {
    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/game-scores`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { today: {}, previous: {} };
    return await res.json();
  } catch {
    return { today: {}, previous: {} };
  }
}

async function saveGameScore(game: GameKey, score: number) {
  try {
    const token = await AsyncStorage.getItem("token");
    const today = new Date().toISOString().split("T")[0];
    await fetch(`${BASE_URL}/api/game-scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ game, score, log_date: today }),
    });
  } catch (err) {
    console.log("Save game score error:", err);
  }
}

// ─── MEDITATION MINUTES (FIXED) ───────────────────────────────────────────────

async function upsertMeditationMinutes(seconds: number) {
  if (seconds < 5) return;
  const token = await AsyncStorage.getItem("token");
  const today = new Date().toISOString().split("T")[0];
  const minutes = Math.max(1, Math.round(seconds / 60));
  try {
    await fetch(`${BASE_URL}/api/meditation/update-minutes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ log_date: today, meditation_minutes: minutes }),
    });
  } catch (err) {
    console.log("Meditation API error:", err);
  }
}

// ─── SCREEN TIME TRACKER ──────────────────────────────────────────────────────

export function useScreenTimeTracker() {
  const startRef = useRef<number>(Date.now());
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const onChange = (nextState: AppStateStatus) => {
      const now = Date.now();
      if (appState.current === "active" && nextState.match(/inactive|background/)) {
        const seconds = Math.floor((now - startRef.current) / 1000);
        upsertMeditationMinutes(seconds);
      }
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        startRef.current = Date.now();
      }
      appState.current = nextState;
    };
    const subscription = AppState.addEventListener("change", onChange);
    return () => {
      subscription.remove();
      const seconds = Math.floor((Date.now() - startRef.current) / 1000);
      upsertMeditationMinutes(seconds);
    };
  }, []);
}

// ─── SCORE STORE ──────────────────────────────────────────────────────────────
// NOTE: this is the GLOBAL cumulative "trophy" total shown in the header badge.
// It is intentionally separate from per-game high scores below — every point
// earned in any game adds to this running lifetime total.

interface ScoreEntry { game: string; score: number; date: string; }

function useScoreStore() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  const addScore = useCallback((game: string, pts: number) => {
    const entry: ScoreEntry = { game, score: pts, date: new Date().toLocaleTimeString() };
    setScores(prev => [entry, ...prev.slice(0, 19)]);
    setTotalScore(prev => prev + pts);
  }, []);

  return { scores, totalScore, addScore };
}

// ─── GAME SCORE CONTEXT ───────────────────────────────────────────────────────
// NOTE: this tracks a PER-GAME "highest score ever" (kept fully separate per
// GameKey, and fully separate from the global trophy total above).

interface GameScoreCtx {
  todayScores: Partial<Record<GameKey, number>>;
  prevScores:  Partial<Record<GameKey, number>>;
  recordScore: (game: GameKey, score: number) => void;
  getHighest:  (game: GameKey) => number;
}

const SCORE_TABS = new Set<TabKey>(["memory", "stroop", "sequence", "tapstar", "reverse", "gratitude"]);

function useGameScores(): GameScoreCtx {
  const [todayScores, setTodayScores] = useState<Partial<Record<GameKey, number>>>({});
  const [prevScores,  setPrevScores]  = useState<Partial<Record<GameKey, number>>>({});

  useEffect(() => {
    fetchGameScores().then(({ today, previous }) => {
      setTodayScores(today);
      setPrevScores(previous);
    });
  }, []);

  // Only writes to the DB when the new score is a genuine new best FOR THAT
  // SPECIFIC GAME. Because scores can also be beaten by something recorded
  // on a previous day (stored in prevScores), we compare against the true
  // all-time highest for that game, not just today's value. So: if a run
  // ends on a score that beats the all-time best, that becomes the new
  // all-time highest for that game — and only that game.
  const recordScore = useCallback((game: GameKey, score: number) => {
    setTodayScores(prev => {
      const currentToday = prev[game] ?? 0;
      setPrevScores(pb => {
        const currentAllTime = Math.max(currentToday, pb[game] ?? 0);
        if (score > currentAllTime) {
          saveGameScore(game, score);
        }
        return pb;
      });
      if (score <= currentToday) return prev;
      return { ...prev, [game]: score };
    });
  }, []);

  // The number to actually display: the highest ever recorded for this
  // game, whether it happened today or on a previous day.
  const getHighest = useCallback((game: GameKey) => {
    return Math.max(todayScores[game] ?? 0, prevScores[game] ?? 0);
  }, [todayScores, prevScores]);

  return { todayScores, prevScores, recordScore, getHighest };
}

// ─── TAB CONFIG ───────────────────────────────────────────────────────────────

const TABS = [
  { key: "breathing",  label: "Breathe"   },
  { key: "eye",        label: "Eye"       },
  { key: "focus",      label: "Focus"     },
  { key: "color",      label: "Color"     },
  { key: "memory",     label: "Memory"    },
  { key: "stroop",     label: "Stroop"    },
  { key: "sequence",   label: "Sequence"  },
  { key: "tapstar",    label: "Tap Stars" },
  { key: "reverse",    label: "Reverse"   },
  { key: "gratitude",  label: "Gratitude" },
] as const;

type TabKey = typeof TABS[number]["key"];

// ─── SESSION BUTTON ───────────────────────────────────────────────────────────

function SessionBtn({ running, onPress, label, stopLabel }: { running: boolean; onPress: () => void; label?: string; stopLabel?: string }) {
  return (
    <TouchableOpacity style={[btn.root, running && btn.stop]} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name={running ? "stop" : "play"} size={14} color="#fff" />
      <Text style={btn.text}>{running ? (stopLabel || "Stop") : (label || "Start")}</Text>
    </TouchableOpacity>
  );
}
const btn = StyleSheet.create({
  root: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 9, paddingHorizontal: 22, borderRadius: 12, backgroundColor: "#004927", borderWidth: 1, borderColor: "rgba(74,222,128,0.25)", shadowColor: "#004927", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.55, shadowRadius: 14, elevation: 6 },
  stop: { backgroundColor: "rgba(248,113,113,0.2)", borderColor: "rgba(248,113,113,0.35)", shadowColor: "#f87171" },
  text: { color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 12 },
});

// ─── SCORE PILL ───────────────────────────────────────────────────────────────

function ScorePill({ score, label = "pts" }: { score: number; label?: string }) {
  return (
    <View style={sp.wrap}>
      <Text style={sp.num}>{score}</Text>
      <Text style={sp.label}>{label}</Text>
    </View>
  );
}
const sp = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "baseline", gap: 3, backgroundColor: "rgba(0,73,39,0.5)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: "rgba(74,222,128,0.2)" },
  num: { color: "#4ade80", fontSize: 16, fontFamily: "Poppins_500Medium", },
  label: { color: "#999", fontSize: 10, fontFamily: "Poppins_400Regular" },
});

// ══════════════════════════════════════════════════════════════════════════════
// 1. BREATHING EXERCISE
// ══════════════════════════════════════════════════════════════════════════════

const BREATH_MODES = [
  { key: "calm",  label: "Calm",  phases: [4, 4, 4],    colors: ["#4ade80", "#004927"] as [string, string] },
  { key: "sleep", label: "Sleep", phases: [4, 7, 8],    colors: ["#818cf8", "#1e1b4b"] as [string, string] },
  { key: "focus", label: "Focus", phases: [4, 0, 4],    colors: ["#60a5fa", "#1e3a5f"] as [string, string] },
] as const;

function BreathingExercise() {
  const [running, setRunning] = useState(false);
  const [modeIdx, setModeIdx] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState("Ready");
  const [countdown, setCountdown] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;
  const runningRef = useRef(false);
  const mode = BREATH_MODES[modeIdx];

  useEffect(() => {
    runningRef.current = running;
    if (!running) { setPhaseLabel("Ready"); setCountdown(0); scaleAnim.setValue(1); glowAnim.setValue(0); return; }

    let timeout: any;
    const [inhale, hold, exhale] = mode.phases;

    const doCountdown = (secs: number, label: string, cb: () => void) => {
      if (!runningRef.current) return;
      setPhaseLabel(label); setCountdown(secs);
      let c = secs;
      const tick = () => {
        c--; if (c <= 0) { cb(); return; }
        setCountdown(c);
        timeout = setTimeout(tick, 1000);
      };
      timeout = setTimeout(tick, 1000);
    };

    const breathe = () => {
      if (!runningRef.current) return;
      setPhaseLabel("Inhale"); setCountdown(inhale);
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1.7, duration: inhale * 1000, useNativeDriver: true }),
        Animated.timing(glowAnim,  { toValue: 1,   duration: inhale * 1000, useNativeDriver: false }),
      ]).start(() => {
        if (!runningRef.current) return;
        if (hold > 0) {
          doCountdown(hold, "Hold", () => {
            if (!runningRef.current) return;
            setPhaseLabel("Exhale"); setCountdown(exhale);
            Animated.parallel([
              Animated.timing(scaleAnim, { toValue: 1, duration: exhale * 1000, useNativeDriver: true }),
              Animated.timing(glowAnim,  { toValue: 0, duration: exhale * 1000, useNativeDriver: false }),
            ]).start(() => { timeout = setTimeout(breathe, 500); });
          });
        } else {
          setPhaseLabel("Exhale"); setCountdown(exhale);
          Animated.parallel([
            Animated.timing(scaleAnim, { toValue: 1, duration: exhale * 1000, useNativeDriver: true }),
            Animated.timing(glowAnim,  { toValue: 0, duration: exhale * 1000, useNativeDriver: false }),
          ]).start(() => { timeout = setTimeout(breathe, 500); });
        }
      });
    };
    breathe();
    return () => { runningRef.current = false; clearTimeout(timeout); };
  }, [running, modeIdx]);

  const glowColor = glowAnim.interpolate({ inputRange: [0, 1], outputRange: ["rgba(0,73,39,0.1)", mode.colors[0] + "44"] });

  return (
    <View style={ex.wrap}>
      <Text style={s.titleText}>Breathing Exercise</Text>
      <Text style={s.desText}>Follow guided breathing patterns to reduce stress, calm your mind, and improve relaxation.</Text>
      <View style={ex.modeRow}>
        {BREATH_MODES.map((m, i) => (
          <TouchableOpacity key={m.key} onPress={() => { if (!running) setModeIdx(i); }} style={[ex.modePill, i === modeIdx && ex.modePillActive]}>
            <Text style={[ex.modePillText, i === modeIdx && ex.modePillTextActive]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={ex.circleArea}>
        <Animated.View style={[ex.glow, { backgroundColor: glowColor, transform: [{ scale: scaleAnim }] }]} />
        <Animated.View style={[ex.circle, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient colors={mode.colors} style={ex.circleGrad} />
        </Animated.View>
        <View style={ex.circleRing} />
        {countdown > 0 && <View style={ex.countOverlay}><Text style={ex.countText}>{countdown}</Text></View>}
      </View>
      <Text style={ex.phaseText}>{phaseLabel}</Text>
      <Text style={ex.tipText}>
        {mode.phases[1] > 0 ? `${mode.phases[0]}s In · ${mode.phases[1]}s Hold · ${mode.phases[2]}s Out` : `${mode.phases[0]}s In · ${mode.phases[2]}s Out`}
      </Text>
      <View style={{ height: 20 }} />
      <SessionBtn running={running} onPress={() => setRunning(r => !r)} />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. EYE TRACKING — smooth curved boundary-to-boundary motion (Lissajous path)
// ══════════════════════════════════════════════════════════════════════════════


// Builds a smooth, non-linear, boundary-to-boundary path by sampling a
// Lissajous curve. Because the whole path is pre-computed and fed to
// Animated as an interpolation table, the dot glides continuously along a
// curve instead of jumping between random points ("dancing").


const CURVE_SAMPLES = 100;

function buildPerimeterCurve(w: number, h: number) {
  const inputs: number[] = [];
  const xs: number[] = [];
  const ys: number[] = [];

  // Corners are the actual translateX/Y values (dot sits at left:0, top:0,
  // so its position IS the translate value) — not centered, but 0..w / 0..h.
  const path = [
    { x: 0, y: 0 }, // Top-Left  (start)
    { x: w, y: 0 }, // Top-Right
    { x: w, y: h }, // Bottom-Right
    { x: 0, y: h }, // Bottom-Left
    { x: 0, y: 0 }, // back to Top-Left
  ];

  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const t = i / CURVE_SAMPLES;
    inputs.push(t);

    const segment = Math.min(Math.floor(t * 4), 3);
    const segmentT = (t * 4) - segment;

    const start = path[segment];
    const end = path[segment + 1];

    xs.push(start.x + (end.x - start.x) * segmentT);
    ys.push(start.y + (end.y - start.y) * segmentT);
  }
  return { inputs, xs, ys };
}

function EyeTracking() {
  const [running, setRunning] = useState(false);
  const [sets, setSets] = useState(0);
  const t = useRef(new Animated.Value(0)).current;
  const loopIdRef = useRef(0); // identifies the "current" loop chain

  const TRACK_W = width - 75;
  const TRACK_H = 220;
  const DOT_SIZE = 30;

  const ampX = TRACK_W - DOT_SIZE;
  const ampY = TRACK_H - DOT_SIZE;
  const [curve] = useState(() => buildPerimeterCurve(ampX, ampY));

  useEffect(() => {
    if (running) {
      const runId = ++loopIdRef.current; // stamp this run

      const runLoop = () => {
        if (loopIdRef.current !== runId) return; // a newer/older run — ignore
        t.setValue(0);
        Animated.timing(t, {
          toValue: 1,
          duration: 5000,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished && loopIdRef.current === runId) {
            setSets(s => s + 1);
            runLoop();
          }
        });
      };

      runLoop();
      return () => {
        loopIdRef.current++; // invalidate this chain on cleanup
        t.stopAnimation();
      };
    } else {
      loopIdRef.current++; // invalidate any in-flight chain
      t.stopAnimation();
      t.setValue(0);
      setSets(0);
    }
  }, [running]);

  const translateX = t.interpolate({ inputRange: curve.inputs, outputRange: curve.xs });
  const translateY = t.interpolate({ inputRange: curve.inputs, outputRange: curve.ys });

  return (
    <View style={ex.wrap}>
      <Text style={s.titleText}>Eye Tracking</Text>
      <Text style={s.desText}>Keep head still · Follow the glow with your eyes.</Text>
      <View style={[eye.track, { width: TRACK_W, height: TRACK_H }]}>
        <Animated.View style={[eye.dot, { transform: [{ translateX }, { translateY }] }]} />
      </View>
      <View style={eye.stats}><ScorePill score={sets} label="loops" /></View>
      <TouchableOpacity
        style={[btn.root, running && btn.stop]}
        onPress={() => setRunning(r => !r)}
        activeOpacity={0.8}
      >
        <Ionicons name={running ? "stop" : "play"} size={14} color="#fff" />
        <Text style={btn.text}>{running ? "End" : "Start"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const eye = StyleSheet.create({
  track: { borderRadius: 15, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(74,222,128,0.12)", position: "relative", overflow: "hidden", marginBottom: 15 },
  dot: { shadowColor: "#4ade80", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius:30, position: "absolute", left: 0, top: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: "#4ade80" },
  stats: { marginBottom: 20 },
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. FOCUS DOT
// ══════════════════════════════════════════════════════════════════════════════

const FOCUS_DURATIONS = [30, 60, 120] as const;

function FocusDot({ addScore }: { addScore: (g: string, p: number) => void }) {
  const [running, setRunning] = useState(false);
  const [durIdx, setDurIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [streak, setStreak] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(0.4)).current;
  const intervalRef = useRef<any>(null);
  const dur = FOCUS_DURATIONS[durIdx];

  useEffect(() => {
    if (running) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1200, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.9, duration: 1200, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 1200, useNativeDriver: false }),
      ])).start();
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        setElapsed(e => {
          if (e + 1 >= dur) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setStreak(s => s + 1);
            const pts = dur === 30 ? 10 : dur === 60 ? 25 : 60;
            addScore("Focus Dot", pts);
          }
          return e + 1;
        });
      }, 1000);
    } else {
      pulseAnim.stopAnimation(); glowAnim.stopAnimation();
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const progress = elapsed / dur;

  return (
    <View style={ex.wrap}>
      <Text style={s.titleText}>Focus Challenge</Text>
      <Text style={s.desText}>Train your attention by concentrating on a single point and minimizing distractions.</Text>
      <View style={ex.modeRow}>
        {FOCUS_DURATIONS.map((d, i) => (
          <TouchableOpacity key={d} onPress={() => { if (!running) setDurIdx(i); }} style={[ex.modePill, i === durIdx && ex.modePillActive]}>
            <Text style={[ex.modePillText, i === durIdx && ex.modePillTextActive]}>{d}s</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={fd.dotWrap}>
        <Animated.View style={[fd.glow, { opacity: glowAnim, transform: [{ scale: pulseAnim }] }]} />
        <Animated.View style={[fd.dot, { transform: [{ scale: pulseAnim }] }]} />
        <View style={fd.progressRing} />
      </View>
      <View style={fd.timerRow}>
        <Text style={fd.timer}>{elapsed}s</Text>
        <Text style={fd.timerOf}>/ {dur}s</Text>
      </View>
      <View style={fd.progressTrack}>
        <Animated.View style={[fd.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 20 }}>
        <ScorePill score={streak} label="streak" />
      </View>
      <SessionBtn running={running} onPress={() => setRunning(r => !r)} label="Focus" />
    </View>
  );
}

const fd = StyleSheet.create({
  dotWrap: { width: 110, height: 110, alignItems: "center", justifyContent: "center", marginTop: 20, marginBottom: 5 },
  glow: { position: "absolute", width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(74,222,128,0.25)" },
  dot: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#4ade80", shadowColor: "#4ade80", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 18 },
  progressRing: { position: "absolute", width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: "rgba(74,222,128,0.2)" },
  timerRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 5 },
  timer: { color: "#4ade80", fontSize: 28, fontFamily: "Poppins_500Medium" },
  timerOf: { color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  progressTrack: { width: "100%", height: 3, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: 15 },
  progressFill: { height: "100%", backgroundColor: "#4ade80", borderRadius: 2 },
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. COLOR CALM — full-screen immersive mode, with a clear exit control
// ══════════════════════════════════════════════════════════════════════════════

const COLOR_SETS: [string, string][] = [
  ["#0ea5e9", "#6366f1"], ["#4ade80", "#0d9488"], ["#f472b6", "#a78bfa"],
  ["#fbbf24", "#f97316"], ["#34d399", "#3b82f6"], ["#e879f9", "#ec4899"],
];

function ColorCalm() {
  const insets = useSafeAreaInsets();
  const [running, setRunning] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 1400, useNativeDriver: false }).start(() => {
          setColorIdx(i => (i + 1) % COLOR_SETS.length);
          Animated.timing(fadeAnim, { toValue: 1, duration: 1400, useNativeDriver: false }).start();
        });
      }, 4200);
    } else { clearInterval(intervalRef.current); }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const colors = COLOR_SETS[colorIdx];

  return (
    <View style={ex.wrap}>
      <Text style={s.titleText}>Color Relaxation</Text>
      <Text style={s.desText}>Watch soothing color transitions designed to promote calmness and reduce anxiety.</Text>

      <TouchableOpacity activeOpacity={0.85} onPress={() => setRunning(true)} style={cc.preview}>
        <LinearGradient colors={[colors[0] + "cc", colors[1] + "cc"]} style={StyleSheet.absoluteFillObject} />
        <View style={cc.previewOverlay}>
          <Ionicons name="expand-outline" size={20} color="rgba(255,255,255,0.9)" />
        </View>
      </TouchableOpacity>
      <Text style={[cc.centerText, { color: colors[0] }]}>Tap to go full screen</Text>
      <Text style={cc.subText}>Let colors wash over you</Text>
      <View style={{ height: 16 }} />
      <View style={cc.swatches}>
        {COLOR_SETS.map((cset, i) => (
          <View key={i} style={[cc.swatch, i === colorIdx && cc.swatchActive, { backgroundColor: cset[0] }]} />
        ))}
      </View>
      <View style={{ height: 25 }} />
      <TouchableOpacity style={btn.root} onPress={() => setRunning(true)} activeOpacity={0.8}>
        <Ionicons name="play" size={14} color="#fff" />
        <Text style={btn.text}>Start Colors</Text>
      </TouchableOpacity>

      <Modal visible={running} animationType="fade" statusBarTranslucent onRequestClose={() => setRunning(false)}>
        <View style={cc.fullRoot}>
          <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}>
            <LinearGradient colors={[colors[0], colors[1]]} style={StyleSheet.absoluteFillObject} />
          </Animated.View>
          <View style={[cc.fullOverlay, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 28 }]}>
            <View>
              <Text style={cc.fullTitle}>Breathe Naturally</Text>
              <Text style={cc.fullSub}>Let colors wash over you</Text>
            </View>
            <TouchableOpacity style={cc.exitBtn} onPress={() => setRunning(false)} activeOpacity={0.85}>
              <Ionicons name="stop" size={16} color="#fff" />
              <Text style={cc.exitBtnText}>Stop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const cc = StyleSheet.create({
  preview: { width: 150, height: 150, borderRadius: 75, overflow: "hidden" },
  previewOverlay: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.12)" },
  centerText: { fontSize: 18, fontFamily: "Poppins_500Medium", marginTop: 15 },
  subText: { color: "#999", fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 5 },
  swatches: { flexDirection: "row", gap: 15, marginTop: 5 },
  swatch: { width: 18, height: 18, borderRadius: 9, opacity: 0.7 },
  swatchActive: { opacity: 1, transform: [{ scale: 1.3 }], borderWidth: 2, borderColor: "#fff" },
  fullRoot: { flex: 1, backgroundColor: "#050f09" },
  fullOverlay: { flex: 1, paddingHorizontal: 24, justifyContent: "space-between", alignItems: "center" },
  fullTitle: { color: "#fff", fontSize: 22, fontFamily: "Poppins_500Medium", textAlign: "center" },
  fullSub: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: "Poppins_400Regular", marginTop: 6, textAlign: "center" },
  exitBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(0,0,0,0.35)", paddingHorizontal: 22, paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  exitBtnText: { color: "#fff", fontSize: 14, fontFamily: "Poppins_500Medium" },
});

// ══════════════════════════════════════════════════════════════════════════════
// SHARED: LIVES INDICATOR (dots instead of hearts/emoji)
// ══════════════════════════════════════════════════════════════════════════════

function LivesDots({ lives, total = 3 }: { lives: number; total?: number }) {
  return (
    <View style={mg.livesRow}>
      <Ionicons 
  name="flash" // Or "bolt", "thunderstorm", "power"
  size={15} 
  color="#4ade80" 
/>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[mg.lifeDot, i < lives ? mg.lifeDotFull : mg.lifeDotEmpty]} />
      ))}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. MEMORY BOOST — 3 lives, auto-advance, dot lives + bottom End/Clear row
// ══════════════════════════════════════════════════════════════════════════════

function generateSeq(len: number) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 9) + 1);
}

function MemoryBoost({ addScore, onRecord }: {
  addScore: (g: string, p: number) => void;
  onRecord: (pts: number) => void;
}) {
  const [phase, setPhase] = useState<"idle" | "show" | "input" | "feedback" | "over">("idle");
  const [seq, setSeq] = useState<number[]>([]);
  const [input, setInput] = useState<number[]>([]);
  const [level, setLevel] = useState(4);
  const [lives, setLives] = useState(3);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [sessionBest, setSessionBest] = useState(0);
  const [levelBanner, setLevelBanner] = useState("");

  const beginLevel = (lvl: number, banner?: string) => {
    const seqArr = generateSeq(lvl);
    setSeq(seqArr); setInput([]); setCorrect(null);
    if (banner) setLevelBanner(banner);
    setPhase("show");
    setTimeout(() => { setLevelBanner(""); setPhase("input"); }, 3000);
  };

  const start = () => {
    setLives(3); setSessionBest(0); setLevel(4);
    beginLevel(4);
  };

  const endGame = (finalScore: number) => {
    if (finalScore > 0) onRecord(finalScore);
    setPhase("over");
  };

  const tap = (n: number) => {
    if (phase !== "input") return;
    const next = [...input, n]; setInput(next);
    if (next.length === seq.length) {
      const ok = next.every((v, i) => v === seq[i]);
      setCorrect(ok); setPhase("feedback");
      if (ok) {
        const pts = level * 10;
        addScore("Memory Boost", pts);
        // Session total = SUM of every level cleared this run (not just the
        // single highest level), so the score saved as "highest" at game
        // over reflects the true cumulative total, not one level's points.
        const newBest = sessionBest + pts;
        setSessionBest(newBest);
        const nextLevel = Math.min(level + 1, 9);
        setTimeout(() => { setLevel(nextLevel); beginLevel(nextLevel, `Level ${nextLevel - 3}`); }, 900);
      } else {
        const remaining = lives - 1;
        setLives(remaining);
        if (remaining <= 0) {
          setTimeout(() => endGame(sessionBest), 900);
        } else {
          setTimeout(() => beginLevel(level), 900);
        }
      }
    }
  };

const clearInput = () => setInput(prev => prev.slice(0, -1));

  return (
    <View style={ex.wrap}>
      {phase === "idle" && (
        <>
          <Text style={mg.title}>Memorize the sequence</Text>
          <Text style={mg.sub}>3 lives · 3 seconds to memorize</Text>
          <View style={{ height: 20 }} />
          <TouchableOpacity style={btn.root} onPress={start}>
            <Ionicons name="play" size={14} color="#fff" />
            <Text style={btn.text}>Start</Text>
          </TouchableOpacity>
        </>
      )}

      {(phase === "show" || phase === "input" || phase === "feedback") && (
        <>
          <View style={mg.statusRow}>
            <LivesDots lives={lives} />
          </View>
          {levelBanner ? <Text style={mg.levelBanner}>{levelBanner}</Text> : null}

          {phase === "show" && (
            <>
              <Text style={mg.title}>Remember this!</Text>
              <View style={mg.seqRow}>{seq.map((n, i) => <View key={i} style={mg.seqNum}><Text style={mg.seqNumText}>{n}</Text></View>)}</View>
            </>
          )}

          {phase === "input" && (
            <>
              <Text style={mg.title}>Type the sequence</Text>
              <View style={mg.seqRow}>
                {Array.from({ length: seq.length }, (_, i) => (
                  <View key={i} style={[mg.seqNum, mg.inputSlot, input[i] !== undefined && mg.inputFilled]}>
                    <Text style={mg.seqNumText}>{input[i] ?? "?"}</Text>
                  </View>
                ))}
              </View>
              <View style={mg.numpad}>
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <TouchableOpacity key={n} style={mg.numKey} onPress={() => tap(n)}>
                    <Text style={mg.numKeyText}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={mg.bottomRow}>
                <TouchableOpacity style={mg.endBtnBottom} onPress={() => endGame(sessionBest)} activeOpacity={0.8}>
                
                  <Text style={mg.endBtnBottomText}>End</Text>
                </TouchableOpacity>
                <TouchableOpacity style={mg.clearBtn} onPress={clearInput} activeOpacity={0.8}>
                
                  <Text style={mg.clearBtnText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {phase === "feedback" && (
            <>
              <Text style={[mg.resultText, { color: correct ? "#4ade80" : "#f87171" }]}>
                {correct ? "Correct!" : "Wrong"}
              </Text>
              <TouchableOpacity style={[mg.endBtnBottom, { marginTop: 14 }]} onPress={() => endGame(sessionBest)} activeOpacity={0.8}>
                
                <Text style={mg.endBtnBottomText}>End</Text>
              </TouchableOpacity>
            </>
          )}

          {phase === "show" && (
            <TouchableOpacity style={[mg.endBtnBottom, { marginTop: 14 }]} onPress={() => endGame(sessionBest)} activeOpacity={0.8}>
              
              <Text style={mg.endBtnBottomText}>End</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {phase === "over" && (
        <>
          <Text style={[mg.resultText, { color: "#f87171" }]}>Session Complete</Text>
          <Text style={mg.sub}>Total this round: {sessionBest} pts</Text>
          <View style={{ height: 20 }} />
          <TouchableOpacity style={btn.root} onPress={start}>
            <Ionicons name="play" size={14} color="#fff" />
            <Text style={btn.text}>Start</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const mg = StyleSheet.create({
  title: { color: "#fff", fontSize: 20, fontFamily: "Poppins_500Medium",  textAlign: "center",marginBottom: 5 },
  sub: { color: "#999", fontSize: 12, fontFamily: "Poppins_400Regular", textAlign: "center" },
  seqRow: { flexDirection: "row", gap: 8, marginVertical: 20, flexWrap: "wrap", justifyContent: "center" },
  seqNum: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#004927", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(74,222,128,0.3)" },
  seqNumText: { color: "#4ade80", fontSize: 16, fontFamily: "Poppins_500Medium", fontWeight: "700" },
  inputSlot: { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" },
  inputFilled: { backgroundColor: "rgba(74,222,128,0.15)", borderColor: "rgba(74,222,128,0.4)" },
  numpad: { flexDirection: "row", flexWrap: "wrap", gap: 8, width: 160, justifyContent: "center", marginTop: 6 },
  numKey: { width: 44, height: 44, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  numKeyText: { color: "#fff", fontSize: 16, fontFamily: "Poppins_500Medium" },
  resultText: { fontSize: 20, fontFamily: "Poppins_500Medium", marginBottom: 4 },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 15 },
  levelBanner: { color: "#4ade80", fontSize: 16, fontFamily: "Poppins_500Medium", marginBottom: 8 },
  clearBtn: { width: 70, alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  clearBtnText: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", width: 150, marginTop: 10 },
  endBtnBottom: { width: 70, alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: "rgba(248,113,113,0.12)", borderWidth: 1, borderColor: "rgba(248,113,113,0.3)" },
  endBtnBottomText: { color: "#f87171", fontSize: 12, fontFamily: "Poppins_400Regular", textAlign: 'center' },
  livesRow: { flexDirection: "row", gap: 6, justifyContent: 'center', alignItems: 'center' },
  lifeDot: { width: 15, height: 15, borderRadius: 20 },
  lifeDotFull: { backgroundColor: "#4ade80", shadowColor: "#4ade80", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4 },
  lifeDotEmpty: {   backgroundColor: "rgba(255,255,255,0.08)", },
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. STROOP TEST
// ══════════════════════════════════════════════════════════════════════════════

const STROOP_WORDS = ["RED", "BLUE", "GREEN", "YELLOW", "PURPLE"];
const STROOP_COLORS: Record<string, string> = {
  RED: "#f87171", BLUE: "#60a5fa", GREEN: "#4ade80",
  YELLOW: "#facc15", PURPLE: "#c084fc",
};

function generateStroop() {
  const word = STROOP_WORDS[Math.floor(Math.random() * STROOP_WORDS.length)];
  let color;
  do { color = STROOP_WORDS[Math.floor(Math.random() * STROOP_WORDS.length)]; } while (color === word);
  return { word, color };
}

function StroopTest({ addScore, onRecord }: {
  addScore: (g: string, p: number) => void;
  onRecord: (pts: number) => void;
}) {
  const [running, setRunning] = useState(false);
  const [item, setItem] = useState(generateStroop());
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const feedbackTimeout = useRef<any>(null);

  const answer = (word: string) => {
    if (!running) return;
    clearTimeout(feedbackTimeout.current);
    const ok = word === item.color;
    setFeedback(ok ? "correct" : "wrong");
    if (ok) {
      const pts = 15 + streak * 5;
      setScore(sc => {
        const next = sc + pts;
        onRecord(next);
        return next;
      });
      setStreak(sc => sc + 1);
      addScore("Stroop", pts);
    } else { setStreak(0); }
    feedbackTimeout.current = setTimeout(() => { setItem(generateStroop()); setFeedback(null); }, 500);
  };

  return (
    <View style={ex.wrap}>
      <Text style={s.titleText}>Color Match</Text>
      <Text style={st.instruction}>Tap the COLOR of the text (not the word)</Text>
      <View style={[st.wordBox, feedback && (feedback === "correct" ? st.correct : st.wrong)]}>
        <Text style={[st.word, { color: STROOP_COLORS[item.color] }]}>{item.word}</Text>
      </View>
      <View style={st.optionsGrid}>
        {STROOP_WORDS.map(w => (
          <TouchableOpacity key={w} onPress={() => answer(w)} style={[st.option, { borderColor: STROOP_COLORS[w] + "55" }]} activeOpacity={running ? 0.7 : 1}>
            <View style={[st.colorDot, { backgroundColor: STROOP_COLORS[w] }]} />
            <Text style={st.optionText}>{w}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: 15, alignItems: "center", marginBottom: 20 }}>
        <ScorePill score={score} />
        <ScorePill score={streak} label="streak" />
      </View>
      <TouchableOpacity style={[btn.root, running && btn.stop]}
        onPress={() => { setRunning(r => !r); if (running) { setScore(0); setStreak(0); } }}>
        <Ionicons name={running ? "stop" : "play"} size={14} color="#fff" />
        <Text style={btn.text}>{running ? "Stop" : "Start"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const st = StyleSheet.create({
  instruction: { color: "#999", fontSize: 12, fontFamily: "Poppins_400Regular", textAlign: "center", marginBottom: 20 },
  wordBox: { width: "100%", paddingVertical: 16, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 20 },
  correct: { borderColor: "rgba(74,222,128,0.5)", backgroundColor: "rgba(74,222,128,0.08)" },
  wrong: { borderColor: "rgba(248,113,113,0.5)", backgroundColor: "rgba(248,113,113,0.08)" },
  word: { fontSize: 28, fontFamily: "Poppins_500Medium", fontWeight: "700", letterSpacing: 2 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 15, justifyContent: "center", marginBottom: 20 },
  option: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.04)" },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  optionText: { color: "rgba(255,255,255,0.65)", fontSize: 11, fontFamily: "Poppins_400Regular" },
});

// ══════════════════════════════════════════════════════════════════════════════
// 7. COLOR SEQUENCE (SIMON) — grid layout now reshuffles every level/round
// ══════════════════════════════════════════════════════════════════════════════

const SEQ_COLORS = [
  "#4ade80", "#60a5fa", "#f87171", "#facc15",
  "#c084fc", "#34d399", "#fb923c", "#a78bfa", "#38bdf8",
];
const SEQ_LABELS = ["G", "B", "R", "Y", "P", "T", "O", "V", "C"];
const NUM_PADS = SEQ_COLORS.length;

function shufflePadOrder(): number[] {
  const arr = SEQ_COLORS.map((_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function ColorSequence({ addScore, onRecord }: {
  addScore: (g: string, p: number) => void;
  onRecord: (pts: number) => void;
}) {
  const [seq, setSeq] = useState<number[]>([]);
  const [showing, setShowing] = useState(-1);
  const [inputSeq, setInputSeq] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "showing" | "input" | "feedback" | "over">("idle");
  const [correct, setCorrect] = useState(false);
  const [totalPts, setTotalPts] = useState(0);
  const [lives, setLives] = useState(3);
  const [levelBanner, setLevelBanner] = useState("");
  // Grid layout order — reshuffled every round so the same color doesn't
  // always sit in the same pad, forcing players to truly watch the glow
  // rather than memorize a fixed position.
  const [padOrder, setPadOrder] = useState<number[]>(() => shufflePadOrder());

  const playSequence = (fullSeq: number[]) => {
    setPadOrder(shufflePadOrder());
    setPhase("showing");
    let i = 0;
    const show = () => {
      if (i >= fullSeq.length) { setShowing(-1); setPhase("input"); return; }
      setShowing(fullSeq[i]);
      setTimeout(() => { setShowing(-1); setTimeout(() => { i++; show(); }, 250); }, 550);
    };
    show();
  };

  const startGame = () => {
    setLives(3); setTotalPts(0);
    const first = [Math.floor(Math.random() * NUM_PADS)];
    setSeq(first); setInputSeq([]);
    playSequence(first);
  };

  const nextLevel = (base: number[]) => {
    const extended = [...base, Math.floor(Math.random() * NUM_PADS)];
    setSeq(extended); setInputSeq([]);
    setLevelBanner(`Level ${extended.length}`);
    setTimeout(() => setLevelBanner(""), 1200);
    playSequence(extended);
  };

  const endGame = () => {
    if (totalPts > 0) onRecord(totalPts);
    setPhase("over");
  };

  const tap = (idx: number) => {
    if (phase !== "input") return;
    const next = [...inputSeq, idx]; setInputSeq(next);
    const i = next.length - 1;

    if (next[i] !== seq[i]) {
      setCorrect(false); setPhase("feedback");
      const remaining = lives - 1;
      setLives(remaining);
      setTimeout(() => {
        if (remaining <= 0) {
          endGame();
        } else {
          setInputSeq([]);
          playSequence(seq); // replay same level, don't lose progress on first mistake
        }
      }, 900);
      return;
    }

    if (next.length === seq.length) {
      setCorrect(true); setPhase("feedback");
      const pts = seq.length * 12;
      addScore("Color Seq", pts);
      const newTotal = totalPts + pts;
      setTotalPts(newTotal);
      setTimeout(() => nextLevel(seq), 900);
    }
  };

  return (
    <View style={ex.wrap}>
      <Text style={s.titleText}>Sequence Recall</Text>
      <Text style={s.desText}>Follow the glowing sequence and repeat it back — it grows one step longer each round.</Text>

      {phase !== "idle" && phase !== "over" && (
        <View style={mg.statusRow}>

          <LivesDots lives={lives} />
        </View>
      )}
      {levelBanner ? <Text style={mg.levelBanner}>{levelBanner}</Text> : null}

      <Text style={csq.title}>
        {phase === "idle" ? ""
          : phase === "showing" ? "Watch..."
          : phase === "input" ? "Repeat!"
          : phase === "feedback" ? (correct ? "Correct!" : "Wrong")
          : "Game Over"}
      </Text>
      <View style={csq.grid}>
        {padOrder.map(idx => (
          <TouchableOpacity key={idx} onPress={() => tap(idx)} activeOpacity={0.7}
            style={[csq.pad, { backgroundColor: idx === showing ? SEQ_COLORS[idx] : SEQ_COLORS[idx] + "33", borderColor: SEQ_COLORS[idx] + "66", transform: [{ scale: idx === showing ? 1.1 : 1 }] }]}>
            <Text style={csq.padLabel}>{SEQ_LABELS[idx]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={csq.level}>Level {seq.length || 0}</Text>
      {(phase === "idle" || phase === "over") && (
        <TouchableOpacity style={btn.root} onPress={startGame}>
          <Ionicons name="play" size={14} color="#fff" />
          <Text style={btn.text}>{phase === "over" ? "Play Again" : "Start"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const csq = StyleSheet.create({
  title: { color: "#fff", fontSize: 16, fontFamily: "Poppins_500Medium", marginBottom: 20, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 15, width: 210, justifyContent: "center", marginBottom: 20 },
  pad: { width: 60, height: 60, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  padLabel: { color: "#fff", fontSize: 20, fontFamily: "Poppins_500Medium" },
  level: { color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "Poppins_400Regular", marginBottom: 20 },
});

// ══════════════════════════════════════════════════════════════════════════════
// 8. TAP THE STAR
// ══════════════════════════════════════════════════════════════════════════════

interface Star { id: number; x: number; y: number; alive: boolean; }

function TapStar({ addScore, onRecord }: {
  addScore: (g: string, p: number) => void;
  onRecord: (pts: number) => void;
}) {
  const [running, setRunning] = useState(false);
  const [stars, setStars] = useState<Star[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const idRef = useRef(0);
  const intervalRef = useRef<any>(null);
  const AREA_W = width - 50;
  const AREA_H = 250;

  useEffect(() => {
    if (!running) { setStars([]); return; }
    intervalRef.current = setInterval(() => {
      const id = idRef.current++;
      const star: Star = { id, x: Math.random() * (AREA_W - 30), y: Math.random() * (AREA_H - 30), alive: true };
      setStars(s => [...s, star]);
      setTimeout(() => {
        setStars(prev => {
          const existing = prev.find(s => s.id === id);
          if (existing?.alive) setMissed(m => m + 1);
          return prev.filter(s => s.id !== id);
        });
      }, 2000);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const tapStar = (id: number) => {
    setStars(prev => prev.filter(s => s.id !== id));
    setScore(sc => {
      const next = sc + 10;
      onRecord(next);
      return next;
    });
    addScore("Tap Star", 10);
  };

  return (
    <View style={ex.wrap}>
      <Text style={[s.titleText, { marginBottom: 20 }]}>Tap the Stars</Text>
      <View style={[ts.area, { height: AREA_H }]}>
        {stars.map(star => (
          <TouchableOpacity key={star.id} style={[ts.star, { left: star.x, top: star.y }]} onPress={() => tapStar(star.id)}>
            <Text style={ts.starIcon}>⭐</Text>
          </TouchableOpacity>
        ))}
        {!running && <Text style={ts.placeholder}>Tap stars before they vanish!</Text>}
      </View>
      <View style={{ flexDirection: "row", gap: 10, marginVertical: 20 }}>
        <ScorePill score={score} />
        <ScorePill score={missed} label="missed" />
      </View>
      <TouchableOpacity style={[btn.root, running && btn.stop]}
        onPress={() => { setRunning(r => !r); if (running) { setScore(0); setMissed(0); } }}>
        <Ionicons name={running ? "stop" : "play"} size={14} color="#fff" />
        <Text style={btn.text}>{running ? "Stop" : "Tap Stars"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const ts = StyleSheet.create({
  area: { width: "100%", borderRadius: 12, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", position: "relative", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  star: { position: "absolute", width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  starIcon: { fontSize: 24 },
  placeholder: { color: "#aaa", fontSize: 12, fontFamily: "Poppins_400Regular" },
});

// ══════════════════════════════════════════════════════════════════════════════
// 9. REVERSE SEQUENCE — 3 lives, auto-advance, dot lives + bottom End/Clear row
// ══════════════════════════════════════════════════════════════════════════════

function ReverseSequence({ addScore, onRecord }: {
  addScore: (g: string, p: number) => void;
  onRecord: (pts: number) => void;
}) {
  const [phase, setPhase] = useState<"idle" | "show" | "input" | "feedback" | "over">("idle");
  const [seq, setSeq] = useState<number[]>([]);
  const [input, setInput] = useState<number[]>([]);
  const [level, setLevel] = useState(4);
  const [lives, setLives] = useState(3);
  const [correct, setCorrect] = useState(false);
  const [sessionBest, setSessionBest] = useState(0);
  const [levelBanner, setLevelBanner] = useState("");

  const beginLevel = (lvl: number, banner?: string) => {
    const s2 = generateSeq(lvl); setSeq(s2); setInput([]); setCorrect(false);
    if (banner) setLevelBanner(banner);
    setPhase("show");
    setTimeout(() => { setLevelBanner(""); setPhase("input"); }, 3000);
  };

  const start = () => {
    setLives(3); setSessionBest(0); setLevel(4);
    beginLevel(4);
  };

  const endGame = (finalScore: number) => {
    if (finalScore > 0) onRecord(finalScore);
    setPhase("over");
  };

  const tap = (n: number) => {
    if (phase !== "input") return;
    const next = [...input, n]; setInput(next);
    if (next.length === seq.length) {
      const rev = [...seq].reverse();
      const ok = next.every((v, i) => v === rev[i]);
      setCorrect(ok); setPhase("feedback");
      if (ok) {
        const pts = level * 15;
        addScore("Reverse Seq", pts);
        // Same fix as Memory Boost: sum every level cleared this run, not
        // just the max of a single level's points.
        const newBest = sessionBest + pts;
        setSessionBest(newBest);
        const nextLvl = Math.min(level + 1, 8);
        setTimeout(() => { setLevel(nextLvl); beginLevel(nextLvl, `Level ${nextLvl - 3}`); }, 900);
      } else {
        const remaining = lives - 1;
        setLives(remaining);
        if (remaining <= 0) {
          setTimeout(() => endGame(sessionBest), 900);
        } else {
          setTimeout(() => beginLevel(level), 900);
        }
      }
    }
  };

  const clearInput = () => setInput([]);
  const reversed = [...seq].reverse();

  return (
    <View style={ex.wrap}>
      {phase === "idle" && (
        <>
          <Text style={mg.title}>Enter the sequence in REVERSE</Text>
          <Text style={mg.sub}>3 lives · 3 seconds to memorize</Text>
          <View style={{ height: 20 }} />
          <TouchableOpacity style={btn.root} onPress={start}>
            <Ionicons name="play" size={14} color="#fff" />
            <Text style={btn.text}>Start</Text>
          </TouchableOpacity>
        </>
      )}

      {(phase === "show" || phase === "input" || phase === "feedback") && (
        <>
          <View style={mg.statusRow}>
            <LivesDots lives={lives} />
          </View>
          {levelBanner ? <Text style={mg.levelBanner}>{levelBanner}</Text> : null}

          {phase === "show" && (
            <>
              <Text style={mg.title}>Memorize (enter backwards!)</Text>
              <View style={mg.seqRow}>{seq.map((n, i) => <View key={i} style={mg.seqNum}><Text style={mg.seqNumText}>{n}</Text></View>)}</View>
              <TouchableOpacity style={[mg.endBtnBottom, { marginTop: 14 }]} onPress={() => endGame(sessionBest)} activeOpacity={0.8}>
                
                <Text style={mg.endBtnBottomText}>End</Text>
              </TouchableOpacity>
            </>
          )}

          {phase === "input" && (
            <>
              <Text style={mg.title}>Type it backwards ←</Text>
              <View style={mg.seqRow}>
                {Array.from({ length: seq.length }, (_, i) => (
                  <View key={i} style={[mg.seqNum, mg.inputSlot, input[i] !== undefined && mg.inputFilled]}>
                    <Text style={mg.seqNumText}>{input[i] ?? "?"}</Text>
                  </View>
                ))}
              </View>
              <View style={mg.numpad}>
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <TouchableOpacity key={n} style={mg.numKey} onPress={() => tap(n)}>
                    <Text style={mg.numKeyText}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={mg.bottomRow}>
                <TouchableOpacity style={mg.endBtnBottom} onPress={() => endGame(sessionBest)} activeOpacity={0.8}>
                  
                  <Text style={mg.endBtnBottomText}>End</Text>
                </TouchableOpacity>
                <TouchableOpacity style={mg.clearBtn} onPress={clearInput} activeOpacity={0.8}>
                  <Ionicons name="backspace-outline" size={14} color="rgba(255,255,255,0.6)" />
                  <Text style={mg.clearBtnText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {phase === "feedback" && (
            <>
              <Text style={[mg.resultText, { color: correct ? "#4ade80" : "#f87171" }]}>
                {correct ? "Reversed!" : "Wrong"}
              </Text>
              <View style={mg.seqRow}>{reversed.map((n, i) => <View key={i} style={mg.seqNum}><Text style={mg.seqNumText}>{n}</Text></View>)}</View>
              <TouchableOpacity style={[mg.endBtnBottom, { marginTop: 6 }]} onPress={() => endGame(sessionBest)} activeOpacity={0.8}>
                
                <Text style={mg.endBtnBottomText}>End</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}

      {phase === "over" && (
        <>
          <Text style={[mg.resultText, { color: "#f87171" }]}>Session Complete</Text>
          <Text style={mg.sub}>Total this round: {sessionBest} pts</Text>
          <View style={{ height: 12 }} />
          <TouchableOpacity style={btn.root} onPress={start}>
            <Ionicons name="play" size={14} color="#fff" />
            <Text style={btn.text}>Start</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 10. GRATITUDE MATCH — 10 wrong attempts allowed before game over
// ══════════════════════════════════════════════════════════════════════════════

const GRATITUDE_WORDS = ["Hope", "Joy", "Peace", "Gratitude", "Love", "Kindness", "Calm", "Growth"];
const GRATITUDE_COLORS = ["#4ade80", "#60a5fa", "#f472b6", "#facc15", "#c084fc", "#34d399", "#fb923c", "#a78bfa"];

interface GCard { id: number; word: string; color: string; flipped: boolean; matched: boolean; }

function GratitudeMatch({ addScore, onRecord }: {
  addScore: (g: string, p: number) => void;
  onRecord: (pts: number) => void;
}) {
  const [cards, setCards] = useState<GCard[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const lockRef = useRef(false);
  const MAX_WRONG = 10;

  const init = () => {
    const pairs: GCard[] = [];
    GRATITUDE_WORDS.slice(0, 6).forEach((w, i) => {
      pairs.push({ id: i * 2,     word: w, color: GRATITUDE_COLORS[i], flipped: false, matched: false });
      pairs.push({ id: i * 2 + 1, word: w, color: GRATITUDE_COLORS[i], flipped: false, matched: false });
    });
    setCards(pairs.sort(() => Math.random() - 0.5));
    setSelected([]); setMoves(0); setWrongAttempts(0); setWon(false); setLost(false); lockRef.current = false;
  };

  useEffect(() => { init(); }, []);

  const tap = (id: number) => {
    if (lockRef.current || lost || won) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;
    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newSel = [...selected, id];
    if (newSel.length === 2) {
      lockRef.current = true;
      setMoves(m => m + 1);
      const [a, b] = newSel.map(sid => newCards.find(c => c.id === sid)!);
      if (a.word === b.word) {
        const finalCards = newCards.map(c => newSel.includes(c.id) ? { ...c, matched: true } : c);
        setCards(finalCards);
        setSelected([]);
        lockRef.current = false;
        if (finalCards.every(c => c.matched)) {
          setWon(true);
          const pts = Math.max(0, 200 - moves * 5);
          addScore("Gratitude", pts);
          onRecord(pts);
        }
      } else {
        const attempts = wrongAttempts + 1;
        setWrongAttempts(attempts);
        setTimeout(() => {
          setCards(prev => prev.map(c => newSel.includes(c.id) ? { ...c, flipped: false } : c));
          setSelected([]);
          lockRef.current = false;
          if (attempts >= MAX_WRONG) {
            setLost(true);
          }
        }, 900);
      }
    } else { setSelected(newSel); }
  };

  return (
    <View style={ex.wrap}>
      <Text style={s.titleText}>Gratitude Practice</Text>
      <Text style={s.desText}>Find the matching word pairs hidden in the cards.</Text>
      {won ? (
        <>
          <Text style={[mg.resultText, { color: "#4ade80" }]}>🎉 All Matched!</Text>
          <Text style={mg.sub}>{moves} moves · +{Math.max(0, 200 - moves * 5)} pts</Text>
          <View style={{ height: 12 }} />
          <TouchableOpacity style={btn.root} onPress={init}><Text style={btn.text}>Play Again</Text></TouchableOpacity>
        </>
      ) : lost ? (
        <>
          <Text style={[mg.resultText, { color: "#f87171" }]}>Game Over</Text>
          <Text style={mg.sub}>Too many mismatches — try again</Text>
          <View style={{ height: 12 }} />
          <TouchableOpacity style={btn.root} onPress={init}><Text style={btn.text}>Play Again</Text></TouchableOpacity>
        </>
      ) : (
        <>
          <View style={[mg.statusRow, {justifyContent: 'space-between', width: '80%'}]}>
            <Text style={gm.moves}>{moves} moves</Text>
            <Text style={gm.attemptsLeft}>{MAX_WRONG - wrongAttempts} attempts left</Text>
          </View>
          <View style={gm.grid}>
            {cards.map(card => (
              <TouchableOpacity key={card.id} style={[gm.card,
                card.flipped && { borderColor: card.color + "88", backgroundColor: card.color + "22" },
                card.matched && { borderColor: card.color, opacity: 0.5 }]}
                onPress={() => tap(card.id)} activeOpacity={0.8}>
                {card.flipped || card.matched
                  ? <Text style={[gm.cardText, { color: card.color }]}>{card.word}</Text>
                  : <Text style={gm.cardBack}>?</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const gm = StyleSheet.create({
  moves: { color: "#999", fontSize: 12, fontFamily: "Poppins_400Regular" },
  attemptsLeft: { color: "rgba(248,113,113,0.7)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 7, justifyContent: "center", width: width - 80 },
  card: { width: (width - 80 - 35) / 4, height: 55, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  cardText: { fontSize: 8.5, fontFamily: "Poppins_500Medium", textAlign: "center" },
  cardBack: { fontSize: 18, color: "rgba(255,255,255,0.2)" },
});

// ─── SHARED EXERCISE WRAPPER STYLES ──────────────────────────────────────────

const ex = StyleSheet.create({
  wrap: { alignItems: "center", flex: 1, justifyContent: "center", marginBottom: 100 },
  circleArea: { width: 160, height: 160, alignItems: "center", justifyContent: "center", marginBottom: 10, marginTop: 15 },
  glow: { position: "absolute", width: 160, height: 160, borderRadius: 80 },
  circle: { width: 100, height: 100, borderRadius: 50, overflow: "hidden", zIndex: 2 },
  circleGrad: { flex: 1 },
  circleRing: { position: "absolute", width: 145, height: 145, borderRadius: 72.5, borderWidth: 1.5, borderColor: "rgba(74,222,128,0.18)", zIndex: 1 },
  phaseText: { color: "#fff", fontSize: 20, fontFamily: "Poppins_500Medium" },
  tipText: { color: "#999", fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 5, letterSpacing: 0.5 },
  countOverlay: { position: "absolute", zIndex: 3, alignItems: "center", justifyContent: "center" },
  countText: { color: "#fff", fontSize: 20, fontFamily: "Poppins_400Regular" },
  modeRow: { flexDirection: "row", gap: 15 },
  modePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)" },
  modePillActive: { backgroundColor: "#004927", borderColor: "rgba(74,222,128,0.3)" },
  modePillText: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Poppins_400Regular" },
  modePillTextActive: { color: "#fff", fontFamily: "Poppins_400Regular" },
});

// ══════════════════════════════════════════════════════════════════════════════
// SCOREBOARD MODAL — BlurView removed, plain View with matching dark theme
// ══════════════════════════════════════════════════════════════════════════════

function ScoreboardModal({ visible, onClose, scores, totalScore }: { visible: boolean; onClose: () => void; scores: ScoreEntry[]; totalScore: number }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={sm.overlay}>
        <View style={sm.sheet}>
          <View style={sm.header}>
            <Text style={sm.headerTitle}>🏆 Scoreboard</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={20} color="rgba(255,255,255,0.4)" /></TouchableOpacity>
          </View>
          <View style={sm.totalWrap}>
            <Text style={sm.totalNum}>{totalScore}</Text>
            <Text style={sm.totalLabel}>Total Points</Text>
          </View>
          <FlatList
            data={scores}
            keyExtractor={(_, i) => String(i)}
            style={{ maxHeight: 280 }}
            renderItem={({ item, index }) => (
              <View style={sm.row}>
                <Text style={sm.rank}>#{index + 1}</Text>
                <Text style={sm.game}>{item.game}</Text>
                <Text style={sm.pts}>+{item.score}</Text>
                <Text style={sm.time}>{item.date}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={sm.empty}>No scores yet. Play a game!</Text>}
          />
        </View>
      </View>
    </Modal>
  );
}

const sm = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden",
    paddingHorizontal: 20, paddingBottom: 30, paddingTop: 20,
    backgroundColor: "rgba(5,15,10,0.97)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  headerTitle: { color: "#fff", fontSize: 18, fontFamily: "Poppins_500Medium", fontWeight: "700" },
  totalWrap: { alignItems: "center", marginBottom: 18 },
  totalNum: { color: "#4ade80", fontSize: 44, fontFamily: "Poppins_500Medium", fontWeight: "700", lineHeight: 50 },
  totalLabel: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Poppins_400Regular" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  rank: { color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "Poppins_400Regular", width: 24 },
  game: { flex: 1, color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  pts: { color: "#4ade80", fontSize: 14, fontFamily: "Poppins_500Medium", fontWeight: "700" },
  time: { color: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "Poppins_400Regular" },
  empty: { color: "rgba(255,255,255,0.25)", fontSize: 12, fontFamily: "Poppins_400Regular", textAlign: "center", marginVertical: 20 },
});

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function Meditation({ route }: any) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>(
    route?.params?.tab ?? "breathing"
  );

  // Sync when navigating from Therapy with a different tab
  useEffect(() => {
    if (route?.params?.tab) {
      setActiveTab(route.params.tab as TabKey);
    }
  }, [route?.params?.tab]);

  const [scoreboardOpen, setScoreboardOpen] = useState(false);
  const { scores, totalScore, addScore } = useScoreStore();
  const { recordScore, getHighest } = useGameScores();
  useScreenTimeTracker();

  const isScoreTab = SCORE_TABS.has(activeTab);
  const gameKey = activeTab as GameKey;
  const highestVal = isScoreTab ? getHighest(gameKey) : 0;

  const renderContent = () => {
    switch (activeTab) {
      case "breathing": return <BreathingExercise />;
      case "eye":       return <EyeTracking />;
      case "focus":     return <FocusDot addScore={addScore} />;
      case "color":     return <ColorCalm />;
      case "memory":    return <MemoryBoost     addScore={addScore} onRecord={pts => recordScore("memory",    pts)} />;
      case "stroop":    return <StroopTest      addScore={addScore} onRecord={pts => recordScore("stroop",    pts)} />;
      case "sequence":  return <ColorSequence   addScore={addScore} onRecord={pts => recordScore("sequence",  pts)} />;
      case "tapstar":   return <TapStar         addScore={addScore} onRecord={pts => recordScore("tapstar",   pts)} />;
      case "reverse":   return <ReverseSequence addScore={addScore} onRecord={pts => recordScore("reverse",   pts)} />;
      case "gratitude": return <GratitudeMatch  addScore={addScore} onRecord={pts => recordScore("gratitude", pts)} />;
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={require("../assets/images/home-bg.jpg")} style={s.bg} resizeMode="cover">
        <LinearGradient colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.93)"]} style={StyleSheet.absoluteFill} />
        <View style={s.glowTop} />
        <View style={s.glowBottom} />
        <View style={[s.screen, { paddingTop: 40 }]}>

          <View style={s.headerRow}>
            <Text style={s.pageTitle}>Exercises</Text>
            <View style={s.headerRight}>
              {isScoreTab && (
                <View style={s.scorePillWrap}>
                  <Text style={s.scorePillLabel}>Highest</Text>
                  <Text style={s.scorePillNum}>{highestVal}</Text>
                </View>
              )}
              <TouchableOpacity style={s.scoreBadge} onPress={() => setScoreboardOpen(true)} activeOpacity={0.8}>
                <Ionicons name="trophy-outline" size={14} color="#facc15" />
                <Text style={s.scoreNum}>{totalScore}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabScroll} contentContainerStyle={s.tabRow}>
            {TABS.map(tab => {
              const active = activeTab === tab.key;
              return (
                <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} activeOpacity={0.75} style={[s.tab, active && s.tabActive]}>
                  <Text style={[s.tabText, active && s.tabTextActive]}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView style={s.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            {renderContent()}
          </ScrollView>
        </View>
      </ImageBackground>
      <ScoreboardModal visible={scoreboardOpen} onClose={() => setScoreboardOpen(false)} scores={scores} totalScore={totalScore} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050f09" },
  bg: { flex: 1, height: "100%", width: "100%" },
  glowTop: { position: "absolute", top: -80, left: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(0,73,39,0.22)", pointerEvents: "none" },
  glowBottom: { position: "absolute", bottom: -60, right: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(0,73,39,0.12)", pointerEvents: "none" },
  screen: { flex: 1, paddingHorizontal: 20,  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 },
  pageTitle: { color: "#fff", fontSize: 20, fontFamily: "Poppins_500Medium" },
  scoreBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(250,204,21,0.12)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "rgba(250,204,21,0.2)" },
  titleText: { fontSize: 20, color: "#fff", fontFamily: "Poppins_500Medium", marginBottom: 5 },
  desText: { fontSize: 12, color: "#999", fontFamily: "Poppins_400Regular", textAlign: "center", marginBottom: 30 },
  scoreNum: { color: "#facc15", fontSize: 14, fontFamily: "Poppins_500Medium", fontWeight: "700" },
  tabScroll: { flexGrow: 0, marginBottom: 14 },
  tabRow: { alignItems: "center", gap: 15, paddingRight: 4 },
  tab: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(0, 26, 17, 0.53)", },
  tabActive: { backgroundColor: "#004927", borderColor: "rgba(74,222,128,0.3)", shadowColor: "#004927", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 },
  tabText: { color: "#999", fontSize: 11, fontFamily: "Poppins_400Regular" },
  tabTextActive: { color: "#fff", fontFamily: "Poppins_400Regular" },
  content: { flex: 1 },
  headerRight: {
    flexDirection: "row", alignItems: "center", gap: 15,
  },
  scorePillWrap: {
    alignItems: "baseline",
    backgroundColor: "rgba(0,73,39,0.5)",
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 50,
    borderWidth: 1, borderColor: "rgba(74,222,128,0.25)",
    flexDirection: "row", gap: 5,
  },
  scorePillLabel: {
    color: "rgba(74,222,128,0.7)", fontSize: 7,
    fontFamily: "Poppins_400Regular", letterSpacing: 0.7,
  },
  scorePillNum: {
    color: "#4ade80", fontSize: 15,
    fontFamily: "Poppins_500Medium", fontWeight: "700",
  },
});