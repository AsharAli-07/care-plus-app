// import React, { useState, useEffect, useRef, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Animated,
//   ScrollView,
//   ImageBackground,
//   Dimensions,
//   StatusBar,
//   Easing,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { BlurView } from "expo-blur";
// import { LinearGradient } from "expo-linear-gradient";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const { width } = Dimensions.get("window");

// // ─── TAB CONFIG ───────────────────────────────────────────────────────────────

// const TABS = [
//   { key: "breathing",  label: "Breathe",   icon: "leaf-outline" as const },
//   { key: "box",        label: "Box",        icon: "square-outline" as const },
//   { key: "eye",        label: "Eye",        icon: "eye-outline" as const },
//   { key: "grounding",  label: "Ground",     icon: "hand-left-outline" as const },
//   { key: "thought",    label: "Thoughts",   icon: "flower-outline" as const },
//   { key: "body",       label: "Body Scan",  icon: "body-outline" as const },
// ] as const;

// type TabKey = typeof TABS[number]["key"];

// // ─── HELPERS ──────────────────────────────────────────────────────────────────

// function useCountdown(from: number, running: boolean, onTick?: (n: number) => void) {
//   const [count, setCount] = useState(from);
//   const intervalRef = useRef<any>(null);

//   useEffect(() => {
//     if (!running) { setCount(from); clearInterval(intervalRef.current); return; }
//     setCount(from);
//     intervalRef.current = setInterval(() => {
//       setCount(prev => {
//         const next = prev <= 1 ? from : prev - 1;
//         onTick?.(next);
//         return next;
//       });
//     }, 1000);
//     return () => clearInterval(intervalRef.current);
//   }, [running, from]);

//   return count;
// }

// // ─── SECTION HEADER ──────────────────────────────────────────────────────────

// function SectionHeader({title, subtitle }: { title: string; subtitle: string }) {
//   return (
//     <View style={sh.wrap}>
//       <Text style={sh.title}>{title}</Text>
//       <Text style={sh.sub}>{subtitle}</Text>
//     </View>
//   );
// }
// const sh = StyleSheet.create({
//   wrap: { alignItems: "center", marginBottom: 28 },
//   icon: { fontSize: 36, marginBottom: 8 },
//   title: { fontSize: 20, color: "#fff", fontFamily: "Poppins_500Medium", fontWeight: "700", letterSpacing: -0.3 },
//   sub: { fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "Poppins_400Regular", marginTop: 4, textAlign: "center" },
// });

// // ─── START / STOP BUTTON ─────────────────────────────────────────────────────

// function SessionBtn({ running, onPress }: { running: boolean; onPress: () => void }) {
//   return (
//     <TouchableOpacity
//       style={[btn.root, running && btn.stop]}
//       onPress={onPress}
//       activeOpacity={0.8}
//     >
//       <Ionicons name={running ? "stop" : "play"} size={16} color="#fff" />
//       <Text style={btn.text}>{running ? "Stop Session" : "Start Session"}</Text>
//     </TouchableOpacity>
//   );
// }
// const btn = StyleSheet.create({
//   root: {
//     flexDirection: "row", alignItems: "center", gap: 8,
//     paddingVertical: 10, paddingHorizontal: 28,
//     borderRadius: 12, backgroundColor: "#004927",
//     borderWidth: 1, borderColor: "rgba(74,222,128,0.25)",
//     shadowColor: "#004927", shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,
//   },
//   stop: { backgroundColor: "rgba(248,113,113,0.2)", borderColor: "rgba(248,113,113,0.35)", shadowColor: "#f87171" },
//   text: { color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 12 },
// });

// // ─── PHASE BADGE ─────────────────────────────────────────────────────────────

// function PhaseBadge({ label, count, color = "#4ade80" }: { label: string; count: number; color?: string }) {
//   return (
//     <View style={pb.wrap}>
//       <Text style={[pb.count, { color }]}>{count}</Text>
//       <Text style={pb.label}>{label}</Text>
//     </View>
//   );
// }
// const pb = StyleSheet.create({
//   wrap: { alignItems: "center" },
//   count: { fontSize: 52, fontFamily: "Poppins_500Medium", fontWeight: "700", lineHeight: 58 },
//   label: { fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "Poppins_400Regular", marginTop: 2, letterSpacing: 1 },
// });

// // ─── INFO CARD ────────────────────────────────────────────────────────────────

// function InfoCard({ items, note }: { items: string[]; note?: string }) {
//   return (
//     <BlurView intensity={50} tint="dark" style={ic.card}>
//       {items.map((item, i) => (
//         <View key={i} style={ic.row}>
//           <View style={ic.dot} />
//           <Text style={ic.item}>{item}</Text>
//         </View>
//       ))}
//       {note && <Text style={ic.note}>{note}</Text>}
//     </BlurView>
//   );
// }
// const ic = StyleSheet.create({
//   card: {
//     borderRadius: 12, overflow: "hidden", padding: 18, width: "100%",
//     borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
//   },
//   row: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
//   dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4ade80", marginTop: 6 },
//   item: { flex: 1, color: "#fff", fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20 },
//   note: { marginTop: 10, color: "#4ade80", fontFamily: "Poppins_400Regular", fontSize: 12, fontStyle: "italic" },
// });

// // ══════════════════════════════════════════════════════════════════════════════
// // ─── EXERCISE 1: 4-4 BREATHING ───────────────────────────────────────────────
// // ══════════════════════════════════════════════════════════════════════════════

// function BreathingExercise() {
//   const [running, setRunning] = useState(false);
//   const [phase, setPhase] = useState<"Ready" | "Inhale" | "Exhale">("Ready");
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const glowAnim  = useRef(new Animated.Value(0)).current;
//   const runningRef = useRef(false);

//   useEffect(() => {
//     runningRef.current = running;
//     if (!running) { setPhase("Ready"); scaleAnim.setValue(1); glowAnim.setValue(0); return; }

//     let timeout: any;
//     const breathe = () => {
//       if (!runningRef.current) return;
//       setPhase("Inhale");
//       Animated.parallel([
//         Animated.timing(scaleAnim, { toValue: 1.65, duration: 4000, useNativeDriver: true }),
//         Animated.timing(glowAnim,  { toValue: 1,    duration: 4000, useNativeDriver: false }),
//       ]).start(() => {
//         if (!runningRef.current) return;
//         setPhase("Exhale");
//         Animated.parallel([
//           Animated.timing(scaleAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
//           Animated.timing(glowAnim,  { toValue: 0, duration: 4000, useNativeDriver: false }),
//         ]).start(() => { timeout = setTimeout(breathe, 400); });
//       });
//     };
//     breathe();
//     return () => { runningRef.current = false; clearTimeout(timeout); };
//   }, [running]);

//   const glowColor = glowAnim.interpolate({ inputRange: [0, 1], outputRange: ["rgba(0,73,39,0.2)", "rgba(74,222,128,0.35)"] });

//   return (
//     <View style={ex.wrap}>
//       <SectionHeader title="Guided Breathing" subtitle={"Follow the circle · slow your nervous system"} />

//       <View style={ex.circleArea}>
//         <Animated.View style={[ex.glow, { backgroundColor: glowColor, transform: [{ scale: scaleAnim }] }]} />
//         <Animated.View style={[ex.circle, { transform: [{ scale: scaleAnim }] }]}>
//           <LinearGradient colors={["#4ade80", "#004927"]} style={ex.circleGrad} />
//         </Animated.View>
//         <View style={ex.circleRing} />
//       </View>

//       <Text style={ex.phaseText}>{phase}</Text>
//       <Text style={ex.tipText}>4s Inhale  ·  4s Exhale  ·  Repeat</Text>
//       <View style={{ height: 28 }} />
//       <SessionBtn running={running} onPress={() => setRunning(r => !r)} />
//     </View>
//   );
// }

// // ══════════════════════════════════════════════════════════════════════════════
// // ─── EXERCISE 2: BOX BREATHING (4-4-4-4) ─────────────────────────────────────
// // ══════════════════════════════════════════════════════════════════════════════

// const BOX_PHASES = ["Inhale", "Hold", "Exhale", "Hold"] as const;
// type BoxPhase = typeof BOX_PHASES[number];

// function BoxBreathing() {
//   const [running, setRunning] = useState(false);
//   const [phaseIdx, setPhaseIdx] = useState(0);
//   const [count, setCount] = useState(4);
//   const runningRef = useRef(false);
//   const boxAnim = useRef(new Animated.Value(0)).current; // 0→1 progress around the box

//   // Animate a glowing dot travelling around the square
//   useEffect(() => {
//     runningRef.current = running;
//     if (!running) { setPhaseIdx(0); setCount(4); boxAnim.setValue(0); return; }

//     let timeout: any;
//     let globalRunning = true;

//     const runPhases = async () => {
//       for (let p = 0; globalRunning && runningRef.current; p = (p + 1) % 4) {
//         setPhaseIdx(p);
//         for (let c = 4; c >= 1; c--) {
//           if (!runningRef.current || !globalRunning) return;
//           setCount(c);
//           await new Promise(r => { timeout = setTimeout(r, 1000); });
//         }
//       }
//     };

//     // Animate box dot continuously
//     const animateDot = () => {
//       Animated.timing(boxAnim, { toValue: 1, duration: 16000, useNativeDriver: false, easing: Easing.linear }).start(({ finished }) => {
//         if (finished && runningRef.current) { boxAnim.setValue(0); animateDot(); }
//       });
//     };
//     animateDot();
//     runPhases();

//     return () => { globalRunning = false; runningRef.current = false; clearTimeout(timeout); boxAnim.stopAnimation(); };
//   }, [running]);

//   const BOX_SIZE = 160;
//   const PERIMETER = BOX_SIZE * 4;

//   // Map 0→1 to x,y position around the square (clockwise from top-left)
//   const dotPos = boxAnim.interpolate({
//     inputRange: [0, 0.25, 0.5, 0.75, 1],
//     outputRange: [0, BOX_SIZE, PERIMETER / 2, PERIMETER * 0.75, PERIMETER].map(String) as any,
//   });

//   const phaseColors: Record<BoxPhase, string> = { Inhale: "#4ade80", Hold: "#facc15", Exhale: "#60a5fa", };
//   const currentPhase = BOX_PHASES[phaseIdx];
//   const phaseColor = phaseColors[currentPhase] ?? "#fff";

//   return (
//     <View style={ex.wrap}>
//       <SectionHeader title="Box Breathing" subtitle={"Inhale · Hold · Exhale · Hold  ·  4s each"} />

//       <View style={[box.square, { width: BOX_SIZE, height: BOX_SIZE }]}>
//         {/* Corners */}
//         {[0, 1, 2, 3].map(i => (
//           <View key={i} style={[box.corner, {
//             top: i < 2 ? -4 : undefined,
//             bottom: i >= 2 ? -4 : undefined,
//             left: i % 2 === 0 ? -4 : undefined,
//             right: i % 2 !== 0 ? -4 : undefined,
//           }]} />
//         ))}
//         {/* Sides */}
//         <View style={[box.side, box.sideTop]} />
//         <View style={[box.side, box.sideRight]} />
//         <View style={[box.side, box.sideBottom]} />
//         <View style={[box.side, box.sideLeft]} />
//         {/* Center text */}
//         <View style={box.center}>
//           <Text style={[box.phaseLabel, { color: phaseColor }]}>{currentPhase}</Text>
//           <Text style={[box.countNum, { color: phaseColor }]}>{count}</Text>
//         </View>
//       </View>

//       <View style={{ height: 12 }} />
//       <View style={box.phaseRow}>
//         {BOX_PHASES.map((p, i) => (
//           <View key={p} style={[box.phaseDot, i === phaseIdx && box.phaseDotActive, { backgroundColor: i === phaseIdx ? phaseColor : "rgba(255,255,255,0.12)" }]} />
//         ))}
//       </View>
//       <View style={{ height: 28 }} />
//       <SessionBtn running={running} onPress={() => setRunning(r => !r)} />
//     </View>
//   );
// }

// const box = StyleSheet.create({
//   square: {
//     position: "relative",
//     alignSelf: "center",
//     justifyContent: "center",
//     alignItems: "center",
//     marginVertical: 24,
//   },
//   corner: {
//     position: "absolute",
//     width: 10, height: 10, borderRadius: 5,
//     backgroundColor: "#4ade80",
//     zIndex: 2,
//   },
//   side: {
//     position: "absolute",
//     backgroundColor: "rgba(74,222,128,0.2)",
//   },
//   sideTop:    { top: 0,    left: 4,  right: 4,  height: 2 },
//   sideBottom: { bottom: 0, left: 4,  right: 4,  height: 2 },
//   sideLeft:   { left: 0,   top: 4,   bottom: 4, width:  2 },
//   sideRight:  { right: 0,  top: 4,   bottom: 4, width:  2 },
//   center: { alignItems: "center" },
//   phaseLabel: { fontSize: 14, fontFamily: "Poppins_500Medium", letterSpacing: 1, textTransform: "uppercase" },
//   countNum:   { fontSize: 44, fontFamily: "Poppins_500Medium", fontWeight: "700", lineHeight: 52 },
//   phaseRow:   { flexDirection: "row", gap: 10 },
//   phaseDot:   { width: 8, height: 8, borderRadius: 4 },
//   phaseDotActive: { width: 24 },
// });

// // ══════════════════════════════════════════════════════════════════════════════
// // ─── EXERCISE 3: EYE MOVEMENT (EMDR-style) ───────────────────────────────────
// // ══════════════════════════════════════════════════════════════════════════════

// function EyeMovement() {
//   const [running, setRunning] = useState(false);
//   const [sets, setSets] = useState(0);
//   const dotX = useRef(new Animated.Value(0)).current;
//   const runningRef = useRef(false);
//   const TRACK_W = width - 80;

//   useEffect(() => {
//     runningRef.current = running;
//     if (!running) { dotX.setValue(0); setSets(0); return; }

//     let set = 0;
//     const sweep = () => {
//       if (!runningRef.current) return;
//       Animated.sequence([
//         Animated.timing(dotX, { toValue: TRACK_W - 36, duration: 1800, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
//         Animated.timing(dotX, { toValue: 0,            duration: 1800, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
//       ]).start(({ finished }) => {
//         if (finished && runningRef.current) { set++; setSets(set); sweep(); }
//       });
//     };
//     sweep();
//     return () => { runningRef.current = false; };
//   }, [running]);

//   return (
//     <View style={ex.wrap}>
//       <SectionHeader title="Eye Movement" subtitle={"Follow the dot · EMDR-style bilateral stimulation"} />

//       <View style={eye.track}>
//         <Animated.View style={[eye.dot, { left: dotX }]} />
//         {/* Guide marks */}
//         <View style={eye.markLeft} /><View style={eye.markRight} />
//       </View>

//       <Text style={eye.tip}>Keep your head still · only move your eyes</Text>

//       <BlurView intensity={50} tint="dark" style={eye.counter}>
//         <Text style={eye.counterNum}>{sets}</Text>
//         <Text style={eye.counterLabel}>Sets completed</Text>
//       </BlurView>

//       <View style={{ height: 24 }} />
//       <InfoCard
//         items={[
//           "Helps process anxious thoughts through bilateral eye movement",
//           "Reduces emotional charge on intrusive thoughts",
//           "Do 2–3 minute sessions for best effect",
//         ]}
//         note="Based on EMDR therapy principles"
//       />
//       <View style={{ height: 24 }} />
//       <SessionBtn running={running} onPress={() => setRunning(r => !r)} />
//     </View>
//   );
// }

// const eye = StyleSheet.create({
//   track: {
//     height: 64, marginHorizontal: 0, borderRadius: 12,
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderWidth: 1, borderColor: "rgba(74,222,128,0.15)",
//     position: "relative", overflow: "hidden",
//     justifyContent: "center",
//     marginVertical: 28,
//   },
//   dot: {
//     position: "absolute",
//     width: 36, height: 36, borderRadius: 18,
//     backgroundColor: "#4ade80",
//     top: 14,
//     shadowColor: "#4ade80", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 12,
//   },
//   markLeft:  { position: "absolute", left: 18,  width: 2, height: 20, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 1 },
//   markRight: { position: "absolute", right: 18, width: 2, height: 20, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 1 },
//   tip: { color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "Poppins_400Regular", textAlign: "center", marginBottom: 20 },
//   counter: { borderRadius: 14, overflow: "hidden", paddingVertical: 14, paddingHorizontal: 28, alignSelf: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
//   counterNum: { color: "#4ade80", fontSize: 28, fontFamily: "Poppins_500Medium", fontWeight: "700" },
//   counterLabel: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Poppins_400Regular", marginTop: 2 },
// });

// // ══════════════════════════════════════════════════════════════════════════════
// // ─── EXERCISE 4: 5-4-3-2-1 GROUNDING ─────────────────────────────────────────
// // ══════════════════════════════════════════════════════════════════════════════

// const SENSES = [
//   { emoji: "👀", num: 5, sense: "See",   color: "#4ade80", items: ["A plant or tree", "The wall colour", "Someone's hands", "Dust in light", "Your own reflection"] },
//   { emoji: "✋", num: 4, sense: "Feel",  color: "#60a5fa", items: ["Floor beneath feet", "Air on your skin", "Clothes on your body", "Your heartbeat"] },
//   { emoji: "👂", num: 3, sense: "Hear",  color: "#facc15", items: ["Background hum", "Your own breath", "Distant sounds"] },
//   { emoji: "👃", num: 2, sense: "Smell", color: "#f87171", items: ["Air in the room", "Your own hands"] },
//   { emoji: "👅", num: 1, sense: "Taste", color: "#c084fc", items: ["The taste in your mouth right now"] },
// ];

// function Grounding() {
//   const [step, setStep] = useState(0);
//   const [done, setDone] = useState(false);
//   const fadeAnim = useRef(new Animated.Value(1)).current;

//   const goTo = (idx: number) => {
//     Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
//       setStep(idx);
//       Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
//     });
//   };

//   const next = () => {
//     if (step < SENSES.length - 1) goTo(step + 1);
//     else setDone(true);
//   };
//   const reset = () => { setDone(false); goTo(0); };

//   const s = SENSES[step];

//   return (
//     <View style={ex.wrap}>
//       <SectionHeader title="5-4-3-2-1 Grounding" subtitle={"Use your senses to return to the present"} />

//       {done ? (
//         <BlurView intensity={50} tint="dark" style={gr.doneCard}>
//           <Text style={gr.doneEmoji}>✅</Text>
//           <Text style={gr.doneTitle}>Grounded!</Text>
//           <Text style={gr.doneSub}>This reduces anxiety within 60–90 seconds.</Text>
//           <TouchableOpacity style={gr.resetBtn} onPress={reset}>
//             <Text style={gr.resetText}>Start Again</Text>
//           </TouchableOpacity>
//         </BlurView>
//       ) : (
//         <>
//           {/* Step dots */}
//           <View style={gr.dots}>
//             {SENSES.map((_, i) => (
//               <View key={i} style={[gr.dot, i === step && { backgroundColor: s.color, width: 20 }, i < step && { backgroundColor: "rgba(74,222,128,0.4)" }]} />
//             ))}
//           </View>

//           <Animated.View style={[{ opacity: fadeAnim, width: "100%" }]}>
//             <BlurView intensity={50} tint="dark" style={[gr.card, { borderColor: s.color + "33" }]}>
//               <Text style={[gr.senseNum, { color: s.color }]}>{s.num}</Text>
//               <Text style={gr.senseEmoji}>{s.emoji}</Text>
//               <Text style={[gr.senseLabel, { color: s.color }]}>Things you {s.sense}</Text>
//               <View style={gr.divider} />
//               {s.items.map((item, i) => (
//                 <View key={i} style={gr.item}>
//                   <View style={[gr.itemDot, { backgroundColor: s.color }]} />
//                   <Text style={gr.itemText}>{item}</Text>
//                 </View>
//               ))}
//             </BlurView>
//           </Animated.View>

//           <TouchableOpacity style={[gr.nextBtn, { borderColor: s.color + "44" }]} onPress={next} activeOpacity={0.8}>
//             <Text style={[gr.nextText, { color: s.color }]}>
//               {step < SENSES.length - 1 ? `Next  →` : "Complete ✓"}
//             </Text>
//           </TouchableOpacity>
//         </>
//       )}
//     </View>
//   );
// }

// const gr = StyleSheet.create({
//   dots: { flexDirection: "row", gap: 8, marginBottom: 20, justifyContent: "center" },
//   dot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.15)" },
//   card: { borderRadius: 20, overflow: "hidden", padding: 22, width: "100%", borderWidth: 1, alignItems: "center" },
//   senseNum: { fontSize: 56, fontFamily: "Poppins_500Medium", fontWeight: "700", lineHeight: 62 },
//   senseEmoji: { fontSize: 28, marginBottom: 4 },
//   senseLabel: { fontSize: 15, fontFamily: "Poppins_500Medium", marginBottom: 16, letterSpacing: 0.5 },
//   divider: { width: "60%", height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginBottom: 14 },
//   item: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8, width: "100%" },
//   itemDot: { width: 5, height: 5, borderRadius: 3 },
//   itemText: { color: "rgba(255,255,255,0.7)", fontFamily: "Poppins_400Regular", fontSize: 13 },
//   nextBtn: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 26, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.04)" },
//   nextText: { fontFamily: "Poppins_500Medium", fontSize: 14 },
//   doneCard: { borderRadius: 20, overflow: "hidden", padding: 28, width: "100%", alignItems: "center", borderWidth: 1, borderColor: "rgba(74,222,128,0.2)" },
//   doneEmoji: { fontSize: 44, marginBottom: 12 },
//   doneTitle: { color: "#4ade80", fontSize: 22, fontFamily: "Poppins_500Medium", fontWeight: "700" },
//   doneSub: { color: "rgba(255,255,255,0.45)", fontFamily: "Poppins_400Regular", fontSize: 13, textAlign: "center", marginTop: 8, lineHeight: 20 },
//   resetBtn: { marginTop: 20, paddingVertical: 11, paddingHorizontal: 28, borderRadius: 24, backgroundColor: "#004927", borderWidth: 1, borderColor: "rgba(74,222,128,0.25)" },
//   resetText: { color: "#fff", fontFamily: "Poppins_500Medium", fontSize: 13 },
// });

// // ══════════════════════════════════════════════════════════════════════════════
// // ─── EXERCISE 5: THOUGHT RESET ────────────────────────────────────────────────
// // ══════════════════════════════════════════════════════════════════════════════

// const THOUGHT_STEPS = [
//   { label: "Pause", desc: "Stop what you're doing. Take one slow breath.", icon: "⏸️" },
//   { label: "Name It", desc: "Label the thought without judging it. \"I'm having the thought that...\"", icon: "🏷️" },
//   { label: "Question", desc: "Ask yourself: Is this 100% true? What evidence do I have?", icon: "🔍" },
//   { label: "Reframe", desc: "Replace with a balanced thought: \"Even if X, I can cope with Y.\"", icon: "🔄" },
//   { label: "Act", desc: "Take one small action toward what you can control right now.", icon: "✅" },
// ];

// function ThoughtReset() {
//   const [active, setActive] = useState<number | null>(null);

//   return (
//     <View style={ex.wrap}>
//       <SectionHeader title="Thought Reset" subtitle={"5 steps to defuse heavy thoughts"} />

//       {THOUGHT_STEPS.map((step, i) => {
//         const open = active === i;
//         return (
//           <TouchableOpacity key={i} onPress={() => setActive(open ? null : i)} activeOpacity={0.8}>
//             <BlurView intensity={50} tint="dark" style={[tr.card, open && tr.cardOpen]}>
//               <View style={tr.row}>
//                 <View style={[tr.numWrap, open && tr.numWrapActive]}>
//                   <Text style={tr.num}>{i + 1}</Text>
//                 </View>
//                 <Text style={tr.stepEmoji}>{step.icon}</Text>
//                 <Text style={[tr.stepLabel, open && tr.stepLabelActive]}>{step.label}</Text>
//                 <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={open ? "#4ade80" : "rgba(255,255,255,0.25)"} />
//               </View>
//               {open && <Text style={tr.stepDesc}>{step.desc}</Text>}
//             </BlurView>
//           </TouchableOpacity>
//         );
//       })}

//       <BlurView intensity={50} tint="dark" style={tr.quote}>
//         <Text style={tr.quoteText}>"You are the observer of your thoughts, not the thoughts themselves."</Text>
//       </BlurView>
//     </View>
//   );
// }

// const tr = StyleSheet.create({
//   card: { borderRadius: 12, overflow: "hidden", padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
//   cardOpen: { borderColor: "rgba(74,222,128,0.2)", backgroundColor: "rgba(0,73,39,0.15)" },
//   row: { flexDirection: "row", alignItems: "center", gap: 10 },
//   numWrap: { width: 26, height: 26, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
//   numWrapActive: { backgroundColor: "#004927" },
//   num: { color: "#fff", fontSize: 12, fontFamily: "Poppins_500Medium" },
//   stepEmoji: { fontSize: 18 },
//   stepLabel: { flex: 1, color: "rgba(255,255,255,0.65)", fontFamily: "Poppins_500Medium", fontSize: 14 },
//   stepLabelActive: { color: "#4ade80" },
//   stepDesc: { color: "rgba(255,255,255,0.5)", fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20, marginTop: 10, paddingLeft: 36 },
//   quote: { borderRadius: 12, overflow: "hidden", padding: 16, marginTop: 8, borderWidth: 1, borderColor: "rgba(74,222,128,0.1)" },
//   quoteText: { color: "rgba(255,255,255,0.35)", fontFamily: "Poppins_400Regular", fontSize: 12, fontStyle: "italic", textAlign: "center", lineHeight: 19 },
// });

// // ══════════════════════════════════════════════════════════════════════════════
// // ─── EXERCISE 6: BODY SCAN ────────────────────────────────────────────────────
// // ══════════════════════════════════════════════════════════════════════════════

// const BODY_PARTS = [
//   { label: "Crown of Head",  emoji: "🧠", cue: "Soften the scalp and forehead. Let the jaw unclench." },
//   { label: "Neck & Shoulders", emoji: "🫙", cue: "Drop the shoulders away from ears. Release any grip." },
//   { label: "Chest & Heart",  emoji: "💚", cue: "Feel the rise and fall of breath. Let the chest soften." },
//   { label: "Hands & Arms",   emoji: "🙌", cue: "Unclench fingers. Let arms feel heavy and warm." },
//   { label: "Belly",          emoji: "🌀", cue: "Allow the belly to expand naturally. No holding." },
//   { label: "Hips & Lower Back", emoji: "🪑", cue: "Notice where you make contact with the ground or chair." },
//   { label: "Legs & Feet",   emoji: "🦶", cue: "Feel your feet on the floor. Root down into the earth." },
// ];

// function BodyScan() {
//   const [running, setRunning] = useState(false);
//   const [partIdx, setPartIdx] = useState(0);
//   const runningRef = useRef(false);
//   const progressAnim = useRef(new Animated.Value(0)).current;
//   const fadeAnim = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     runningRef.current = running;
//     if (!running) { setPartIdx(0); progressAnim.setValue(0); return; }

//     let currentIdx = 0;
//     let timeout: any;

//     const advance = () => {
//       if (!runningRef.current) return;
//       // Animate progress bar for this part
//       progressAnim.setValue(0);
//       Animated.timing(progressAnim, { toValue: 1, duration: 8000, useNativeDriver: false, easing: Easing.linear }).start(({ finished }) => {
//         if (!finished || !runningRef.current) return;
//         currentIdx++;
//         if (currentIdx >= BODY_PARTS.length) { setRunning(false); return; }
//         // Crossfade to next
//         Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
//           setPartIdx(currentIdx);
//           Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
//         });
//         advance();
//       });
//     };
//     advance();
//     return () => { runningRef.current = false; progressAnim.stopAnimation(); clearTimeout(timeout); };
//   }, [running]);

//   const part = BODY_PARTS[partIdx];

//   return (
//     <View style={ex.wrap}>
//       <SectionHeader title="Body Scan" subtitle={"Move awareness through each body region"} />

//       {/* Part dots */}
//       <View style={bs.dots}>
//         {BODY_PARTS.map((_, i) => (
//           <View key={i} style={[bs.dot, i === partIdx && bs.dotActive, i < partIdx && bs.dotDone]} />
//         ))}
//       </View>

//       <Animated.View style={[{ opacity: fadeAnim, width: "100%" }]}>
//         <BlurView intensity={30} tint="dark" style={bs.card}>
//           <Text style={bs.partEmoji}>{part.emoji}</Text>
//           <Text style={bs.partLabel}>{part.label}</Text>
//           <View style={bs.progressTrack}>
//             <Animated.View style={[bs.progressFill, { width: running ? progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) : "0%" }]} />
//           </View>
//           <Text style={bs.partCue}>{part.cue}</Text>
//         </BlurView>
//       </Animated.View>

//       <View style={bs.partList}>
//         {BODY_PARTS.map((p, i) => (
//           <TouchableOpacity key={i} onPress={() => !running && setPartIdx(i)} style={[bs.partItem, i === partIdx && bs.partItemActive]}>
//             <Text style={bs.partItemEmoji}>{p.emoji}</Text>
//             <Text style={[bs.partItemLabel, i === partIdx && { color: "#4ade80" }]}>{p.label}</Text>
//             {i < partIdx && <Ionicons name="checkmark-circle" size={14} color="#4ade80" />}
//           </TouchableOpacity>
//         ))}
//       </View>

//       <SessionBtn running={running} onPress={() => setRunning(r => !r)} />
//     </View>
//   );
// }

// const bs = StyleSheet.create({
//   dots: { flexDirection: "row", gap: 6, justifyContent: "center", marginBottom: 20 },
//   dot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.12)" },
//   dotActive: { backgroundColor: "#4ade80", width: 20 },
//   dotDone:   { backgroundColor: "rgba(74,222,128,0.35)" },
//   card: { borderRadius: 12, overflow: "hidden", padding: 24, width: "100%", alignItems: "center", borderWidth: 1, borderColor: "rgba(74,222,128,0.12)", marginBottom: 16 },
//   partEmoji: { fontSize: 38, marginBottom: 8 },
//   partLabel: { color: "#fff", fontSize: 17, fontFamily: "Poppins_500Medium", marginBottom: 16 },
//   progressTrack: { width: "100%", height: 3, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: 14 },
//   progressFill:  { height: "100%", backgroundColor: "#4ade80", borderRadius: 2 },
//   partCue: { color: "rgba(255,255,255,0.5)", fontFamily: "Poppins_400Regular", fontSize: 13, textAlign: "center", lineHeight: 20 },
//   partList: { width: "100%", marginBottom: 20 },
//   partItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4 },
//   partItemActive: { backgroundColor: "rgba(0,73,39,0.3)" },
//   partItemEmoji: { fontSize: 16 },
//   partItemLabel: { flex: 1, color: "rgba(255,255,255,0.45)", fontFamily: "Poppins_400Regular", fontSize: 12 },
// });

// // ─── SHARED EXERCISE STYLES ───────────────────────────────────────────────────

// const ex = StyleSheet.create({
//   wrap: { alignItems: "center", },
//   circleArea: { width: 180, height: 180, alignItems: "center", justifyContent: "center", marginVertical: 20 },
//   glow: { position: "absolute", width: 180, height: 180, borderRadius: 90 },
//   circle: { width: 110, height: 110, borderRadius: 55, overflow: "hidden", zIndex: 2 },
//   circleGrad: { flex: 1 },
//   circleRing: {
//     position: "absolute", width: 160, height: 160, borderRadius: 80,
//     borderWidth: 1.5, borderColor: "rgba(74,222,128,0.2)", zIndex: 1,
//   },
//   phaseText: { color: "#fff", fontSize: 22, fontFamily: "Poppins_500Medium", fontWeight: "700", marginTop: 8 },
//   tipText:   { color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 6, letterSpacing: 0.5 },
// });

// // ══════════════════════════════════════════════════════════════════════════════
// // ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// // ══════════════════════════════════════════════════════════════════════════════

// export default function Meditation() {
//   const insets = useSafeAreaInsets();
//   const [activeTab, setActiveTab] = useState<TabKey>("breathing");

//   const renderContent = () => {
//     switch (activeTab) {
//       case "breathing": return <BreathingExercise />;
//       case "box":       return <BoxBreathing />;
//       case "eye":       return <EyeMovement />;
//       case "grounding": return <Grounding />;
//       case "thought":   return <ThoughtReset />;
//       case "body":      return <BodyScan />;
//     }
//   };

//   return (
//     <View style={s.root}>
//       <StatusBar barStyle="light-content" />

//       <ImageBackground
//         source={require("../assets/images/home-bg.jpg")}
//         style={s.bg}
//         resizeMode="cover"
//       >
//         <LinearGradient
//           colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.9)"]}
//           style={StyleSheet.absoluteFill}
//         />

//         {/* Ambient glow */}
//         <View style={s.glowTop} />
//         <View style={s.glowBottom} />

//         <View style={[s.screen, { paddingTop: 20 }]}>


//           {/* Tab bar - horizontal scroll */}
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             style={s.tabScroll}
//             contentContainerStyle={s.tabRow}
//           >
//             {TABS.map(tab => {
//               const active = activeTab === tab.key;
//               return (
//                 <TouchableOpacity
//                   key={tab.key}
//                   onPress={() => setActiveTab(tab.key)}
//                   activeOpacity={0.75}
//                   style={[s.tab, active && s.tabActive]}
//                 >
//                   <Ionicons name={tab.icon} size={15} color={active ? "#fff" : "rgba(255,255,255,0.4)"} />
//                   <Text style={[s.tabText, active && s.tabTextActive]}>{tab.label}</Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>

//           {/* Content */}
//           <ScrollView
//             key={activeTab}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={s.content}
//           >
//             {renderContent()}
//           </ScrollView>
//         </View>
//       </ImageBackground>
//     </View>
//   );
// }

// // ─── STYLES ───────────────────────────────────────────────────────────────────

// const s = StyleSheet.create({
//   root: { flex: 1, backgroundColor: "#050f09" },
//   bg:   { flex: 1 },
//   glowTop: {
//     position: "absolute", top: -80, left: -60,
//     width: 280, height: 280, borderRadius: 140,
//     backgroundColor: "rgba(0,73,39,0.22)",
//     pointerEvents: "none",
//   },
//   glowBottom: {
//     position: "absolute", bottom: -60, right: -40,
//     width: 220, height: 220, borderRadius: 110,
//     backgroundColor: "rgba(0,73,39,0.12)",
//     pointerEvents: "none",
//   },
//   screen: { flex: 1, paddingHorizontal: 20 },

//   // Tab scroll — fixed height to prevent jumps (same fix as Peace page)
//   tabScroll: { flexGrow: 0, marginBottom: 20 },
//   tabRow: { alignItems: "center", gap: 15 },
//   tab: {
//     flexDirection: "row", alignItems: "center", gap: 6,
//     paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
//     borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
//     backgroundColor: "rgba(255,255,255,0.05)",
//   },
//   tabActive: {
//     backgroundColor: "#004927",
//     borderColor: "rgba(74,222,128,0.3)",
//     shadowColor: "#004927", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6,
//   },
//   tabText: { color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "Poppins_400Regular" },
//   tabTextActive: { color: "#fff", fontFamily: "Poppins_500Medium" },

//   content: { paddingBottom: 40 },
// });
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
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { createClient } from "@supabase/supabase-js";

const { width, height } = Dimensions.get("window");

// // ─── SUPABASE ────────────────────────────────────────────────────────────────
// const SUPABASE_URL = "https://YOUR_SUPABASE_URL.supabase.co";
// const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";
// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// // Replace with your auth user id or pass as prop
// const CURRENT_USER_ID = "USER_ID_HERE";

// ─── TIME TRACKING ───────────────────────────────────────────────────────────

// async function upsertMeditationMinutes(additionalSeconds: number) {
//   if (additionalSeconds < 5) return; // ignore tiny blips
//   const today = new Date().toISOString().split("T")[0];
//   const addMins = additionalSeconds / 60;

//   const { data, error } = await supabase
//     .from("wellness_logs")
//     .select("id, meditation_minutes")
//     .eq("user_id", CURRENT_USER_ID)
//     .eq("log_date", today)
//     .single();

//   if (data) {
//     const newVal = (data.meditation_minutes || 0) + addMins;
//     await supabase
//       .from("wellness_logs")
//       .update({ meditation_minutes: newVal })
//       .eq("id", data.id);
//   } else {
//     await supabase.from("wellness_logs").insert({
//       user_id: CURRENT_USER_ID,
//       log_date: today,
//       meditation_minutes: addMins,
//     });
//   }
// }

// ─── SCREEN TIME TRACKER HOOK ────────────────────────────────────────────────

function useScreenTimeTracker() {
  const startRef = useRef(Date.now());
  const totalRef = useRef(0);

  useEffect(() => {
    startRef.current = Date.now();
    return () => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      totalRef.current += elapsed;
      // upsertMeditationMinutes(elapsed);
    };
  }, []);

  return totalRef;
}

// ─── SCORE SYSTEM ────────────────────────────────────────────────────────────

interface ScoreEntry {
  game: string;
  score: number;
  date: string;
}

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

// ─── TAB CONFIG ───────────────────────────────────────────────────────────────

const TABS = [
  { key: "breathing",  label: "Breathe",   icon: "leaf-outline" as const },
  { key: "eye",        label: "Eye",        icon: "eye-outline" as const },
  { key: "focus",      label: "Focus",      icon: "radio-button-on-outline" as const },
  { key: "color",      label: "Color",      icon: "color-palette-outline" as const },
  { key: "memory",     label: "Memory",     icon: "grid-outline" as const },
  { key: "stroop",     label: "Stroop",     icon: "text-outline" as const },
  { key: "sequence",   label: "Sequence",   icon: "list-outline" as const },
  { key: "tapstar",    label: "Tap★",       icon: "star-outline" as const },
  { key: "reverse",    label: "Reverse",    icon: "arrow-back-outline" as const },
  { key: "gratitude",  label: "Gratitude",  icon: "heart-outline" as const },
] as const;

type TabKey = typeof TABS[number]["key"];

// ─── SESSION BUTTON ───────────────────────────────────────────────────────────

function SessionBtn({ running, onPress, label }: { running: boolean; onPress: () => void; label?: string }) {
  return (
    <TouchableOpacity style={[btn.root, running && btn.stop]} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name={running ? "stop" : "play"} size={14} color="#fff" />
      <Text style={btn.text}>{running ? "Stop" : (label || "Start")}</Text>
    </TouchableOpacity>
  );
}
const btn = StyleSheet.create({
  root: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 9, paddingHorizontal: 22, borderRadius: 12,
    backgroundColor: "#004927", borderWidth: 1, borderColor: "rgba(74,222,128,0.25)",
    shadowColor: "#004927", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.55, shadowRadius: 14, elevation: 6,
  },
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
  num: { color: "#4ade80", fontSize: 16, fontFamily: "Poppins_500Medium", fontWeight: "700" },
  label: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Poppins_400Regular" },
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
      setPhaseLabel(label);
      setCountdown(secs);
      let c = secs;
      const tick = () => {
        c--;
        if (c <= 0) { cb(); return; }
        setCountdown(c);
        timeout = setTimeout(tick, 1000);
      };
      timeout = setTimeout(tick, 1000);
    };

    const breathe = () => {
      if (!runningRef.current) return;
      setPhaseLabel("Inhale");
      setCountdown(inhale);
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1.7, duration: inhale * 1000, useNativeDriver: true }),
        Animated.timing(glowAnim,  { toValue: 1,   duration: inhale * 1000, useNativeDriver: false }),
      ]).start(() => {
        if (!runningRef.current) return;
        if (hold > 0) {
          doCountdown(hold, "Hold", () => {
            if (!runningRef.current) return;
            setPhaseLabel("Exhale");
            setCountdown(exhale);
            Animated.parallel([
              Animated.timing(scaleAnim, { toValue: 1, duration: exhale * 1000, useNativeDriver: true }),
              Animated.timing(glowAnim,  { toValue: 0, duration: exhale * 1000, useNativeDriver: false }),
            ]).start(() => { timeout = setTimeout(breathe, 500); });
          });
        } else {
          setPhaseLabel("Exhale");
          setCountdown(exhale);
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
      <Text>Breathing Exercise</Text>
      <Text>Follow guided breathing patterns to reduce stress, calm your mind, and improve relaxation.</Text>
      {/* Mode pills */}
      <View style={ex.modeRow}>
        {BREATH_MODES.map((m, i) => (
          <TouchableOpacity key={m.key} onPress={() => { if (!running) setModeIdx(i); }}
            style={[ex.modePill, i === modeIdx && ex.modePillActive]}>
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
        {mode.phases[1] > 0
          ? `${mode.phases[0]}s In · ${mode.phases[1]}s Hold · ${mode.phases[2]}s Out`
          : `${mode.phases[0]}s In · ${mode.phases[2]}s Out`}
      </Text>
      <View style={{ height: 14 }} />
      <SessionBtn running={running} onPress={() => setRunning(r => !r)} />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. EYE TRACKING
// ══════════════════════════════════════════════════════════════════════════════

const EYE_PATTERNS = [
  { key: "lr",   label: "L→R",    icon: "↔" },
  { key: "ud",   label: "U↕D",    icon: "↕" },
  { key: "zz",   label: "Zig",    icon: "⚡" },
] as const;

function EyeTracking() {
  const [running, setRunning] = useState(false);
  const [patternIdx, setPatternIdx] = useState(0);
  const [sets, setSets] = useState(0);
  const dotX = useRef(new Animated.Value(0)).current;
  const dotY = useRef(new Animated.Value(0)).current;
  const runningRef = useRef(false);
  const TRACK_W = width - 100;
  const TRACK_H = 100;

  useEffect(() => {
    runningRef.current = running;
    if (!running) { dotX.setValue(0); dotY.setValue(TRACK_H / 2 - 18); setSets(0); return; }

    let set = 0;

    const lr = () => {
      if (!runningRef.current) return;
      Animated.sequence([
        Animated.timing(dotX, { toValue: TRACK_W - 36, duration: 1800, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(dotX, { toValue: 0, duration: 1800, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
      ]).start(({ finished }) => { if (finished && runningRef.current) { set++; setSets(set); lr(); } });
    };

    const ud = () => {
      if (!runningRef.current) return;
      Animated.sequence([
        Animated.timing(dotY, { toValue: TRACK_H - 36, duration: 1800, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(dotY, { toValue: 0, duration: 1800, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
      ]).start(({ finished }) => { if (finished && runningRef.current) { set++; setSets(set); ud(); } });
    };

    const zz = () => {
      if (!runningRef.current) return;
      const steps = [
        [0, 0], [TRACK_W - 36, TRACK_H - 36],
        [0, TRACK_H - 36], [TRACK_W - 36, 0],
        [0, 0],
      ];
      const anims = steps.map(([x, y]) =>
        Animated.parallel([
          Animated.timing(dotX, { toValue: x, duration: 900, useNativeDriver: false }),
          Animated.timing(dotY, { toValue: y, duration: 900, useNativeDriver: false }),
        ])
      );
      Animated.sequence(anims).start(({ finished }) => { if (finished && runningRef.current) { set++; setSets(set); zz(); } });
    };

    dotX.setValue(0); dotY.setValue(0);
    if (patternIdx === 0) lr();
    else if (patternIdx === 1) ud();
    else zz();

    return () => { runningRef.current = false; };
  }, [running, patternIdx]);

  return (
    <View style={ex.wrap}>
      <View style={ex.modeRow}>
        {EYE_PATTERNS.map((p, i) => (
          <TouchableOpacity key={p.key} onPress={() => { if (!running) setPatternIdx(i); }}
            style={[ex.modePill, i === patternIdx && ex.modePillActive]}>
            <Text style={[ex.modePillText, i === patternIdx && ex.modePillTextActive]}>{p.icon} {p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[eye.track, { height: TRACK_H }]}>
        <Animated.View style={[eye.dot, { left: dotX, top: dotY }]} />
      </View>

      <Text style={eye.tip}>Keep head still · follow with eyes only</Text>

      <View style={eye.stats}>
        <ScorePill score={sets} label="sets" />
      </View>
      <SessionBtn running={running} onPress={() => setRunning(r => !r)} />
    </View>
  );
}

const eye = StyleSheet.create({
  track: {
    width: "100%", borderRadius: 12, backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(74,222,128,0.12)", position: "relative",
    overflow: "hidden", marginVertical: 14,
  },
  dot: {
    position: "absolute", width: 34, height: 34, borderRadius: 17,
    backgroundColor: "#4ade80", shadowColor: "#4ade80", shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 10,
  },
  tip: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Poppins_400Regular", textAlign: "center", marginBottom: 12 },
  stats: { marginBottom: 12 },
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
      <View style={ex.modeRow}>
        {FOCUS_DURATIONS.map((d, i) => (
          <TouchableOpacity key={d} onPress={() => { if (!running) setDurIdx(i); }}
            style={[ex.modePill, i === durIdx && ex.modePillActive]}>
            <Text style={[ex.modePillText, i === durIdx && ex.modePillTextActive]}>{d}s</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={fd.dotWrap}>
        <Animated.View style={[fd.glow, { opacity: glowAnim, transform: [{ scale: pulseAnim }] }]} />
        <Animated.View style={[fd.dot, { transform: [{ scale: pulseAnim }] }]} />
        <View style={fd.progressRing}>
          {/* simple arc approximated by opacity overlay */}
        </View>
      </View>

      <View style={fd.timerRow}>
        <Text style={fd.timer}>{elapsed}s</Text>
        <Text style={fd.timerOf}>/ {dur}s</Text>
      </View>

      {/* Progress bar */}
      <View style={fd.progressTrack}>
        <Animated.View style={[fd.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={{ flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <ScorePill score={streak} label="streak" />
      </View>
      <SessionBtn running={running} onPress={() => setRunning(r => !r)} label="Focus" />
    </View>
  );
}

const fd = StyleSheet.create({
  dotWrap: { width: 110, height: 110, alignItems: "center", justifyContent: "center", marginVertical: 14 },
  glow: { position: "absolute", width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(74,222,128,0.25)" },
  dot: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#4ade80", shadowColor: "#4ade80", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 18 },
  progressRing: { position: "absolute", width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: "rgba(74,222,128,0.2)" },
  timerRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 8 },
  timer: { color: "#4ade80", fontSize: 28, fontFamily: "Poppins_500Medium", fontWeight: "700" },
  timerOf: { color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  progressTrack: { width: "100%", height: 3, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: 14 },
  progressFill: { height: "100%", backgroundColor: "#4ade80", borderRadius: 2 },
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. COLOR CALM
// ══════════════════════════════════════════════════════════════════════════════

const COLOR_SETS: [string, string][] = [
  ["#0ea5e9", "#6366f1"], ["#4ade80", "#0d9488"], ["#f472b6", "#a78bfa"],
  ["#fbbf24", "#f97316"], ["#34d399", "#3b82f6"], ["#e879f9", "#ec4899"],
];

function ColorCalm() {
  const [running, setRunning] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 1200, useNativeDriver: false }).start(() => {
          setColorIdx(i => (i + 1) % COLOR_SETS.length);
          Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: false }).start();
        });
      }, 4000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const colors = COLOR_SETS[colorIdx];

  return (
    <View style={ex.wrap}>
      <Animated.View style={[cc.canvas, { opacity: fadeAnim }]}>
        <LinearGradient colors={[colors[0] + "55", colors[1] + "55", "transparent"]} style={cc.grad} />
      </Animated.View>

      <Text style={[cc.centerText, { color: colors[0] }]}>
        {running ? "Breathe Naturally" : "Watch & Relax"}
      </Text>
      <Text style={cc.subText}>Let colors wash over you</Text>

      <View style={{ height: 16 }} />

      <View style={cc.swatches}>
        {COLOR_SETS.map((cs, i) => (
          <View key={i} style={[cc.swatch, i === colorIdx && cc.swatchActive,
            { backgroundColor: cs[0] }]} />
        ))}
      </View>
      <View style={{ height: 14 }} />
      <SessionBtn running={running} onPress={() => setRunning(r => !r)} label="Start Colors" />
    </View>
  );
}

const cc = StyleSheet.create({
  canvas: { width: "100%", height: 100, borderRadius: 16, overflow: "hidden", marginVertical: 10 },
  grad: { flex: 1 },
  centerText: { fontSize: 18, fontFamily: "Poppins_500Medium", fontWeight: "700", marginTop: 4 },
  subText: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Poppins_400Regular", marginTop: 4 },
  swatches: { flexDirection: "row", gap: 8, marginTop: 4 },
  swatch: { width: 18, height: 18, borderRadius: 9, opacity: 0.7 },
  swatchActive: { opacity: 1, transform: [{ scale: 1.3 }], borderWidth: 2, borderColor: "#fff" },
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. MEMORY BOOST (show sequence, hide, user taps)
// ══════════════════════════════════════════════════════════════════════════════

function generateSeq(len: number) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 9) + 1);
}

function MemoryBoost({ addScore }: { addScore: (g: string, p: number) => void }) {
  const [phase, setPhase] = useState<"idle" | "show" | "input" | "result">("idle");
  const [seq, setSeq] = useState<number[]>([]);
  const [input, setInput] = useState<number[]>([]);
  const [level, setLevel] = useState(4);
  const [correct, setCorrect] = useState<boolean | null>(null);

  const start = () => {
    const s = generateSeq(level);
    setSeq(s); setInput([]); setCorrect(null);
    setPhase("show");
    setTimeout(() => setPhase("input"), 3000);
  };

  const tap = (n: number) => {
    const next = [...input, n];
    setInput(next);
    if (next.length === seq.length) {
      const ok = next.every((v, i) => v === seq[i]);
      setCorrect(ok);
      setPhase("result");
      if (ok) {
        addScore("Memory Boost", level * 10);
        setLevel(l => Math.min(l + 1, 8));
      } else {
        setLevel(l => Math.max(l - 1, 3));
      }
    }
  };

  return (
    <View style={ex.wrap}>
      {phase === "idle" && (
        <>
          <Text style={mg.title}>Memorize the sequence</Text>
          <Text style={mg.sub}>You have 3 seconds</Text>
          <View style={{ height: 12 }} />
          <TouchableOpacity style={btn.root} onPress={start}>
            <Ionicons name="play" size={14} color="#fff" />
            <Text style={btn.text}>Level {level - 3 + 1} · {level} numbers</Text>
          </TouchableOpacity>
        </>
      )}

      {phase === "show" && (
        <>
          <Text style={mg.title}>Remember this!</Text>
          <View style={mg.seqRow}>
            {seq.map((n, i) => (
              <View key={i} style={mg.seqNum}><Text style={mg.seqNumText}>{n}</Text></View>
            ))}
          </View>
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
        </>
      )}

      {phase === "result" && (
        <>
          <Text style={[mg.resultText, { color: correct ? "#4ade80" : "#f87171" }]}>
            {correct ? "✓ Correct!" : "✗ Try Again"}
          </Text>
          {correct && <Text style={mg.sub}>+{level * 10} pts</Text>}
          <View style={{ height: 12 }} />
          <TouchableOpacity style={btn.root} onPress={start}>
            <Text style={btn.text}>{correct ? "Next Level" : "Retry"}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const mg = StyleSheet.create({
  title: { color: "#fff", fontSize: 15, fontFamily: "Poppins_500Medium", marginBottom: 6, textAlign: "center" },
  sub: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Poppins_400Regular", textAlign: "center" },
  seqRow: { flexDirection: "row", gap: 8, marginVertical: 14, flexWrap: "wrap", justifyContent: "center" },
  seqNum: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#004927", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(74,222,128,0.3)" },
  seqNumText: { color: "#4ade80", fontSize: 16, fontFamily: "Poppins_500Medium", fontWeight: "700" },
  inputSlot: { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" },
  inputFilled: { backgroundColor: "rgba(74,222,128,0.15)", borderColor: "rgba(74,222,128,0.4)" },
  numpad: { flexDirection: "row", flexWrap: "wrap", gap: 8, width: 160, justifyContent: "center", marginTop: 6 },
  numKey: { width: 44, height: 44, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  numKeyText: { color: "#fff", fontSize: 16, fontFamily: "Poppins_500Medium" },
  resultText: { fontSize: 20, fontFamily: "Poppins_500Medium", fontWeight: "700", marginBottom: 4 },
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. STROOP TEST (Color Match Challenge)
// ══════════════════════════════════════════════════════════════════════════════

const STROOP_WORDS = ["RED", "BLUE", "GREEN", "YELLOW", "PURPLE"];
const STROOP_COLORS: Record<string, string> = {
  RED: "#f87171", BLUE: "#60a5fa", GREEN: "#4ade80",
  YELLOW: "#facc15", PURPLE: "#c084fc",
};

function generateStroop() {
  const word = STROOP_WORDS[Math.floor(Math.random() * STROOP_WORDS.length)];
  let color;
  do { color = STROOP_WORDS[Math.floor(Math.random() * STROOP_WORDS.length)]; }
  while (color === word);
  return { word, color };
}

function StroopTest({ addScore }: { addScore: (g: string, p: number) => void }) {
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
      setScore(s => s + pts);
      setStreak(s => s + 1);
      addScore("Stroop", pts);
    } else {
      setStreak(0);
    }
    feedbackTimeout.current = setTimeout(() => {
      setItem(generateStroop());
      setFeedback(null);
    }, 500);
  };

  return (
    <View style={ex.wrap}>
      <Text style={st.instruction}>Tap the COLOR of the text (not the word)</Text>

      <View style={[st.wordBox, feedback && (feedback === "correct" ? st.correct : st.wrong)]}>
        <Text style={[st.word, { color: STROOP_COLORS[item.color] }]}>{item.word}</Text>
      </View>

      <View style={st.optionsGrid}>
        {STROOP_WORDS.map(w => (
          <TouchableOpacity key={w} onPress={() => answer(w)}
            style={[st.option, { borderColor: STROOP_COLORS[w] + "55" }]}
            activeOpacity={running ? 0.7 : 1}>
            <View style={[st.colorDot, { backgroundColor: STROOP_COLORS[w] }]} />
            <Text style={st.optionText}>{w}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 12 }}>
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
  instruction: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Poppins_400Regular", textAlign: "center", marginBottom: 12 },
  wordBox: { width: "100%", paddingVertical: 16, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 14 },
  correct: { borderColor: "rgba(74,222,128,0.5)", backgroundColor: "rgba(74,222,128,0.08)" },
  wrong: { borderColor: "rgba(248,113,113,0.5)", backgroundColor: "rgba(248,113,113,0.08)" },
  word: { fontSize: 28, fontFamily: "Poppins_500Medium", fontWeight: "700", letterSpacing: 2 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7, justifyContent: "center", marginBottom: 12 },
  option: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.04)" },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  optionText: { color: "rgba(255,255,255,0.65)", fontSize: 11, fontFamily: "Poppins_400Regular" },
});

// ══════════════════════════════════════════════════════════════════════════════
// 7. COLOR SEQUENCE GAME
// ══════════════════════════════════════════════════════════════════════════════

const SEQ_COLORS = ["#4ade80", "#60a5fa", "#f87171", "#facc15"];
const SEQ_LABELS = ["G", "B", "R", "Y"];

function ColorSequence({ addScore }: { addScore: (g: string, p: number) => void }) {
  const [seq, setSeq] = useState<number[]>([]);
  const [showing, setShowing] = useState(-1);
  const [inputSeq, setInputSeq] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "showing" | "input" | "result">("idle");
  const [correct, setCorrect] = useState(false);

  const startSeq = () => {
    const newSeq = [...seq, Math.floor(Math.random() * 4)];
    setSeq(newSeq); setInputSeq([]); setPhase("showing");
    let i = 0;
    const show = () => {
      if (i >= newSeq.length) { setShowing(-1); setPhase("input"); return; }
      setShowing(newSeq[i]);
      setTimeout(() => { setShowing(-1); setTimeout(() => { i++; show(); }, 300); }, 700);
    };
    show();
  };

  const tap = (idx: number) => {
    if (phase !== "input") return;
    const next = [...inputSeq, idx];
    setInputSeq(next);
    if (next.length === seq.length) {
      const ok = next.every((v, i) => v === seq[i]);
      setCorrect(ok);
      setPhase("result");
      if (ok) addScore("Color Seq", seq.length * 12);
      else setSeq([]);
    }
  };

  return (
    <View style={ex.wrap}>
      <Text style={csq.title}>
        {phase === "idle" ? "Simon Says" : phase === "showing" ? "Watch..." : phase === "input" ? "Repeat!" : correct ? "✓ Perfect!" : "✗ Wrong"}
      </Text>

      <View style={csq.grid}>
        {SEQ_COLORS.map((c, i) => (
          <TouchableOpacity key={i} onPress={() => tap(i)} activeOpacity={0.7}
            style={[csq.pad, { backgroundColor: i === showing ? c : c + "33", borderColor: c + "66",
              transform: [{ scale: i === showing ? 1.1 : 1 }] }]}>
            <Text style={csq.padLabel}>{SEQ_LABELS[i]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={csq.level}>Level {seq.length}</Text>

      {phase === "idle" || phase === "result" ? (
        <TouchableOpacity style={btn.root} onPress={correct || phase === "idle" ? startSeq : () => { setSeq([]); setPhase("idle"); }}>
          <Text style={btn.text}>
            {phase === "idle" ? "Start" : correct ? "Next Level" : "Try Again"}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const csq = StyleSheet.create({
  title: { color: "#fff", fontSize: 15, fontFamily: "Poppins_500Medium", marginBottom: 12, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, width: 150, justifyContent: "center", marginBottom: 12 },
  pad: { width: 60, height: 60, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  padLabel: { color: "#fff", fontSize: 18, fontFamily: "Poppins_500Medium", fontWeight: "700" },
  level: { color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "Poppins_400Regular", marginBottom: 10 },
});

// ══════════════════════════════════════════════════════════════════════════════
// 8. TAP THE STAR
// ══════════════════════════════════════════════════════════════════════════════

interface Star { id: number; x: number; y: number; alive: boolean; }

function TapStar({ addScore }: { addScore: (g: string, p: number) => void }) {
  const [running, setRunning] = useState(false);
  const [stars, setStars] = useState<Star[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const idRef = useRef(0);
  const intervalRef = useRef<any>(null);
  const AREA_W = width - 80;
  const AREA_H = 120;

  useEffect(() => {
    if (!running) { setStars([]); return; }

    intervalRef.current = setInterval(() => {
      const id = idRef.current++;
      const star: Star = { id, x: Math.random() * (AREA_W - 36), y: Math.random() * (AREA_H - 36), alive: true };
      setStars(s => [...s, star]);
      setTimeout(() => {
        setStars(prev => {
          const existing = prev.find(s => s.id === id);
          if (existing?.alive) setMissed(m => m + 1);
          return prev.filter(s => s.id !== id);
        });
      }, 1500);
    }, 800);

    return () => clearInterval(intervalRef.current);
  }, [running]);

  const tapStar = (id: number) => {
    setStars(prev => prev.map(s => s.id === id ? { ...s, alive: false } : s).filter(s => s.id !== id || !s.alive));
    setStars(prev => prev.filter(s => s.id !== id));
    const pts = 10;
    setScore(s => s + pts);
    addScore("Tap Star", pts);
  };

  return (
    <View style={ex.wrap}>
      <View style={[ts.area, { height: AREA_H }]}>
        {stars.map(star => (
          <TouchableOpacity key={star.id} style={[ts.star, { left: star.x, top: star.y }]} onPress={() => tapStar(star.id)}>
            <Text style={ts.starIcon}>⭐</Text>
          </TouchableOpacity>
        ))}
        {!running && <Text style={ts.placeholder}>Tap stars before they vanish!</Text>}
      </View>

      <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
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
  placeholder: { color: "rgba(255,255,255,0.15)", fontSize: 12, fontFamily: "Poppins_400Regular" },
});

// ══════════════════════════════════════════════════════════════════════════════
// 9. REVERSE SEQUENCE
// ══════════════════════════════════════════════════════════════════════════════

function ReverseSequence({ addScore }: { addScore: (g: string, p: number) => void }) {
  const [seq, setSeq] = useState<number[]>([]);
  const [input, setInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "show" | "input" | "result">("idle");
  const [correct, setCorrect] = useState(false);
  const [level, setLevel] = useState(4);

  const start = () => {
    const s = generateSeq(level);
    setSeq(s); setInput([]); setCorrect(false);
    setPhase("show");
    setTimeout(() => setPhase("input"), 3000);
  };

  const tap = (n: number) => {
    const next = [...input, n];
    setInput(next);
    if (next.length === seq.length) {
      const rev = [...seq].reverse();
      const ok = next.every((v, i) => v === rev[i]);
      setCorrect(ok);
      setPhase("result");
      if (ok) { addScore("Reverse Seq", level * 15); setLevel(l => Math.min(l + 1, 7)); }
      else setLevel(l => Math.max(l - 1, 3));
    }
  };

  const reversed = [...seq].reverse();

  return (
    <View style={ex.wrap}>
      {phase === "idle" && (
        <>
          <Text style={mg.title}>Enter sequence in REVERSE</Text>
          <Text style={mg.sub}>3 seconds to memorize</Text>
          <View style={{ height: 12 }} />
          <TouchableOpacity style={btn.root} onPress={start}>
            <Text style={btn.text}>Level {level - 3 + 1} · {level} digits</Text>
          </TouchableOpacity>
        </>
      )}
      {phase === "show" && (
        <>
          <Text style={mg.title}>Memorize (enter backwards!)</Text>
          <View style={mg.seqRow}>{seq.map((n, i) => <View key={i} style={mg.seqNum}><Text style={mg.seqNumText}>{n}</Text></View>)}</View>
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
        </>
      )}
      {phase === "result" && (
        <>
          <Text style={[mg.resultText, { color: correct ? "#4ade80" : "#f87171" }]}>
            {correct ? "✓ Reversed!" : "✗ Wrong"}
          </Text>
          <View style={mg.seqRow}>{reversed.map((n, i) => <View key={i} style={mg.seqNum}><Text style={mg.seqNumText}>{n}</Text></View>)}</View>
          <TouchableOpacity style={btn.root} onPress={start}><Text style={btn.text}>{correct ? "Next" : "Retry"}</Text></TouchableOpacity>
        </>
      )}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 10. GRATITUDE MATCH
// ══════════════════════════════════════════════════════════════════════════════

const GRATITUDE_WORDS = ["Hope", "Joy", "Peace", "Gratitude", "Love", "Kindness", "Calm", "Growth"];
const GRATITUDE_COLORS = ["#4ade80", "#60a5fa", "#f472b6", "#facc15", "#c084fc", "#34d399", "#fb923c", "#a78bfa"];

interface GCard { id: number; word: string; color: string; flipped: boolean; matched: boolean; }

function GratitudeMatch({ addScore }: { addScore: (g: string, p: number) => void }) {
  const [cards, setCards] = useState<GCard[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const lockRef = useRef(false);

  const init = () => {
    const pairs: GCard[] = [];
    GRATITUDE_WORDS.slice(0, 6).forEach((w, i) => {
      pairs.push({ id: i * 2,     word: w, color: GRATITUDE_COLORS[i], flipped: false, matched: false });
      pairs.push({ id: i * 2 + 1, word: w, color: GRATITUDE_COLORS[i], flipped: false, matched: false });
    });
    setCards(pairs.sort(() => Math.random() - 0.5));
    setSelected([]); setMoves(0); setWon(false); lockRef.current = false;
  };

  useEffect(() => { init(); }, []);

  const tap = (id: number) => {
    if (lockRef.current) return;
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
          addScore("Gratitude", Math.max(0, 200 - moves * 5));
        }
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newSel.includes(c.id) ? { ...c, flipped: false } : c));
          setSelected([]);
          lockRef.current = false;
        }, 900);
      }
    } else {
      setSelected(newSel);
    }
  };

  return (
    <View style={ex.wrap}>
      {won ? (
        <>
          <Text style={[mg.resultText, { color: "#4ade80" }]}>🎉 All Matched!</Text>
          <Text style={mg.sub}>{moves} moves · +{Math.max(0, 200 - moves * 5)} pts</Text>
          <View style={{ height: 12 }} />
          <TouchableOpacity style={btn.root} onPress={init}><Text style={btn.text}>Play Again</Text></TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={gm.moves}>{moves} moves</Text>
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
  moves: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Poppins_400Regular", marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 7, justifyContent: "center", width: width - 80 },
  card: { width: (width - 80 - 35) / 4, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  cardText: { fontSize: 8.5, fontFamily: "Poppins_500Medium", textAlign: "center" },
  cardBack: { fontSize: 18, color: "rgba(255,255,255,0.2)" },
});

// ─── SHARED EXERCISE WRAPPER STYLES ──────────────────────────────────────────

const ex = StyleSheet.create({
  wrap: { alignItems: "center", flex: 1, justifyContent: "center" },
  circleArea: { width: 160, height: 160, alignItems: "center", justifyContent: "center", marginVertical: 10 },
  glow: { position: "absolute", width: 160, height: 160, borderRadius: 80 },
  circle: { width: 100, height: 100, borderRadius: 50, overflow: "hidden", zIndex: 2 },
  circleGrad: { flex: 1 },
  circleRing: { position: "absolute", width: 145, height: 145, borderRadius: 72.5, borderWidth: 1.5, borderColor: "rgba(74,222,128,0.18)", zIndex: 1 },
  phaseText: { color: "#fff", fontSize: 20, fontFamily: "Poppins_500Medium", fontWeight: "700", marginTop: 4 },
  tipText: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Poppins_400Regular", marginTop: 4, letterSpacing: 0.5 },
  countOverlay: { position: "absolute", zIndex: 3, alignItems: "center", justifyContent: "center" },
  countText: { color: "#fff", fontSize: 22, fontFamily: "Poppins_500Medium", fontWeight: "700" },
  modeRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  modePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)" },
  modePillActive: { backgroundColor: "#004927", borderColor: "rgba(74,222,128,0.3)" },
  modePillText: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Poppins_400Regular" },
  modePillTextActive: { color: "#fff", fontFamily: "Poppins_500Medium" },
});

// ══════════════════════════════════════════════════════════════════════════════
// SCOREBOARD MODAL
// ══════════════════════════════════════════════════════════════════════════════

function ScoreboardModal({ visible, onClose, scores, totalScore }: { visible: boolean; onClose: () => void; scores: ScoreEntry[]; totalScore: number }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={sm.overlay}>
        <BlurView intensity={60} tint="dark" style={sm.sheet}>
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
        </BlurView>
      </View>
    </Modal>
  );
}

const sm = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden", paddingHorizontal: 20, paddingBottom: 30, paddingTop: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
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

export default function Meditation() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>("breathing");
  const [scoreboardOpen, setScoreboardOpen] = useState(false);
  const { scores, totalScore, addScore } = useScoreStore();
  useScreenTimeTracker();

  const renderContent = () => {
    switch (activeTab) {
      case "breathing": return <BreathingExercise />;
      case "eye":       return <EyeTracking />;
      case "focus":     return <FocusDot addScore={addScore} />;
      case "color":     return <ColorCalm />;
      case "memory":    return <MemoryBoost addScore={addScore} />;
      case "stroop":    return <StroopTest addScore={addScore} />;
      case "sequence":  return <ColorSequence addScore={addScore} />;
      case "tapstar":   return <TapStar addScore={addScore} />;
      case "reverse":   return <ReverseSequence addScore={addScore} />;
      case "gratitude": return <GratitudeMatch addScore={addScore} />;
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={s.bg}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.93)"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={s.glowTop} />
        <View style={s.glowBottom} />

        <View style={[s.screen, { paddingTop: insets.top + 6 }]}>
          {/* Header */}
          <View style={s.headerRow}>
            <Text style={s.pageTitle}>Mindfulness</Text>
            <TouchableOpacity style={s.scoreBadge} onPress={() => setScoreboardOpen(true)} activeOpacity={0.8}>
              <Ionicons name="trophy-outline" size={14} color="#facc15" />
              <Text style={s.scoreNum}>{totalScore}</Text>
            </TouchableOpacity>
          </View>

          {/* Tab bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.tabScroll}
            contentContainerStyle={s.tabRow}
          >
            {TABS.map(tab => {
              const active = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.75}
                  style={[s.tab, active && s.tabActive]}
                >
                  <Ionicons name={tab.icon} size={13} color={active ? "#fff" : "rgba(255,255,255,0.35)"} />
                  <Text style={[s.tabText, active && s.tabTextActive]}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Content — no scroll, fills remaining space */}
          <View style={s.content}>
            {renderContent()}
          </View>
        </View>
      </ImageBackground>

      <ScoreboardModal
        visible={scoreboardOpen}
        onClose={() => setScoreboardOpen(false)}
        scores={scores}
        totalScore={totalScore}
      />
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050f09" },
  bg: { flex: 1 },
  glowTop: {
    position: "absolute", top: -80, left: -60, width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(0,73,39,0.22)", pointerEvents: "none",
  },
  glowBottom: {
    position: "absolute", bottom: -60, right: -40, width: 220, height: 220, borderRadius: 110,
    backgroundColor: "rgba(0,73,39,0.12)", pointerEvents: "none",
  },
  screen: { flex: 1, paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  pageTitle: { color: "#fff", fontSize: 20, fontFamily: "Poppins_500Medium", fontWeight: "700", letterSpacing: -0.3 },
  scoreBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(250,204,21,0.12)", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(250,204,21,0.2)",
  },
  scoreNum: { color: "#facc15", fontSize: 14, fontFamily: "Poppins_500Medium", fontWeight: "700" },
  tabScroll: { flexGrow: 0, marginBottom: 14 },
  tabRow: { alignItems: "center", gap: 8, paddingRight: 4 },
  tab: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 11, paddingVertical: 6, borderRadius: 18,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  tabActive: {
    backgroundColor: "#004927", borderColor: "rgba(74,222,128,0.28)",
    shadowColor: "#004927", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6,
  },
  tabText: { color: "rgba(255,255,255,0.38)", fontSize: 11, fontFamily: "Poppins_400Regular" },
  tabTextActive: { color: "#fff", fontFamily: "Poppins_500Medium" },
  content: { flex: 1 },
});