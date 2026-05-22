import { useState, useEffect, useCallback } from "react";

// ─── THEME & CONSTANTS ───────────────────────────────────────────────────────
const THEME = {
  bg: "#0a0a0f",
  surface: "#111118",
  card: "#16161f",
  border: "#1e1e2e",
  accent1: "#7c3aed",
  accent2: "#06b6d4",
  accent3: "#10b981",
  accent4: "#f59e0b",
  accent5: "#ef4444",
  text: "#e2e8f0",
  muted: "#64748b",
  gold: "#fbbf24",
};

const HABITS = [
  { id: "gym", label: "Gym 💪", xp: 30, color: "#ef4444" },
  { id: "study", label: "Estudiar 📚", xp: 25, color: "#7c3aed" },
  { id: "water", label: "Tomar agua 💧", xp: 10, color: "#06b6d4" },
  { id: "sleep", label: "Dormir temprano 🌙", xp: 20, color: "#6366f1" },
  { id: "walk", label: "Caminar 🚶", xp: 15, color: "#10b981" },
  { id: "nosoda", label: "No gaseosa 🚫", xp: 15, color: "#f59e0b" },
  { id: "read", label: "Leer 📖", xp: 20, color: "#ec4899" },
  { id: "meditate", label: "Meditar 🧘", xp: 20, color: "#8b5cf6" },
];

const EXPENSE_CATS = ["comida", "transporte", "universidad", "gym", "ocio", "ahorro", "otros"];

const MOTIVATIONAL = [
  "La disciplina es la diferencia entre tus metas y tus logros. 🔥",
  "Cada repetición cuenta. Cada sol ahorrado cuenta. 💪",
  "No es quién eres, es quién decides ser hoy. ⚡",
  "Tu futuro yo te está agradeciendo por lo que haces ahora. 🌟",
  "Pequeñas acciones consistentes crean grandes transformaciones. 🚀",
  "El dolor de hoy es el poder de mañana. 💎",
  "Sé implacable con tus hábitos. Flexible con tus métodos. 🎯",
];

const ACHIEVEMENTS = [
  { id: "first_habit", label: "Primer Hábito", desc: "Completa tu primer hábito", icon: "⭐", xp: 50, req: (s) => s.totalXP >= 10 },
  { id: "week_streak", label: "Racha Semanal", desc: "7 días de racha", icon: "🔥", xp: 200, req: (s) => s.streak >= 7 },
  { id: "saver", label: "Ahorrador", desc: "Ahorra 15 soles", icon: "💰", xp: 100, req: (s) => s.savings >= 15 },
  { id: "fit_start", label: "Inicio Fitness", desc: "Registra tu primer peso", icon: "💪", xp: 50, req: (s) => s.weightLogged },
  { id: "scholar", label: "Académico", desc: "Completa 5 tareas", icon: "🎓", xp: 150, req: (s) => s.tasksCompleted >= 5 },
  { id: "level5", label: "Nivel 5", desc: "Alcanza el nivel 5", icon: "👑", xp: 300, req: (s) => s.level >= 5 },
];

const XP_PER_LEVEL = 500;

function getLevelInfo(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const progress = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  const titles = ["Novato", "Aprendiz", "Dedicado", "Constante", "Imparable", "Élite", "Maestro", "Leyenda"];
  return { level, progress, title: titles[Math.min(level - 1, titles.length - 1)], xpNext: XP_PER_LEVEL - (xp % XP_PER_LEVEL) };
}

const todayStr = () => new Date().toISOString().split("T")[0];
const weekStr = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  return mon.toISOString().split("T")[0];
};

// ─── STORAGE ─────────────────────────────────────────────────────────────────
function useStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  const save = useCallback((v) => { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key]);
  return [val, save];
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
const Card = ({ children, className = "", style = {} }) => (
  <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: 20, ...style }} className={className}>
    {children}
  </div>
);

const Badge = ({ children, color = THEME.accent1 }) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
    {children}
  </span>
);

const ProgressBar = ({ value, max = 100, color = THEME.accent1, height = 8, label = "" }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      {label && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: THEME.muted, marginBottom: 4 }}>
        <span>{label}</span><span style={{ color: THEME.text }}>{Math.round(pct)}%</span>
      </div>}
      <div style={{ background: THEME.border, borderRadius: 99, height, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${color}, ${color}bb)`, borderRadius: 99, transition: "width 0.6s ease", boxShadow: `0 0 8px ${color}66` }} />
      </div>
    </div>
  );
};

const Stat = ({ label, value, unit = "", color = THEME.accent2, icon = "" }) => (
  <div style={{ background: THEME.surface, borderRadius: 12, padding: "12px 16px", border: `1px solid ${THEME.border}` }}>
    <div style={{ color: THEME.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{icon} {label}</div>
    <div style={{ color, fontSize: 22, fontWeight: 800 }}>{value}<span style={{ fontSize: 13, fontWeight: 400, color: THEME.muted }}> {unit}</span></div>
  </div>
);

// ─── MINI CHART ───────────────────────────────────────────────────────────────
const MiniChart = ({ data, color = THEME.accent1, height = 60, label = "" }) => {
  if (!data || data.length === 0) return <div style={{ color: THEME.muted, fontSize: 12, textAlign: "center", paddingTop: 20 }}>Sin datos aún</div>;
  const max = Math.max(...data.map(d => d.value || 0), 1);
  const min = Math.min(...data.map(d => d.value || 0), 0);
  const range = max - min || 1;
  const w = 100 / Math.max(data.length - 1, 1);
  const points = data.map((d, i) => `${i * w},${height - ((d.value - min) / range) * (height - 10)}`).join(" ");
  return (
    <div>
      {label && <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 6 }}>{label}</div>}
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
        {data.map((d, i) => (
          <circle key={i} cx={i * w} cy={height - ((d.value - min) / range) * (height - 10)} r="2" fill={color} />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: THEME.muted }}>
        {data.slice(-5).map((d, i) => <span key={i}>{d.label || ""}</span>)}
      </div>
    </div>
  );
};

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", icon: "⚡", label: "Dashboard" },
  { id: "fitness", icon: "💪", label: "Fitness" },
  { id: "finance", icon: "💰", label: "Finanzas" },
  { id: "habits", icon: "🔥", label: "Hábitos" },
  { id: "academic", icon: "🎓", label: "Académico" },
  { id: "rpg", icon: "👑", label: "RPG / XP" },
  { id: "couple", icon: "💑", label: "Pareja" },
  { id: "review", icon: "📊", label: "Revisión" },
];

// ════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════════════
export default function LifeOS() {
  const [tab, setTab] = useState("dashboard");
  const [profile, saveProfile] = useStorage("life_profile", { name: "Usuario", partner: "Pareja", startWeight: 100, goalWeight: 82, height: 1.80 });
  const [fitnessLog, saveFitness] = useStorage("life_fitness", []);
  const [financeLog, saveFinance] = useStorage("life_finance", []);
  const [habitsLog, saveHabits] = useStorage("life_habits", {});
  const [tasks, saveTasks] = useStorage("life_tasks", []);
  const [emotions, saveEmotions] = useStorage("life_emotions", []);
  const [coupleHabits, saveCoupleHabits] = useStorage("life_couple", {});
  const [totalXP, saveXP] = useStorage("life_xp", 0);
  const [unlockedAch, saveAch] = useStorage("life_ach", []);
  const [motivIdx] = useState(Math.floor(Math.random() * MOTIVATIONAL.length));

  const today = todayStr();
  const todayHabits = habitsLog[today] || {};
  const streak = calcStreak(habitsLog);
  const levelInfo = getLevelInfo(totalXP);
  const imc = fitnessLog.length > 0 ? (fitnessLog[fitnessLog.length - 1].weight / (profile.height * profile.height)).toFixed(1) : null;
  const currentWeight = fitnessLog.length > 0 ? fitnessLog[fitnessLog.length - 1].weight : profile.startWeight;
  const weightProgress = Math.max(0, Math.min(100, ((profile.startWeight - currentWeight) / (profile.startWeight - profile.goalWeight)) * 100));
  const totalSavings = financeLog.filter(e => e.category === "ahorro").reduce((s, e) => s + e.amount, 0);
  const weeklySavings = financeLog.filter(e => e.category === "ahorro" && e.date >= weekStr()).reduce((s, e) => s + e.amount, 0);
  const tasksCompleted = tasks.filter(t => t.done).length;

  // Achievement checker
  useEffect(() => {
    const state = { totalXP, streak, savings: totalSavings, weightLogged: fitnessLog.length > 0, tasksCompleted, level: levelInfo.level };
    ACHIEVEMENTS.forEach(a => {
      if (!unlockedAch.includes(a.id) && a.req(state)) {
        saveAch([...unlockedAch, a.id]);
        saveXP(totalXP + a.xp);
      }
    });
  }, [totalXP, streak, totalSavings, fitnessLog.length, tasksCompleted]);

  function toggleHabit(id) {
    const current = habitsLog[today] || {};
    const wasOn = current[id];
    const updated = { ...habitsLog, [today]: { ...current, [id]: !wasOn } };
    saveHabits(updated);
    if (!wasOn) {
      const h = HABITS.find(h => h.id === id);
      if (h) saveXP(totalXP + h.xp);
    }
  }

  const tabs = {
    dashboard: <DashboardTab profile={profile} saveProfile={saveProfile} levelInfo={levelInfo} totalXP={totalXP} streak={streak} imc={imc} currentWeight={currentWeight} weightProgress={weightProgress} totalSavings={totalSavings} weeklySavings={weeklySavings} tasksCompleted={tasksCompleted} tasks={tasks} todayHabits={todayHabits} fitnessLog={fitnessLog} motiv={MOTIVATIONAL[motivIdx]} />,
    fitness: <FitnessTab log={fitnessLog} saveLog={saveFitness} profile={profile} imc={imc} weightProgress={weightProgress} />,
    finance: <FinanceTab log={financeLog} saveLog={saveFinance} totalSavings={totalSavings} weeklySavings={weeklySavings} />,
    habits: <HabitsTab habitsLog={habitsLog} today={today} todayHabits={todayHabits} toggleHabit={toggleHabit} streak={streak} />,
    academic: <AcademicTab tasks={tasks} saveTasks={saveTasks} saveXP={saveXP} totalXP={totalXP} />,
    rpg: <RPGTab levelInfo={levelInfo} totalXP={totalXP} unlockedAch={unlockedAch} habitsLog={habitsLog} streak={streak} />,
    couple: <CoupleTab coupleHabits={coupleHabits} saveCoupleHabits={saveCoupleHabits} profile={profile} today={today} saveXP={saveXP} totalXP={totalXP} />,
    review: <ReviewTab fitnessLog={fitnessLog} financeLog={financeLog} habitsLog={habitsLog} tasks={tasks} emotions={emotions} saveEmotions={saveEmotions} totalXP={totalXP} streak={streak} />,
  };

  return (
    <div style={{ background: THEME.bg, minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", color: THEME.text }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${THEME.surface} 0%, #0f0f1a 100%)`, borderBottom: `1px solid ${THEME.border}`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${THEME.accent1}, ${THEME.accent2})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: 1, background: `linear-gradient(90deg, ${THEME.accent1}, ${THEME.accent2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>LIFE OS</div>
            <div style={{ fontSize: 10, color: THEME.muted, letterSpacing: 2 }}>SISTEMA OPERATIVO PERSONAL</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: THEME.muted }}>Nivel {levelInfo.level} · {levelInfo.title}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: THEME.gold }}>{totalXP.toLocaleString()} XP</div>
          </div>
          <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${THEME.accent1}44, ${THEME.accent2}44)`, borderRadius: "50%", border: `2px solid ${THEME.accent1}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            {levelInfo.level >= 6 ? "👑" : levelInfo.level >= 4 ? "⚔️" : "🛡️"}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ background: THEME.surface, borderBottom: `1px solid ${THEME.border}`, overflowX: "auto", display: "flex", padding: "0 10px" }}>
        {NAV_ITEMS.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{
            background: "none", border: "none", color: tab === n.id ? THEME.accent1 : THEME.muted, cursor: "pointer",
            padding: "12px 14px", whiteSpace: "nowrap", fontSize: 12, fontWeight: tab === n.id ? 700 : 500,
            borderBottom: `2px solid ${tab === n.id ? THEME.accent1 : "transparent"}`, transition: "all 0.2s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 100px" }}>
        {tabs[tab]}
      </div>
    </div>
  );
}

// ─── STREAK CALC ──────────────────────────────────────────────────────────────
function calcStreak(habitsLog) {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().split("T")[0];
    const day = habitsLog[key] || {};
    const done = Object.values(day).filter(Boolean).length;
    if (done > 0) { streak++; d.setDate(d.getDate() - 1); }
    else if (i === 0) { d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD TAB
// ════════════════════════════════════════════════════════════════════════════
function DashboardTab({ profile, saveProfile, levelInfo, totalXP, streak, imc, currentWeight, weightProgress, totalSavings, weeklySavings, tasksCompleted, tasks, todayHabits, fitnessLog, motiv }) {
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(profile.name);
  const habitsDoneToday = Object.values(todayHabits).filter(Boolean).length;
  const habitsTotal = HABITS.length;
  const pendingTasks = tasks.filter(t => !t.done && t.priority === "alta").length;
  const weightData = fitnessLog.slice(-7).map((f, i) => ({ value: f.weight, label: f.date?.slice(5) || "" }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Welcome */}
      <Card style={{ background: `linear-gradient(135deg, ${THEME.accent1}22, ${THEME.accent2}11)`, border: `1px solid ${THEME.accent1}33` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
          <div>
            {editName ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input value={name} onChange={e => setName(e.target.value)} style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "4px 8px", color: THEME.text, fontSize: 18, fontWeight: 700 }} />
                <button onClick={() => { saveProfile({ ...profile, name }); setEditName(false); }} style={{ background: THEME.accent3, border: "none", borderRadius: 8, color: "#fff", padding: "4px 10px", cursor: "pointer" }}>✓</button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>¡Hola, {profile.name}! 🔥</h2>
                <button onClick={() => setEditName(true)} style={{ background: "none", border: "none", color: THEME.muted, cursor: "pointer", fontSize: 14 }}>✏️</button>
              </div>
            )}
            <p style={{ margin: "4px 0 0", color: THEME.muted, fontSize: 13 }}>Nivel {levelInfo.level} · {levelInfo.title} · Racha: {streak} días 🔥</p>
          </div>
          <Badge color={THEME.gold}>{new Date().toLocaleDateString("es-PE", { weekday: "long", month: "long", day: "numeric" })}</Badge>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: THEME.muted, marginBottom: 4 }}>
            <span>XP · Nivel {levelInfo.level}</span>
            <span style={{ color: THEME.gold }}>{totalXP} / {(levelInfo.level) * XP_PER_LEVEL} XP</span>
          </div>
          <ProgressBar value={levelInfo.progress} color={THEME.gold} height={10} />
          <div style={{ fontSize: 11, color: THEME.muted, marginTop: 4, textAlign: "right" }}>{levelInfo.xpNext} XP para Nivel {levelInfo.level + 1}</div>
        </div>
      </Card>

      {/* Motivational */}
      <Card style={{ background: `linear-gradient(135deg, ${THEME.surface}, #1a1a2e)`, borderLeft: `3px solid ${THEME.accent1}` }}>
        <div style={{ fontSize: 11, color: THEME.accent1, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>💡 FRASE DEL DÍA</div>
        <div style={{ fontSize: 15, fontStyle: "italic", color: THEME.text, lineHeight: 1.5 }}>"{motiv}"</div>
      </Card>

      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
        <Stat label="Peso actual" value={currentWeight} unit="kg" color={THEME.accent2} icon="⚖️" />
        <Stat label="IMC" value={imc || "—"} color={imc > 25 ? THEME.accent5 : THEME.accent3} icon="📊" />
        <Stat label="Ahorro total" value={`S/ ${totalSavings}`} color={THEME.accent3} icon="💰" />
        <Stat label="Esta semana" value={`S/ ${weeklySavings}`} color={THEME.gold} icon="📈" />
        <Stat label="Racha" value={streak} unit="días" color={THEME.accent5} icon="🔥" />
        <Stat label="Tareas ✓" value={tasksCompleted} color={THEME.accent1} icon="✅" />
      </div>

      {/* Progress Areas */}
      <Card>
        <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>📊 PROGRESO GENERAL</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ProgressBar value={weightProgress} label="💪 Fitness (Objetivo de peso)" color={THEME.accent5} height={12} />
          <ProgressBar value={Math.min((totalSavings / 800) * 100, 100)} label="💰 Finanzas (Meta anual S/ 800)" color={THEME.accent3} height={12} />
          <ProgressBar value={(habitsDoneToday / habitsTotal) * 100} label={`🔥 Hábitos hoy (${habitsDoneToday}/${habitsTotal})`} color={THEME.accent1} height={12} />
          <ProgressBar value={tasks.length > 0 ? (tasksCompleted / tasks.length) * 100 : 0} label={`🎓 Académico (${tasksCompleted}/${tasks.length} tareas)`} color={THEME.accent2} height={12} />
        </div>
      </Card>

      {/* Today's Habits Quick */}
      <Card>
        <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>🔥 HÁBITOS HOY</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {HABITS.map(h => (
            <div key={h.id} style={{ background: todayHabits[h.id] ? h.color + "33" : THEME.surface, border: `1px solid ${todayHabits[h.id] ? h.color : THEME.border}`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: todayHabits[h.id] ? h.color : THEME.muted }}>
              {h.label} {todayHabits[h.id] ? "✓" : ""}
            </div>
          ))}
        </div>
        {pendingTasks > 0 && <div style={{ marginTop: 10, padding: "8px 12px", background: THEME.accent5 + "22", border: `1px solid ${THEME.accent5}44`, borderRadius: 8, fontSize: 12, color: THEME.accent5 }}>⚠️ Tienes {pendingTasks} tarea(s) de alta prioridad pendientes</div>}
      </Card>

      {/* Weight Chart */}
      {weightData.length > 1 && (
        <Card>
          <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>📉 TENDENCIA DE PESO (últimos 7 días)</div>
          <MiniChart data={weightData} color={THEME.accent2} height={70} />
        </Card>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FITNESS TAB
// ════════════════════════════════════════════════════════════════════════════
function FitnessTab({ log, saveLog, profile, imc, weightProgress }) {
  const [form, setForm] = useState({ date: todayStr(), weight: "", calories: "", water: "", steps: "", gym: false, cardio: false, sleep: "" });

  function addEntry() {
    if (!form.weight) return;
    saveLog([...log, { ...form, weight: parseFloat(form.weight), calories: parseInt(form.calories) || 0, water: parseFloat(form.water) || 0, steps: parseInt(form.steps) || 0, sleep: parseFloat(form.sleep) || 0 }]);
    setForm({ date: todayStr(), weight: "", calories: "", water: "", steps: "", gym: false, cardio: false, sleep: "" });
  }

  const latest = log.length > 0 ? log[log.length - 1] : null;
  const weightData = log.slice(-14).map(f => ({ value: f.weight, label: f.date?.slice(5) || "" }));
  const caloriesData = log.slice(-7).map(f => ({ value: f.calories, label: f.date?.slice(5) || "" }));
  const imcVal = latest ? (latest.weight / (profile.height * profile.height)).toFixed(1) : null;
  const imcStatus = imcVal ? (imcVal < 18.5 ? ["Bajo peso", THEME.accent2] : imcVal < 25 ? ["Normal", THEME.accent3] : imcVal < 30 ? ["Sobrepeso", THEME.gold] : ["Obesidad", THEME.accent5]) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        <Stat label="Peso actual" value={latest?.weight || profile.startWeight} unit="kg" color={THEME.accent2} icon="⚖️" />
        <Stat label="Objetivo" value={profile.goalWeight} unit="kg" color={THEME.accent3} icon="🎯" />
        <Stat label="IMC" value={imcVal || "—"} color={imcStatus?.[1] || THEME.muted} icon="📊" />
        <Stat label="Por bajar" value={`${Math.max(0, (latest?.weight || profile.startWeight) - profile.goalWeight).toFixed(1)}`} unit="kg" color={THEME.accent5} icon="📉" />
      </div>

      {imcStatus && (
        <Card style={{ borderLeft: `3px solid ${imcStatus[1]}` }}>
          <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 8 }}>Estado IMC</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: imcStatus[1] }}>{imcVal}</div>
            <Badge color={imcStatus[1]}>{imcStatus[0]}</Badge>
          </div>
          <div style={{ marginTop: 12 }}>
            <ProgressBar value={weightProgress} label="Progreso hacia objetivo" color={THEME.accent3} height={10} />
          </div>
        </Card>
      )}

      {/* Entry Form */}
      <Card>
        <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>➕ REGISTRAR HOY</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          {[["date", "📅 Fecha", "date"], ["weight", "⚖️ Peso (kg)", "number"], ["calories", "🔥 Calorías", "number"], ["water", "💧 Agua (L)", "number"], ["steps", "🚶 Pasos", "number"], ["sleep", "😴 Sueño (h)", "number"]].map(([k, l, t]) => (
            <div key={k}>
              <label style={{ fontSize: 11, color: THEME.muted, display: "block", marginBottom: 4 }}>{l}</label>
              <input type={t} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} style={{ width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "8px 10px", color: THEME.text, fontSize: 13, boxSizing: "border-box" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          {[["gym", "💪 Gym"], ["cardio", "🏃 Cardio"]].map(([k, l]) => (
            <label key={k} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: form[k] ? THEME.accent3 : THEME.muted, fontSize: 13 }}>
              <input type="checkbox" checked={form[k]} onChange={e => setForm({ ...form, [k]: e.target.checked })} />
              {l}
            </label>
          ))}
        </div>
        <button onClick={addEntry} style={{ marginTop: 14, background: `linear-gradient(135deg, ${THEME.accent1}, ${THEME.accent2})`, border: "none", borderRadius: 10, color: "#fff", padding: "10px 20px", fontWeight: 700, cursor: "pointer", width: "100%", fontSize: 14 }}>
          Guardar Entrada
        </button>
      </Card>

      {/* Charts */}
      {weightData.length > 1 && (
        <Card>
          <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>📉 CURVA DE PESO (14 días)</div>
          <MiniChart data={weightData} color={THEME.accent2} height={80} />
        </Card>
      )}
      {caloriesData.length > 1 && (
        <Card>
          <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>🔥 CALORÍAS (7 días)</div>
          <MiniChart data={caloriesData} color={THEME.accent5} height={60} />
        </Card>
      )}

      {/* Log */}
      {log.length > 0 && (
        <Card>
          <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>📋 HISTORIAL RECIENTE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {log.slice(-7).reverse().map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: THEME.surface, borderRadius: 8, fontSize: 12, flexWrap: "wrap", gap: 6 }}>
                <span style={{ color: THEME.muted }}>{e.date}</span>
                <span style={{ color: THEME.accent2, fontWeight: 700 }}>{e.weight} kg</span>
                {e.calories > 0 && <span style={{ color: THEME.accent5 }}>🔥 {e.calories} cal</span>}
                {e.water > 0 && <span style={{ color: THEME.accent2 }}>💧 {e.water}L</span>}
                {e.sleep > 0 && <span style={{ color: THEME.accent1 }}>😴 {e.sleep}h</span>}
                {e.gym && <Badge color={THEME.accent3}>GYM</Badge>}
                {e.cardio && <Badge color={THEME.accent4}>CARDIO</Badge>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FINANCE TAB
// ════════════════════════════════════════════════════════════════════════════
function FinanceTab({ log, saveLog, totalSavings, weeklySavings }) {
  const [form, setForm] = useState({ date: todayStr(), type: "gasto", amount: "", category: "comida", note: "" });

  function addEntry() {
    if (!form.amount) return;
    saveLog([...log, { ...form, amount: parseFloat(form.amount) }]);
    setForm({ date: todayStr(), type: "gasto", amount: "", category: "comida", note: "" });
  }

  const totalIncome = log.filter(e => e.type === "ingreso").reduce((s, e) => s + e.amount, 0);
  const totalExpense = log.filter(e => e.type === "gasto").reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const byCat = EXPENSE_CATS.reduce((acc, cat) => {
    acc[cat] = log.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
    return acc;
  }, {});

  const weekData = (() => {
    const weeks = {};
    log.forEach(e => {
      const d = new Date(e.date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(d); mon.setDate(diff);
      const key = mon.toISOString().split("T")[0];
      if (!weeks[key]) weeks[key] = 0;
      if (e.category === "ahorro") weeks[key] += e.amount;
    });
    return Object.entries(weeks).slice(-6).map(([k, v]) => ({ value: v, label: k.slice(5) }));
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        <Stat label="Balance" value={`S/ ${balance.toFixed(2)}`} color={balance >= 0 ? THEME.accent3 : THEME.accent5} icon="⚖️" />
        <Stat label="Ingresos" value={`S/ ${totalIncome.toFixed(2)}`} color={THEME.accent3} icon="📈" />
        <Stat label="Gastos" value={`S/ ${totalExpense.toFixed(2)}`} color={THEME.accent5} icon="📉" />
        <Stat label="Ahorro total" value={`S/ ${totalSavings.toFixed(2)}`} color={THEME.gold} icon="💰" />
        <Stat label="Ahorro semana" value={`S/ ${weeklySavings.toFixed(2)}`} color={THEME.accent2} icon="📅" />
      </div>

      <Card>
        <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>🎯 META DE AHORRO</div>
        <ProgressBar value={(weeklySavings / 15) * 100} label="Meta semanal S/ 15" color={THEME.accent3} height={12} />
        <ProgressBar value={(totalSavings / 800) * 100} label="Meta anual S/ 800" color={THEME.gold} height={12} />
        <div style={{ marginTop: 10, fontSize: 13, color: THEME.muted }}>Ahorro semanal actual: <span style={{ color: weeklySavings >= 15 ? THEME.accent3 : THEME.gold, fontWeight: 700 }}>S/ {weeklySavings.toFixed(2)}</span> de S/ 15 meta</div>
      </Card>

      {/* Form */}
      <Card>
        <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>➕ REGISTRAR MOVIMIENTO</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: THEME.muted, display: "block", marginBottom: 4 }}>📅 Fecha</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={{ width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "8px 10px", color: THEME.text, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: THEME.muted, display: "block", marginBottom: 4 }}>Tipo</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "8px 10px", color: THEME.text, fontSize: 13 }}>
              <option value="ingreso">💚 Ingreso</option>
              <option value="gasto">🔴 Gasto</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: THEME.muted, display: "block", marginBottom: 4 }}>💵 Monto (S/)</label>
            <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={{ width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "8px 10px", color: THEME.text, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: THEME.muted, display: "block", marginBottom: 4 }}>Categoría</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "8px 10px", color: THEME.text, fontSize: 13 }}>
              {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: THEME.muted, display: "block", marginBottom: 4 }}>📝 Nota</label>
            <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} style={{ width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "8px 10px", color: THEME.text, fontSize: 13, boxSizing: "border-box" }} />
          </div>
        </div>
        <button onClick={addEntry} style={{ marginTop: 14, background: `linear-gradient(135deg, ${THEME.accent3}, ${THEME.accent2})`, border: "none", borderRadius: 10, color: "#fff", padding: "10px 20px", fontWeight: 700, cursor: "pointer", width: "100%", fontSize: 14 }}>
          Registrar
        </button>
      </Card>

      {/* By Category */}
      <Card>
        <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>📊 POR CATEGORÍA</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {EXPENSE_CATS.map((cat, i) => {
            const colors = [THEME.accent5, THEME.accent2, THEME.accent1, THEME.accent3, THEME.gold, THEME.accent3, THEME.muted];
            const total = log.filter(e => e.type === "gasto" || cat === "ahorro").reduce((s, e) => s + e.amount, 0) || 1;
            return byCat[cat] > 0 ? (
              <div key={cat}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: THEME.text, textTransform: "capitalize" }}>{cat}</span>
                  <span style={{ color: colors[i], fontWeight: 700 }}>S/ {byCat[cat].toFixed(2)}</span>
                </div>
                <ProgressBar value={(byCat[cat] / Math.max(...Object.values(byCat), 1)) * 100} color={colors[i]} height={6} />
              </div>
            ) : null;
          })}
        </div>
      </Card>

      {/* Savings chart */}
      {weekData.length > 1 && (
        <Card>
          <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>💰 AHORRO SEMANAL</div>
          <MiniChart data={weekData} color={THEME.accent3} height={70} />
        </Card>
      )}

      {/* Recent */}
      {log.length > 0 && (
        <Card>
          <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>📋 ÚLTIMOS MOVIMIENTOS</div>
          {log.slice(-8).reverse().map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${THEME.border}`, fontSize: 12, flexWrap: "wrap", gap: 4 }}>
              <div>
                <span style={{ color: THEME.muted, marginRight: 8 }}>{e.date}</span>
                <span style={{ textTransform: "capitalize" }}>{e.category}</span>
                {e.note && <span style={{ color: THEME.muted }}> · {e.note}</span>}
              </div>
              <span style={{ fontWeight: 700, color: e.type === "ingreso" ? THEME.accent3 : THEME.accent5 }}>
                {e.type === "ingreso" ? "+" : "-"}S/ {e.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HABITS TAB
// ════════════════════════════════════════════════════════════════════════════
function HabitsTab({ habitsLog, today, todayHabits, toggleHabit, streak }) {
  const doneCnt = Object.values(todayHabits).filter(Boolean).length;

  // Last 7 days completion
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const day = habitsLog[key] || {};
    const done = Object.values(day).filter(Boolean).length;
    return { date: key, done, label: d.toLocaleDateString("es", { weekday: "short" }) };
  });

  // Per-habit stats
  const habitStats = HABITS.map(h => {
    const total = Object.keys(habitsLog).length;
    const done = Object.values(habitsLog).filter(d => d[h.id]).length;
    return { ...h, done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Today header */}
      <Card style={{ background: `linear-gradient(135deg, ${THEME.accent1}22, ${THEME.surface})` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{doneCnt}/{HABITS.length} Hábitos</div>
            <div style={{ fontSize: 12, color: THEME.muted }}>Hoy · {new Date().toLocaleDateString("es-PE", { weekday: "long" })}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32 }}>{streak >= 7 ? "🔥" : streak >= 3 ? "⚡" : "💫"}</div>
            <div style={{ fontSize: 11, color: THEME.gold, fontWeight: 700 }}>{streak} días</div>
          </div>
        </div>
        <ProgressBar value={(doneCnt / HABITS.length) * 100} color={THEME.accent1} height={12} />
      </Card>

      {/* Habit Checkboxes */}
      <Card>
        <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>✅ CHECKLIST DIARIO</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {HABITS.map(h => {
            const done = !!todayHabits[h.id];
            return (
              <div key={h.id} onClick={() => toggleHabit(h.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: done ? h.color + "22" : THEME.surface, border: `1px solid ${done ? h.color : THEME.border}`, borderRadius: 10, cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: done ? h.color : THEME.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, transition: "all 0.2s" }}>
                    {done ? "✓" : ""}
                  </div>
                  <span style={{ fontWeight: 600, color: done ? THEME.text : THEME.muted }}>{h.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Badge color={h.color}>+{h.xp} XP</Badge>
                  {done && <span style={{ fontSize: 16 }}>🌟</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Last 7 days heatmap */}
      <Card>
        <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>📅 ÚLTIMOS 7 DÍAS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {last7.map((d, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: THEME.muted, marginBottom: 4 }}>{d.label}</div>
              <div style={{ background: d.done === 0 ? THEME.surface : d.done < 4 ? THEME.accent1 + "44" : d.done < 7 ? THEME.accent1 + "88" : THEME.accent1, borderRadius: 8, padding: "8px 4px", border: `1px solid ${THEME.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: d.done > 0 ? THEME.text : THEME.muted }}>{d.done}</div>
                <div style={{ fontSize: 9, color: THEME.muted }}>/{HABITS.length}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Per-habit stats */}
      <Card>
        <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>📊 ESTADÍSTICAS POR HÁBITO</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {habitStats.map(h => (
            <div key={h.id}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span>{h.label}</span>
                <span style={{ color: h.color, fontWeight: 700 }}>{h.done} veces ({h.pct}%)</span>
              </div>
              <ProgressBar value={h.pct} color={h.color} height={6} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ACADEMIC TAB
// ════════════════════════════════════════════════════════════════════════════
function AcademicTab({ tasks, saveTasks, saveXP, totalXP }) {
  const [form, setForm] = useState({ title: "", course: "", due: "", priority: "media", type: "tarea", hours: "", notes: "" });
  const [filter, setFilter] = useState("all");

  function addTask() {
    if (!form.title) return;
    saveTasks([...tasks, { ...form, id: Date.now(), done: false, createdAt: todayStr() }]);
    setForm({ title: "", course: "", due: "", priority: "media", type: "tarea", hours: "", notes: "" });
  }

  function toggleTask(id) {
    const t = tasks.find(t => t.id === id);
    if (!t.done) saveXP(totalXP + 40);
    saveTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function deleteTask(id) { saveTasks(tasks.filter(t => t.id !== id)); }

  const filtered = tasks.filter(t => filter === "all" ? true : filter === "pending" ? !t.done : t.done);
  const byPriority = { alta: "#ef4444", media: "#f59e0b", baja: "#10b981" };

  const totalHours = tasks.reduce((s, t) => s + (parseFloat(t.hours) || 0), 0);
  const byType = ["tarea", "examen", "proyecto", "curso"].reduce((acc, type) => { acc[type] = tasks.filter(t => t.type === type).length; return acc; }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
        <Stat label="Total tareas" value={tasks.length} color={THEME.accent1} icon="📚" />
        <Stat label="Completadas" value={tasks.filter(t => t.done).length} color={THEME.accent3} icon="✅" />
        <Stat label="Pendientes" value={tasks.filter(t => !t.done).length} color={THEME.accent5} icon="⏳" />
        <Stat label="Horas totales" value={totalHours.toFixed(0)} unit="h" color={THEME.accent2} icon="⏱️" />
      </div>

      {/* Type breakdown */}
      <Card>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(byType).map(([type, cnt]) => cnt > 0 && (
            <div key={type} style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>
              <span style={{ color: THEME.muted, textTransform: "capitalize" }}>{type}s: </span>
              <span style={{ color: THEME.text, fontWeight: 700 }}>{cnt}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Form */}
      <Card>
        <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>➕ AGREGAR TAREA/CURSO</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          {[["title", "📝 Título", "text"], ["course", "🏫 Curso", "text"], ["due", "📅 Fecha límite", "date"], ["hours", "⏱️ Horas estimadas", "number"]].map(([k, l, t]) => (
            <div key={k}>
              <label style={{ fontSize: 11, color: THEME.muted, display: "block", marginBottom: 4 }}>{l}</label>
              <input type={t} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} style={{ width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "8px 10px", color: THEME.text, fontSize: 13, boxSizing: "border-box" }} />
            </div>
          ))}
          {[["priority", "Prioridad", [["alta", "🔴 Alta"], ["media", "🟡 Media"], ["baja", "🟢 Baja"]]], ["type", "Tipo", [["tarea", "Tarea"], ["examen", "Examen"], ["proyecto", "Proyecto"], ["curso", "Curso online"]]]].map(([k, l, opts]) => (
            <div key={k}>
              <label style={{ fontSize: 11, color: THEME.muted, display: "block", marginBottom: 4 }}>{l}</label>
              <select value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} style={{ width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "8px 10px", color: THEME.text, fontSize: 13 }}>
                {opts.map(([v, lbl]) => <option key={v} value={v}>{lbl}</option>)}
              </select>
            </div>
          ))}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 11, color: THEME.muted, display: "block", marginBottom: 4 }}>📝 Notas</label>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "8px 10px", color: THEME.text, fontSize: 13, boxSizing: "border-box" }} />
          </div>
        </div>
        <button onClick={addTask} style={{ marginTop: 14, background: `linear-gradient(135deg, ${THEME.accent1}, ${THEME.accent2})`, border: "none", borderRadius: 10, color: "#fff", padding: "10px 20px", fontWeight: 700, cursor: "pointer", width: "100%", fontSize: 14 }}>
          Agregar (+40 XP al completar)
        </button>
      </Card>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8 }}>
        {[["all", "Todas"], ["pending", "Pendientes"], ["done", "Completadas"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ background: filter === v ? THEME.accent1 : THEME.surface, border: `1px solid ${filter === v ? THEME.accent1 : THEME.border}`, borderRadius: 8, padding: "6px 14px", color: THEME.text, cursor: "pointer", fontSize: 12, fontWeight: filter === v ? 700 : 400 }}>{l}</button>
        ))}
      </div>

      {/* Tasks list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && <div style={{ color: THEME.muted, textAlign: "center", padding: 20, fontSize: 13 }}>No hay tareas aquí aún 🎉</div>}
        {filtered.map(t => (
          <div key={t.id} style={{ background: THEME.card, border: `1px solid ${t.done ? THEME.accent3 + "44" : byPriority[t.priority] + "44"}`, borderLeft: `3px solid ${t.done ? THEME.accent3 : byPriority[t.priority]}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, textDecoration: t.done ? "line-through" : "none", color: t.done ? THEME.muted : THEME.text }}>{t.title}</span>
                  <Badge color={byPriority[t.priority]}>{t.priority}</Badge>
                  <Badge color={THEME.accent2}>{t.type}</Badge>
                </div>
                {t.course && <div style={{ fontSize: 11, color: THEME.muted, marginTop: 2 }}>🏫 {t.course}</div>}
                {t.due && <div style={{ fontSize: 11, color: new Date(t.due) < new Date() && !t.done ? THEME.accent5 : THEME.muted, marginTop: 2 }}>📅 {t.due}</div>}
                {t.hours && <div style={{ fontSize: 11, color: THEME.muted, marginTop: 2 }}>⏱️ {t.hours}h estimadas</div>}
                {t.notes && <div style={{ fontSize: 11, color: THEME.muted, marginTop: 4, fontStyle: "italic" }}>"{t.notes}"</div>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => toggleTask(t.id)} style={{ background: t.done ? THEME.accent3 + "33" : THEME.surface, border: `1px solid ${t.done ? THEME.accent3 : THEME.border}`, borderRadius: 6, color: t.done ? THEME.accent3 : THEME.muted, padding: "4px 8px", cursor: "pointer", fontSize: 14 }}>{t.done ? "✓" : "○"}</button>
                <button onClick={() => deleteTask(t.id)} style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 6, color: THEME.accent5, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RPG TAB
// ════════════════════════════════════════════════════════════════════════════
function RPGTab({ levelInfo, totalXP, unlockedAch, habitsLog, streak }) {
  const allDays = Object.keys(habitsLog).length;
  const perfectDays = Object.values(habitsLog).filter(d => Object.values(d).filter(Boolean).length === HABITS.length).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Character card */}
      <Card style={{ background: `linear-gradient(135deg, #1a0a2e, #0a1a2e)`, border: `1px solid ${THEME.accent1}44` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 70, height: 70, background: `linear-gradient(135deg, ${THEME.accent1}, ${THEME.accent2})`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, border: `3px solid ${THEME.gold}`, boxShadow: `0 0 20px ${THEME.accent1}66` }}>
            {levelInfo.level >= 7 ? "🏆" : levelInfo.level >= 5 ? "👑" : levelInfo.level >= 3 ? "⚔️" : "🛡️"}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: THEME.gold }}>{levelInfo.title}</div>
            <div style={{ fontSize: 14, color: THEME.muted }}>Nivel {levelInfo.level}</div>
            <div style={{ fontSize: 12, color: THEME.accent2 }}>{totalXP.toLocaleString()} XP total</div>
          </div>
        </div>
        <ProgressBar value={levelInfo.progress} color={THEME.gold} height={14} label={`Nivel ${levelInfo.level} → ${levelInfo.level + 1}`} />
        <div style={{ fontSize: 12, color: THEME.muted, marginTop: 6, textAlign: "right" }}>Faltan {levelInfo.xpNext} XP</div>
      </Card>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        <Stat label="Racha actual" value={streak} unit="días" color={THEME.accent5} icon="🔥" />
        <Stat label="Días totales" value={allDays} color={THEME.accent2} icon="📅" />
        <Stat label="Días perfectos" value={perfectDays} color={THEME.gold} icon="⭐" />
        <Stat label="Logros" value={`${unlockedAch.length}/${ACHIEVEMENTS.length}`} color={THEME.accent1} icon="🏆" />
      </div>

      {/* XP Sources */}
      <Card>
        <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>⚡ FUENTES DE XP</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {HABITS.map(h => (
            <div key={h.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${THEME.border}` }}>
              <span>{h.label}</span>
              <Badge color={h.color}>+{h.xp} XP/día</Badge>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${THEME.border}` }}>
            <span>✅ Completar tarea académica</span>
            <Badge color={THEME.accent1}>+40 XP</Badge>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0" }}>
            <span>🏆 Desbloquear logro</span>
            <Badge color={THEME.gold}>+50-300 XP</Badge>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card>
        <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>🏆 LOGROS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ACHIEVEMENTS.map(a => {
            const unlocked = unlockedAch.includes(a.id);
            return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: unlocked ? a.id && THEME.gold + "11" : THEME.surface, border: `1px solid ${unlocked ? THEME.gold + "44" : THEME.border}`, borderRadius: 10 }}>
                <div style={{ fontSize: 28, filter: unlocked ? "none" : "grayscale(100%) opacity(0.4)" }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: unlocked ? THEME.gold : THEME.muted, fontSize: 13 }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: THEME.muted }}>{a.desc}</div>
                </div>
                {unlocked ? <Badge color={THEME.gold}>+{a.xp} XP ✓</Badge> : <div style={{ fontSize: 11, color: THEME.muted }}>+{a.xp} XP</div>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Levels roadmap */}
      <Card>
        <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>🗺️ CAMINO DE NIVELES</div>
        {["Novato", "Aprendiz", "Dedicado", "Constante", "Imparable", "Élite", "Maestro", "Leyenda"].map((title, i) => {
          const lvl = i + 1;
          const unlocked = levelInfo.level >= lvl;
          const current = levelInfo.level === lvl;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 7 ? `1px solid ${THEME.border}` : "none" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: current ? `linear-gradient(135deg, ${THEME.accent1}, ${THEME.accent2})` : unlocked ? THEME.gold + "33" : THEME.surface, border: `2px solid ${current ? THEME.accent1 : unlocked ? THEME.gold : THEME.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: current ? "#fff" : unlocked ? THEME.gold : THEME.muted }}>{lvl}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: current ? 700 : 500, color: current ? THEME.text : unlocked ? THEME.gold : THEME.muted }}>{title} {current && "← TÚ AQUÍ"}</div>
                <div style={{ fontSize: 11, color: THEME.muted }}>{lvl * XP_PER_LEVEL} XP necesarios</div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COUPLE TAB
// ════════════════════════════════════════════════════════════════════════════
function CoupleTab({ coupleHabits, saveCoupleHabits, profile, today, saveXP, totalXP }) {
  const [partnerName, setPartnerName] = useState(profile.partner || "Pareja");
  const [editPartner, setEditPartner] = useState(false);

  const COUPLE_HABITS = [
    { id: "date_night", label: "Noche de cita 💑", xp: 50 },
    { id: "exercise_together", label: "Ejercicio juntos 🏃", xp: 30 },
    { id: "cook_together", label: "Cocinar juntos 🍳", xp: 20 },
    { id: "read_together", label: "Leer juntos 📖", xp: 20 },
    { id: "save_together", label: "Ahorro conjunto 💰", xp: 40 },
    { id: "no_phones", label: "Tiempo sin teléfono 📵", xp: 25 },
    { id: "walk_together", label: "Caminar juntos 🌿", xp: 20 },
    { id: "study_together", label: "Estudiar juntos 🎓", xp: 30 },
    { id: "gratitude", label: "Expresar gratitud 🙏", xp: 15 },
    { id: "plan_week", label: "Planear la semana 📅", xp: 35 },
  ];

  const todayCouple = coupleHabits[today] || {};
  const doneCnt = Object.values(todayCouple).filter(Boolean).length;

  function toggle(id) {
    const was = todayCouple[id];
    const updated = { ...coupleHabits, [today]: { ...todayCouple, [id]: !was } };
    saveCoupleHabits(updated);
    if (!was) {
      const h = COUPLE_HABITS.find(h => h.id === id);
      if (h) saveXP(totalXP + h.xp);
    }
  }

  // Stats
  const totalDays = Object.keys(coupleHabits).length;
  const totalDone = Object.values(coupleHabits).reduce((s, d) => s + Object.values(d).filter(Boolean).length, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ background: `linear-gradient(135deg, #2a0a1a, #0a1a2a)`, border: `1px solid #ec489944` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>💑 {profile.name} & {partnerName}</div>
            <div style={{ fontSize: 12, color: THEME.muted, marginTop: 2 }}>Modo pareja activado · Creciendo juntos</div>
          </div>
          {editPartner ? (
            <div style={{ display: "flex", gap: 6 }}>
              <input value={partnerName} onChange={e => setPartnerName(e.target.value)} style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: "4px 8px", color: THEME.text, fontSize: 13 }} />
              <button onClick={() => setEditPartner(false)} style={{ background: "#ec4899", border: "none", borderRadius: 8, color: "#fff", padding: "4px 10px", cursor: "pointer" }}>✓</button>
            </div>
          ) : (
            <button onClick={() => setEditPartner(true)} style={{ background: "#ec489922", border: `1px solid #ec489944`, borderRadius: 8, color: "#ec4899", padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>✏️ Editar nombre</button>
          )}
        </div>
        <div style={{ marginTop: 14 }}>
          <ProgressBar value={(doneCnt / COUPLE_HABITS.length) * 100} color="#ec4899" height={10} label={`Hábitos hoy: ${doneCnt}/${COUPLE_HABITS.length}`} />
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        <Stat label="Días activos" value={totalDays} color="#ec4899" icon="📅" />
        <Stat label="Total logros" value={totalDone} color={THEME.gold} icon="⭐" />
        <Stat label="Hoy" value={`${doneCnt}/${COUPLE_HABITS.length}`} color={THEME.accent2} icon="💑" />
      </div>

      <Card>
        <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>💕 HÁBITOS DE PAREJA HOY</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {COUPLE_HABITS.map(h => {
            const done = !!todayCouple[h.id];
            return (
              <div key={h.id} onClick={() => toggle(h.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: done ? "#ec489922" : THEME.surface, border: `1px solid ${done ? "#ec4899" : THEME.border}`, borderRadius: 10, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: done ? "#ec4899" : THEME.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{done ? "✓" : ""}</div>
                  <span style={{ color: done ? THEME.text : THEME.muted, fontWeight: 500 }}>{h.label}</span>
                </div>
                <Badge color="#ec4899">+{h.xp} XP</Badge>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>💌 NOTAS PARA LA PAREJA</div>
        <textarea placeholder={`Escribe algo para ${partnerName}...`} style={{ width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 10, color: THEME.text, fontSize: 13, minHeight: 80, boxSizing: "border-box", resize: "vertical" }} />
        <div style={{ marginTop: 8, fontSize: 11, color: THEME.muted }}>💡 Idea: planea vuestra semana, metas juntos, o simplemente un mensaje de amor 💕</div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// REVIEW TAB
// ════════════════════════════════════════════════════════════════════════════
function ReviewTab({ fitnessLog, financeLog, habitsLog, tasks, emotions, saveEmotions, totalXP, streak }) {
  const [emotion, setEmotion] = useState("");
  const [emotionNote, setEmotionNote] = useState("");
  const [energy, setEnergy] = useState(5);
  const [tab, setTab] = useState("weekly");

  const EMOTIONS = ["😄", "😊", "😐", "😔", "😤", "😴", "💪", "🧘", "😰", "🔥"];

  function logEmotion() {
    if (!emotion) return;
    saveEmotions([...emotions, { date: todayStr(), emotion, note: emotionNote, energy }]);
    setEmotion("");
    setEmotionNote("");
    setEnergy(5);
  }

  const weekHabits = Object.entries(habitsLog).filter(([d]) => d >= weekStr());
  const weekHabitPct = weekHabits.length > 0 ? Math.round((weekHabits.reduce((s, [, d]) => s + Object.values(d).filter(Boolean).length, 0) / (weekHabits.length * HABITS.length)) * 100) : 0;
  const weekSavings = financeLog.filter(e => e.category === "ahorro" && e.date >= weekStr()).reduce((s, e) => s + e.amount, 0);
  const weekTasksDone = tasks.filter(t => t.done && t.createdAt >= weekStr()).length;
  const latestWeight = fitnessLog.length > 0 ? fitnessLog[fitnessLog.length - 1].weight : 100;

  const energyData = emotions.slice(-7).map(e => ({ value: e.energy, label: e.date?.slice(5) || "" }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {[["weekly", "Semana"], ["monthly", "Mes"], ["emotions", "Emociones"]].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{ background: tab === v ? THEME.accent1 : THEME.surface, border: `1px solid ${tab === v ? THEME.accent1 : THEME.border}`, borderRadius: 8, padding: "6px 14px", color: THEME.text, cursor: "pointer", fontSize: 12, fontWeight: tab === v ? 700 : 400 }}>{l}</button>
        ))}
      </div>

      {tab === "weekly" && (
        <>
          <Card style={{ background: `linear-gradient(135deg, ${THEME.surface}, #1a1a2e)` }}>
            <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 12 }}>📊 RESUMEN SEMANAL</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 14 }}>
              <Stat label="Hábitos %" value={`${weekHabitPct}%`} color={weekHabitPct >= 70 ? THEME.accent3 : THEME.gold} icon="🔥" />
              <Stat label="Ahorro" value={`S/ ${weekSavings.toFixed(2)}`} color={weekSavings >= 15 ? THEME.accent3 : THEME.accent5} icon="💰" />
              <Stat label="Tareas" value={weekTasksDone} color={THEME.accent1} icon="✅" />
              <Stat label="Racha" value={streak} unit="días" color={THEME.accent5} icon="🔥" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <ProgressBar value={weekHabitPct} label="Cumplimiento de hábitos" color={THEME.accent1} height={10} />
              <ProgressBar value={(weekSavings / 15) * 100} label="Meta de ahorro S/ 15" color={THEME.accent3} height={10} />
              <ProgressBar value={(latestWeight < 100 ? ((100 - latestWeight) / (100 - 82)) * 100 : 0)} label="Progreso físico" color={THEME.accent5} height={10} />
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>📝 REFLEXIÓN SEMANAL</div>
            {[
              ["¿Qué salió bien esta semana?", "Lo que funcionó..."],
              ["¿Qué puedo mejorar?", "Áreas de mejora..."],
              ["¿Cuál es mi objetivo para la próxima semana?", "Mi meta principal..."],
            ].map(([lbl, ph]) => (
              <div key={lbl} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: THEME.muted, display: "block", marginBottom: 4 }}>{lbl}</label>
                <textarea placeholder={ph} style={{ width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 10, color: THEME.text, fontSize: 13, minHeight: 60, boxSizing: "border-box", resize: "vertical" }} />
              </div>
            ))}
          </Card>
        </>
      )}

      {tab === "monthly" && (
        <>
          <Card>
            <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 16 }}>📅 RESUMEN MENSUAL</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
              <Stat label="XP ganados" value={totalXP.toLocaleString()} color={THEME.gold} icon="⚡" />
              <Stat label="Peso actual" value={`${latestWeight} kg`} color={THEME.accent2} icon="⚖️" />
              <Stat label="Ahorro total" value={`S/ ${financeLog.filter(e => e.category === "ahorro").reduce((s, e) => s + e.amount, 0).toFixed(2)}`} color={THEME.accent3} icon="💰" />
              <Stat label="Tareas completadas" value={tasks.filter(t => t.done).length} color={THEME.accent1} icon="🎓" />
            </div>
          </Card>
          <Card>
            <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>🎯 PROGRESO HACIA METAS 2026</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 4 }}>Objetivo de peso (100 → 82 kg) · Nov 2026</div>
                <ProgressBar value={Math.max(0, ((100 - latestWeight) / 18) * 100)} color={THEME.accent2} height={12} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 4 }}>Ahorro anual meta S/ 800</div>
                <ProgressBar value={(financeLog.filter(e => e.category === "ahorro").reduce((s, e) => s + e.amount, 0) / 800) * 100} color={THEME.accent3} height={12} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 4 }}>Nivel RPG (Nivel {levelInfo_helper(totalXP).level}/8)</div>
                <ProgressBar value={(levelInfo_helper(totalXP).level / 8) * 100} color={THEME.gold} height={12} />
              </div>
            </div>
          </Card>
        </>
      )}

      {tab === "emotions" && (
        <>
          <Card>
            <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>😊 ¿CÓMO TE SIENTES HOY?</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {EMOTIONS.map(e => (
                <button key={e} onClick={() => setEmotion(e)} style={{ background: emotion === e ? THEME.accent1 + "44" : THEME.surface, border: `2px solid ${emotion === e ? THEME.accent1 : THEME.border}`, borderRadius: 12, padding: "6px 10px", fontSize: 22, cursor: "pointer", transition: "all 0.2s" }}>{e}</button>
              ))}
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: THEME.muted, display: "block", marginBottom: 4 }}>⚡ Energía: {energy}/10</label>
              <input type="range" min="1" max="10" value={energy} onChange={e => setEnergy(parseInt(e.target.value))} style={{ width: "100%" }} />
            </div>
            <textarea value={emotionNote} onChange={e => setEmotionNote(e.target.value)} placeholder="¿Cómo estuvo el día? ¿Qué pasó?" style={{ width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 10, color: THEME.text, fontSize: 13, minHeight: 70, boxSizing: "border-box", resize: "vertical" }} />
            <button onClick={logEmotion} style={{ marginTop: 10, background: `linear-gradient(135deg, ${THEME.accent1}, #ec4899)`, border: "none", borderRadius: 10, color: "#fff", padding: "10px 20px", fontWeight: 700, cursor: "pointer", width: "100%", fontSize: 14 }}>
              Registrar Estado
            </button>
          </Card>

          {energyData.length > 1 && (
            <Card>
              <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>⚡ ENERGÍA (7 días)</div>
              <MiniChart data={energyData} color="#ec4899" height={70} />
            </Card>
          )}

          <Card>
            <div style={{ fontSize: 12, color: THEME.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>📋 HISTORIAL EMOCIONAL</div>
            {emotions.length === 0 ? <div style={{ color: THEME.muted, fontSize: 13, textAlign: "center" }}>Empieza a registrar tus emociones hoy</div> : emotions.slice(-7).reverse().map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${THEME.border}`, fontSize: 12, gap: 8, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{e.emotion}</span>
                  <div>
                    <div style={{ color: THEME.muted }}>{e.date}</div>
                    {e.note && <div style={{ color: THEME.text, fontSize: 11, fontStyle: "italic" }}>"{e.note}"</div>}
                  </div>
                </div>
                <Badge color={e.energy >= 7 ? THEME.accent3 : e.energy >= 4 ? THEME.gold : THEME.accent5}>⚡{e.energy}/10</Badge>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}

function levelInfo_helper(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  return { level };
}
