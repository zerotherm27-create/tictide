import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import Activity from "lucide-react/dist/esm/icons/activity.js";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle.js";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3.js";
import Bell from "lucide-react/dist/esm/icons/bell.js";
import BookOpenText from "lucide-react/dist/esm/icons/book-open-text.js";
import Brain from "lucide-react/dist/esm/icons/brain.js";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days.js";
import Check from "lucide-react/dist/esm/icons/check.js";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right.js";
import CircleHelp from "lucide-react/dist/esm/icons/circle-help.js";
import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list.js";
import Clock3 from "lucide-react/dist/esm/icons/clock-3.js";
import CloudDownload from "lucide-react/dist/esm/icons/cloud-download.js";
import CloudUpload from "lucide-react/dist/esm/icons/cloud-upload.js";
import Download from "lucide-react/dist/esm/icons/download.js";
import Database from "lucide-react/dist/esm/icons/database.js";
import FileText from "lucide-react/dist/esm/icons/file-text.js";
import HeartPulse from "lucide-react/dist/esm/icons/heart-pulse.js";
import Home from "lucide-react/dist/esm/icons/home.js";
import KeyRound from "lucide-react/dist/esm/icons/key-round.js";
import Lightbulb from "lucide-react/dist/esm/icons/lightbulb.js";
import LockKeyhole from "lucide-react/dist/esm/icons/lock-keyhole.js";
import LogOut from "lucide-react/dist/esm/icons/log-out.js";
import Moon from "lucide-react/dist/esm/icons/moon.js";
import NotebookPen from "lucide-react/dist/esm/icons/notebook-pen.js";
import PenLine from "lucide-react/dist/esm/icons/pen-line.js";
import Pill from "lucide-react/dist/esm/icons/pill.js";
import Plus from "lucide-react/dist/esm/icons/plus.js";
import Settings from "lucide-react/dist/esm/icons/settings.js";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check.js";
import SlidersHorizontal from "lucide-react/dist/esm/icons/sliders-horizontal.js";
import Smile from "lucide-react/dist/esm/icons/smile.js";
import Smartphone from "lucide-react/dist/esm/icons/smartphone.js";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.js";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope.js";
import SunMedium from "lucide-react/dist/esm/icons/sun-medium.js";
import UserRound from "lucide-react/dist/esm/icons/user-round.js";
import Waves from "lucide-react/dist/esm/icons/waves.js";
import { isSupabaseConfigured, supabase } from "./supabaseClient.js";
import "./styles.css";

const STORAGE = {
  logs: "tictide.logs.v2",
  journals: "tictide.journals.v1",
  ygtss: "tictide.ygtss.v1",
  puts: "tictide.puts.v1",
  meds: "tictide.meds.v1",
  profile: "tictide.profile.v1",
  redFlags: "tictide.redflags.v1",
  access: "tictide.access.v1",
  appMode: "tictide.appMode.v1",
};

const seedLogs = [
  {
    id: "seed-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    ticName: "Shoulder shrug",
    ticType: "Motor",
    intensity: 6,
    urge: 6,
    contexts: ["School", "Stress"],
    note: "Felt rushed this morning",
    pain: "Mild",
  },
  {
    id: "seed-2",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    ticName: "Eye blink",
    ticType: "Motor",
    intensity: 4,
    urge: 4,
    contexts: ["Screen Time", "Focus"],
    note: "After iPad time",
    pain: "None",
  },
  {
    id: "seed-3",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    ticName: "Throat clear",
    ticType: "Vocal",
    intensity: 3,
    urge: 3,
    contexts: ["Home", "Tired"],
    note: "Before bed",
    pain: "None",
  },
];

const seedJournals = [
  {
    id: "journal-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    mood: "Okay",
    urgeBefore: 6,
    ticPressure: 5,
    bodyFeeling: "Shoulders",
    trigger: "School task felt rushed",
    helped: "Slow breathing",
    note: "He noticed pressure before the shoulder tic and calmed down after a short break.",
  },
];

const defaultYgtss = {
  motor: { number: 2, frequency: 3, intensity: 3, complexity: 1, interference: 2 },
  vocal: { number: 1, frequency: 2, intensity: 2, complexity: 1, interference: 1 },
  impairment: 10,
  weekNote: "Use this as a weekly parent observation, not a formal clinician score.",
};

const putsItems = [
  "He notices a body feeling or urge before some tics.",
  "The urge feels like pressure, energy, itchiness, or tension.",
  "The urge gets stronger if he tries to hold a tic back.",
  "Doing the tic gives short relief from the feeling.",
  "The urge makes it hard to focus on school or play.",
  "The urge is stronger when stressed, tired, or overstimulated.",
  "He can sometimes tell where in the body the urge starts.",
  "The urge can feel like something is not complete or not just right.",
  "He can describe the urge after the episode has passed.",
];

const defaultPuts = Object.fromEntries(putsItems.map((_, index) => [`item${index}`, 1]));

const defaultProfile = {
  childName: "Kai",
  parentName: "",
  adhdDiagnosed: true,
  ticDuration: "About 3 years",
  neuroPedStatus: "ADHD diagnosed; tic/Tourette diagnosis still for discussion",
  medicationNote: "Previously tried risperidone as advised by neuro-pediatrician",
};

const seedMeds = [
  {
    id: "med-1",
    name: "Risperidone",
    dose: "",
    dates: "",
    reason: "Tic/behavior support as advised by neuro-pediatrician",
    response: "Add what helped, what did not, and side effects",
  },
];

const defaultRedFlags = {
  pain: false,
  injury: false,
  breathing: false,
  swallowing: false,
  suddenChange: false,
  seizureLike: false,
  selfHarm: false,
  schoolRefusal: false,
};

const defaultAccess = {
  childCode: "4286",
  parentPin: "2468",
};

const childViews = new Set(["home", "logs", "journal", "help"]);

const contextOptions = ["Sleep", "Stress", "School", "Screen Time", "Focus", "Home", "Tired", "Medication Day"];
const ticOptions = ["Shoulder shrug", "Eye blink", "Throat clear", "Head movement", "Facial movement", "Sound/noise", "Custom"];
const moodOptions = ["Calm", "Okay", "Stressed", "Tired", "Frustrated"];
const bodyFeelingOptions = ["Not sure", "Eyes/face", "Throat", "Neck", "Shoulders", "Chest", "Hands", "Stomach", "Legs"];
const helpedOptions = ["Slow breathing", "Quiet break", "Movement break", "Talked it out", "Less screen", "Hydration", "Nothing yet"];
const ygtssDimensions = ["number", "frequency", "intensity", "complexity", "interference"];
const ygtssLabels = {
  number: "Number",
  frequency: "Frequency",
  intensity: "Intensity",
  complexity: "Complexity",
  interference: "Interference",
};

function App() {
  const [logs, setLogs] = useStoredState(STORAGE.logs, seedLogs);
  const [journals, setJournals] = useStoredState(STORAGE.journals, seedJournals);
  const [ygtss, setYgtss] = useStoredState(STORAGE.ygtss, defaultYgtss);
  const [puts, setPuts] = useStoredState(STORAGE.puts, defaultPuts);
  const [meds, setMeds] = useStoredState(STORAGE.meds, seedMeds);
  const [profile, setProfile] = useStoredState(STORAGE.profile, defaultProfile);
  const [redFlags, setRedFlags] = useStoredState(STORAGE.redFlags, defaultRedFlags);
  const [access, setAccess] = useStoredState(STORAGE.access, defaultAccess);
  const [appMode, setAppMode] = useStoredState(STORAGE.appMode, "parent");

  const [activeView, setActiveView] = useState("home");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedContexts, setSelectedContexts] = useState(["Stress"]);
  const [ticName, setTicName] = useState("Shoulder shrug");
  const [ticType, setTicType] = useState("Motor");
  const [intensity, setIntensity] = useState(4);
  const [urge, setUrge] = useState(5);
  const [pain, setPain] = useState("None");
  const [note, setNote] = useState("");
  const [journalMood, setJournalMood] = useState("Okay");
  const [journalUrge, setJournalUrge] = useState(5);
  const [journalPressure, setJournalPressure] = useState(5);
  const [journalBodyFeeling, setJournalBodyFeeling] = useState("Not sure");
  const [journalTrigger, setJournalTrigger] = useState("");
  const [journalHelped, setJournalHelped] = useState("Slow breathing");
  const [journalNote, setJournalNote] = useState("");
  const [seconds, setSeconds] = useState(272);
  const [running, setRunning] = useState(false);
  const isChildMode = appMode === "child";
  const isChildLocked = appMode === "child-lock";

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/public-sw.js").catch(() => {});
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSeconds((current) => (current > 0 ? current - 1 : 272));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (appMode !== "parent" && !childViews.has(activeView)) {
      setActiveView("home");
    }
  }, [activeView, appMode]);

  const stats = useMemo(() => buildStats(logs), [logs]);
  const journalStats = useMemo(() => buildJournalStats(journals), [journals]);
  const ygtssScore = useMemo(() => scoreYgtss(ygtss), [ygtss]);
  const putsScore = useMemo(() => scorePuts(puts), [puts]);
  const report = useMemo(
    () => buildDoctorReport({ logs, journals, stats, journalStats, ygtss, ygtssScore, putsScore, meds, profile, redFlags }),
    [logs, journals, stats, journalStats, ygtss, ygtssScore, putsScore, meds, profile, redFlags],
  );

  function toggleContext(context) {
    setSelectedContexts((current) =>
      current.includes(context) ? current.filter((item) => item !== context) : [...current, context],
    );
  }

  function addLog(event) {
    event.preventDefault();
    const log = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ticName,
      ticType,
      intensity: Number(intensity),
      urge: Number(urge),
      pain,
      contexts: selectedContexts,
      note: note.trim() || "No note added",
    };
    setLogs((current) => [log, ...current]);
    setNote("");
    setFormOpen(false);
    setActiveView("logs");
  }

  function addJournal(event) {
    event.preventDefault();
    const entry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      mood: journalMood,
      urgeBefore: Number(journalUrge),
      ticPressure: Number(journalPressure),
      bodyFeeling: journalBodyFeeling,
      trigger: journalTrigger.trim() || "Not noted",
      helped: journalHelped,
      note: journalNote.trim() || "No note added",
    };
    setJournals((current) => [entry, ...current]);
    setJournalTrigger("");
    setJournalNote("");
  }

  function exportCsv() {
    const header = ["createdAt", "ticName", "ticType", "intensity", "urge", "pain", "contexts", "note"];
    const rows = logs.map((log) =>
      header
        .map((field) => {
          const value = field === "contexts" ? log.contexts.join("; ") : log[field] || "";
          return `"${String(value).replaceAll('"', '""')}"`;
        })
        .join(","),
    );
    downloadFile(`tictide-logs-${dateStamp()}.csv`, [[header.join(","), ...rows].join("\n")], "text/csv");
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = String(seconds % 60).padStart(2, "0");

  function navigate(view) {
    if (appMode !== "parent" && !childViews.has(view)) {
      setActiveView("home");
      return;
    }
    setActiveView(view);
  }

  function enterChildMode() {
    setAppMode("child-lock");
    setActiveView("home");
  }

  if (isChildLocked) {
    return (
      <ChildUnlockView
        profile={profile}
        access={access}
        onUnlockChild={() => setAppMode("child")}
        onUnlockParent={() => setAppMode("parent")}
      />
    );
  }

  return (
    <div className={`app-shell ${isChildMode ? "child-mode" : ""}`}>
      <aside className="sidebar" aria-label="Primary">
        <Brand />
        <ProfileCard profile={profile} mode={appMode} onClick={() => navigate(isChildMode ? "home" : "account")} />
        <nav className="side-nav">
          <NavButton icon={<Home />} label="Home" active={activeView === "home"} onClick={() => navigate("home")} />
          <NavButton icon={<FileText />} label="Logs" active={activeView === "logs"} onClick={() => navigate("logs")} />
          <NavButton icon={<NotebookPen />} label="Journal" active={activeView === "journal"} onClick={() => navigate("journal")} />
          {!isChildMode && <NavButton icon={<BarChart3 />} label="Trends" active={activeView === "trends"} onClick={() => navigate("trends")} />}
          {!isChildMode && <NavButton icon={<ClipboardList />} label="Care Tools" active={activeView === "tools"} onClick={() => navigate("tools")} />}
          {!isChildMode && <NavButton icon={<Settings />} label="Settings" active={activeView === "settings"} onClick={() => navigate("settings")} />}
          {isChildMode && <NavButton icon={<CircleHelp />} label="Help" active={activeView === "help"} onClick={() => navigate("help")} />}
        </nav>
        <div className="support-note">
          <Waves aria-hidden="true" />
          <p>You’re not alone.</p>
          <span>Structured notes can make specialist visits clearer.</span>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <span className="mobile-brandline">
              <Waves size={18} aria-hidden="true" /> TicTide
            </span>
            <p className="date-line">
              <CalendarDays size={18} /> {formatDate(new Date())}
            </p>
            <h1>{activeView === "home" ? (isChildMode ? "What do you need?" : "Today’s support") : viewTitle(activeView)}</h1>
          </div>
          <div className="top-actions">
            {isChildMode ? (
              <button className="secondary-button" type="button" onClick={() => setAppMode("child-lock")}>
                <LockKeyhole size={17} /> Parent
              </button>
            ) : (
              <>
                <button className="icon-button" aria-label="Account" onClick={() => navigate("account")}>
                  <UserRound size={19} />
                </button>
                <button className="icon-button" aria-label="Notifications">
                  <Bell size={19} />
                </button>
              </>
            )}
            <button className="icon-button" aria-label="Help" onClick={() => navigate("help")}>
              <CircleHelp size={19} />
            </button>
          </div>
        </header>

        {activeView === "home" && (
          <HomeView
            stats={stats}
            logs={logs}
            urge={urge}
            intensity={intensity}
            setIntensity={setIntensity}
            selectedContexts={selectedContexts}
            toggleContext={toggleContext}
            journals={journals}
            journalStats={journalStats}
            minutes={minutes}
            remainingSeconds={remainingSeconds}
            running={running}
            setRunning={setRunning}
            onAdd={() => setFormOpen(true)}
            onLogs={() => setActiveView("logs")}
            onJournal={() => navigate("journal")}
            onTrends={() => navigate("trends")}
            onTools={() => navigate("tools")}
            isChildMode={isChildMode}
          />
        )}
        {activeView === "logs" && <LogsView logs={logs} onExport={exportCsv} onAdd={() => setFormOpen(true)} />}
        {activeView === "journal" && (
          <JournalView
            journals={journals}
            journalStats={journalStats}
            mood={journalMood}
            setMood={setJournalMood}
            urge={journalUrge}
            setUrge={setJournalUrge}
            pressure={journalPressure}
            setPressure={setJournalPressure}
            bodyFeeling={journalBodyFeeling}
            setBodyFeeling={setJournalBodyFeeling}
            trigger={journalTrigger}
            setTrigger={setJournalTrigger}
            helped={journalHelped}
            setHelped={setJournalHelped}
            note={journalNote}
            setNote={setJournalNote}
            onSubmit={addJournal}
          />
        )}
        {!isChildMode && activeView === "trends" && <TrendsView stats={stats} logs={logs} ygtssScore={ygtssScore} putsScore={putsScore} />}
        {!isChildMode && activeView === "tools" && (
          <CareToolsView
            profile={profile}
            setProfile={setProfile}
            ygtss={ygtss}
            setYgtss={setYgtss}
            ygtssScore={ygtssScore}
            puts={puts}
            setPuts={setPuts}
            putsScore={putsScore}
            meds={meds}
            setMeds={setMeds}
            redFlags={redFlags}
            setRedFlags={setRedFlags}
            report={report}
          />
        )}
        {!isChildMode && activeView === "settings" && (
          <SettingsView access={access} setAccess={setAccess} onEnterChildMode={enterChildMode} />
        )}
        {!isChildMode && activeView === "account" && (
          <AccountSyncView
            profile={profile}
            setProfile={setProfile}
            logs={logs}
            setLogs={setLogs}
            journals={journals}
            setJournals={setJournals}
            ygtss={ygtss}
            setYgtss={setYgtss}
            puts={puts}
            setPuts={setPuts}
            meds={meds}
            setMeds={setMeds}
            redFlags={redFlags}
            setRedFlags={setRedFlags}
          />
        )}
        {activeView === "help" && (
          <HelpView
            isChildMode={isChildMode}
            onJournal={() => navigate("journal")}
            onTools={() => navigate(isChildMode ? "logs" : "tools")}
            onLogs={() => setFormOpen(true)}
          />
        )}
      </main>

      <nav className="mobile-nav" aria-label="Mobile primary">
        <NavButton icon={<Home />} label="Home" active={activeView === "home"} onClick={() => navigate("home")} />
        <NavButton icon={<FileText />} label="Logs" active={activeView === "logs"} onClick={() => navigate("logs")} />
        <NavButton icon={<NotebookPen />} label="Journal" active={activeView === "journal"} onClick={() => navigate("journal")} />
        {isChildMode ? (
          <>
            <NavButton icon={<CircleHelp />} label="Help" active={activeView === "help"} onClick={() => navigate("help")} />
            <NavButton icon={<LockKeyhole />} label="Parent" active={false} onClick={() => setAppMode("child-lock")} />
          </>
        ) : (
          <>
            <NavButton icon={<BarChart3 />} label="Trends" active={activeView === "trends"} onClick={() => navigate("trends")} />
            <NavButton icon={<ClipboardList />} label="Care Tools" active={activeView === "tools"} onClick={() => navigate("tools")} />
          </>
        )}
      </nav>

      {formOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setFormOpen(false)}>
          <form className="log-form" onSubmit={addLog} onMouseDown={(event) => event.stopPropagation()} aria-label="Log a tic">
            <div className="panel-title-row">
              <h2>Log a tic</h2>
              <button className="subtle-button" type="button" onClick={() => setFormOpen(false)}>
                Close
              </button>
            </div>
            <label>
              Tic
              <select value={ticName} onChange={(event) => setTicName(event.target.value)}>
                {ticOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <Segmented options={["Motor", "Vocal"]} value={ticType} onChange={setTicType} label="Tic type" />
            <label>
              Urge level: {urge}/10
              <input type="range" min="1" max="10" value={urge} onChange={(event) => setUrge(event.target.value)} />
            </label>
            <label>
              Intensity: {intensity}/10
              <input type="range" min="1" max="10" value={intensity} onChange={(event) => setIntensity(event.target.value)} />
            </label>
            <label>
              Pain or discomfort
              <select value={pain} onChange={(event) => setPain(event.target.value)}>
                {["None", "Mild", "Moderate", "Severe"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <ContextChips selected={selectedContexts} onToggle={toggleContext} />
            <label>
              Note
              <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="What happened before, during, or after?" />
            </label>
            <button className="primary-button" type="submit">
              <Check size={18} /> Save log
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function ChildUnlockView({ profile, access, onUnlockChild, onUnlockParent }) {
  const [code, setCode] = useState("");
  const [parentPin, setParentPin] = useState("");
  const [message, setMessage] = useState("Enter child code to start.");

  function unlockChild(event) {
    event.preventDefault();
    if (code.trim() === String(access.childCode || "").trim()) {
      setCode("");
      setMessage("Child Mode unlocked.");
      onUnlockChild();
      return;
    }
    setMessage("Child code did not match.");
  }

  function unlockParent(event) {
    event.preventDefault();
    if (parentPin.trim() === String(access.parentPin || "").trim()) {
      setParentPin("");
      setMessage("Parent Mode unlocked.");
      onUnlockParent();
      return;
    }
    setMessage("Parent PIN did not match.");
  }

  return (
    <main className="access-screen">
      <section className="access-card">
        <Brand />
        <div className="access-hero">
          <div className="avatar large" aria-hidden="true">
            {(profile.childName || "C").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1>{profile.childName || "Child"} Mode</h1>
            <p>Quick logging, journaling, and calm support. Parent tools stay locked.</p>
          </div>
        </div>
        <div className="access-grid">
          <form className="access-form" onSubmit={unlockChild}>
            <h2>Child access</h2>
            <label>
              Child code
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter code"
              />
            </label>
            <button className="primary-button" type="submit">
              <KeyRound size={17} /> Start Child Mode
            </button>
          </form>
          <form className="access-form parent-unlock" onSubmit={unlockParent}>
            <h2>Parent unlock</h2>
            <label>
              Parent PIN
              <input
                value={parentPin}
                onChange={(event) => setParentPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                type="password"
                placeholder="Parent PIN"
              />
            </label>
            <button className="secondary-button" type="submit">
              <LockKeyhole size={17} /> Parent Mode
            </button>
          </form>
        </div>
        <p className="sync-message">{message}</p>
      </section>
    </main>
  );
}

function HomeView(props) {
  if (props.isChildMode) {
    return <ChildHomeView {...props} />;
  }

  return <ParentHomeView {...props} />;
}

function ChildHomeView(props) {
  const latestLog = props.logs[0];

  return (
    <section className="child-home" aria-label="Child home">
      <div className="child-start" aria-label="Quick help buttons">
        <ChildBigCard
          tone="coral"
          icon={<Plus />}
          title="I feel a tic"
          text="Tap this during it, or right after."
          action="Log it"
          onClick={props.onAdd}
        />
        <ChildBigCard
          tone="teal"
          icon={<Waves />}
          title="Help me calm"
          text="Start breathing and ride the wave."
          action={props.running ? "Timer on" : "Start"}
          onClick={() => props.setRunning(true)}
        />
        <ChildBigCard
          tone="green"
          icon={<NotebookPen />}
          title="Write how I feel"
          text="Mood, body feeling, or one short note."
          action="Journal"
          onClick={props.onJournal}
        />
      </div>

      <div className="child-focus-grid">
        <Panel className="child-calm-panel calm-panel">
          <div className="panel-title-row">
            <div>
              <h2>Ride the wave</h2>
              <p className="panel-subtitle">Breathe slowly. You do not have to fight your body.</p>
            </div>
            <Waves className="title-wave" aria-hidden="true" />
          </div>
          <div className="child-calm-layout">
            <div className="breathing-ring child-ring" aria-label="Breathing timer">
              <span>Breathe in</span>
              <strong>
                {props.minutes}:{props.remainingSeconds}
              </strong>
              <small>4-4-6</small>
            </div>
            <div className="child-calm-actions">
              <button className="primary-button large-button" type="button" onClick={() => props.setRunning((value) => !value)}>
                <Waves size={19} /> {props.running ? "Pause" : "Start breathing"}
              </button>
              <button className="secondary-button large-button" type="button" onClick={props.onAdd}>
                <Plus size={19} /> Save a tic
              </button>
            </div>
          </div>
          <ContextChips
            selected={props.selectedContexts}
            onToggle={props.toggleContext}
            options={["Stress", "School", "Screen Time", "Tired", "Home"]}
            prompt="pick one if you can"
          />
        </Panel>

        <Panel className="child-kind-panel">
          <div className="panel-title-row">
            <div>
              <h2>You are okay</h2>
              <p className="panel-subtitle">Small notes help your parent and doctor understand patterns.</p>
            </div>
            <HeartPulse className="title-wave" aria-hidden="true" />
          </div>
          <div className="child-comfort-list">
            <p><Check size={18} /> A tic is not your fault.</p>
            <p><Check size={18} /> Short notes are enough.</p>
            <p><Check size={18} /> Tell a parent if it hurts or scares you.</p>
          </div>
          <div className="child-mini-stats">
            <SmallStat label="Saved today" value={props.logs.length} note="Tic logs" />
            <SmallStat label="Mood note" value={props.journalStats.commonMood} note={`${props.journals.length} journal`} />
          </div>
          {latestLog && (
            <button className="child-last-log" type="button" onClick={props.onLogs}>
              <span>Last saved</span>
              <strong>{latestLog.ticName}</strong>
              <em>{formatLogTime(latestLog.createdAt)}</em>
            </button>
          )}
        </Panel>
      </div>
    </section>
  );
}

function ParentHomeView(props) {
  return (
    <>
      <section className="quick-grid" aria-label="Quick actions">
        <ActionCard tone="coral" icon={<Plus />} title="Log Tic" text="Record tic, urge, pain, context" onClick={props.onAdd} />
        <ActionCard tone="teal" icon={<Waves />} title="Calm Mode" text="Breathing and grounding" onClick={() => props.setRunning(true)} />
        <ActionCard tone="green" icon={<NotebookPen />} title="Journal" text="Mood, urge, body feeling" onClick={props.onJournal} />
        <ActionCard
          tone="gold"
          icon={props.isChildMode ? <FileText /> : <ClipboardList />}
          title={props.isChildMode ? "My Logs" : "Care Tools"}
          text={props.isChildMode ? "See what you saved today" : "YGTSS, PUTS, report"}
          onClick={props.isChildMode ? props.onLogs : props.onTools}
        />
      </section>

      <section className="home-grid">
        <Panel className="calm-panel">
          <div className="panel-title-row">
            <h2>Ride this wave</h2>
            <Waves className="title-wave" aria-hidden="true" />
          </div>
          <div className="calm-layout">
            <div className="breathing-ring" aria-label="Breathing timer">
              <span>Breathe in</span>
              <strong>
                {props.minutes}:{props.remainingSeconds}
              </strong>
              <small>4-4-6 breathing</small>
            </div>
            <div className="calm-controls">
              <MetricDots label="Urge level" value={props.urge} total={10} />
              <label className="range-label">
                <span>Intensity</span>
                <input type="range" min="1" max="10" value={props.intensity} onChange={(event) => props.setIntensity(event.target.value)} />
                <em>Mild to severe</em>
              </label>
              <button className="primary-button" type="button" onClick={() => props.setRunning((value) => !value)}>
                {props.running ? "Pause timer" : "Start calm timer"}
              </button>
            </div>
          </div>
          <ContextChips selected={props.selectedContexts} onToggle={props.toggleContext} />
        </Panel>

        <Panel>
          <div className="panel-title-row">
            <h2>Weekly patterns</h2>
            <button className="subtle-button" type="button" onClick={props.onTrends}>
              This week <ChevronRight size={16} />
            </button>
          </div>
          <MiniChart days={props.stats.days} />
          <div className="stat-row">
            <SmallStat label="Avg. urge" value={props.stats.avgUrge} note="This week" />
            <SmallStat label="Total logs" value={props.logs.length} note="Saved privately" />
            <SmallStat label="Journal mood" value={props.journalStats.commonMood} note={`${props.journals.length} entries`} />
          </div>
        </Panel>
      </section>

      <RecentLogs logs={props.logs} onViewAll={props.onLogs} />
    </>
  );
}

function JournalView(props) {
  return (
    <section className="view-stack">
      <div className="journal-grid">
        <Panel>
          <div className="panel-title-row">
            <div>
              <h2>Two-minute journal</h2>
              <p className="panel-subtitle">A short check-in for mood, urge, body feeling, and what helped.</p>
            </div>
            <PenLine className="title-wave" />
          </div>
          <form className="journal-form" onSubmit={props.onSubmit}>
            <label>
              Mood
              <Segmented options={moodOptions} value={props.mood} onChange={props.setMood} label="Mood" />
            </label>
            <label className="range-label">
              <span>Urge before tic <b>{props.urge}/10</b></span>
              <input type="range" min="1" max="10" value={props.urge} onChange={(event) => props.setUrge(event.target.value)} />
            </label>
            <label className="range-label">
              <span>Tic pressure <b>{props.pressure}/10</b></span>
              <input type="range" min="1" max="10" value={props.pressure} onChange={(event) => props.setPressure(event.target.value)} />
            </label>
            <div className="form-grid compact">
              <label>
                Body feeling
                <select value={props.bodyFeeling} onChange={(event) => props.setBodyFeeling(event.target.value)}>
                  {bodyFeelingOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                What helped
                <select value={props.helped} onChange={(event) => props.setHelped(event.target.value)}>
                  {helpedOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              What was happening?
              <input value={props.trigger} onChange={(event) => props.setTrigger(event.target.value)} placeholder="School, screen time, tired, excited, worried..." />
            </label>
            <label>
              My note
              <textarea value={props.note} onChange={(event) => props.setNote(event.target.value)} placeholder="One sentence is enough." />
            </label>
            <button className="primary-button" type="submit">
              <Check size={18} /> Save journal
            </button>
          </form>
        </Panel>

        <Panel className="journal-prompts">
          <div className="panel-title-row">
            <h2>Gentle prompts</h2>
            <Lightbulb className="title-wave" />
          </div>
          <div className="prompt-list">
            <PromptCard icon={<Smile />} title="Feeling" text="What emotion was strongest right before or after the tic?" />
            <PromptCard icon={<Activity />} title="Body signal" text="Where did the urge or pressure show up first?" />
            <PromptCard icon={<Waves />} title="Support" text="What made the wave smaller, even a little?" />
          </div>
          <div className="stat-row">
            <SmallStat label="Entries" value={props.journals.length} note="Private on device" />
            <SmallStat label="Common mood" value={props.journalStats.commonMood} note="Recent entries" />
            <SmallStat label="Avg. pressure" value={props.journalStats.avgPressure} note="Out of 10" />
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="panel-title-row">
          <h2>Recent journal</h2>
          <span className="privacy-pill">Local data</span>
        </div>
        <div className="journal-list">
          {props.journals.map((entry) => (
            <JournalEntry key={entry.id} entry={entry} />
          ))}
        </div>
      </Panel>
    </section>
  );
}

function PromptCard({ icon, title, text }) {
  return (
    <article className="prompt-card">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </article>
  );
}

function JournalEntry({ entry }) {
  return (
    <article className="journal-entry">
      <div className="journal-entry-icon">
        <BookOpenText size={18} />
      </div>
      <div>
        <div className="journal-entry-head">
          <strong>{entry.mood}</strong>
          <span>{formatLogTime(entry.createdAt)}</span>
        </div>
        <div className="tag-row">
          <span>Urge {entry.urgeBefore}/10</span>
          <span>Pressure {entry.ticPressure}/10</span>
          <span>{entry.bodyFeeling}</span>
          <span>{entry.helped}</span>
        </div>
        <p className="log-note">{entry.trigger}</p>
        {entry.note && <p className="journal-note">{entry.note}</p>}
      </div>
    </article>
  );
}

function CareToolsView({ profile, setProfile, ygtss, setYgtss, ygtssScore, puts, setPuts, putsScore, meds, setMeds, redFlags, setRedFlags, report }) {
  return (
    <section className="view-stack">
      <div className="disclaimer">
        <ShieldCheck size={20} />
        <p>
          Advanced tools are for tracking and doctor discussion only. They do not diagnose Tourette syndrome, ADHD, or medication needs.
        </p>
      </div>
      <div className="tools-grid">
        <ClinicalProfile profile={profile} setProfile={setProfile} />
        <CriteriaPanel />
      </div>
      <YgtssPanel ygtss={ygtss} setYgtss={setYgtss} score={ygtssScore} />
      <PutsPanel puts={puts} setPuts={setPuts} score={putsScore} />
      <div className="tools-grid">
        <MedicationPanel meds={meds} setMeds={setMeds} />
        <RedFlagsPanel redFlags={redFlags} setRedFlags={setRedFlags} />
      </div>
      <DoctorReport report={report} />
    </section>
  );
}

function ClinicalProfile({ profile, setProfile }) {
  function update(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }
  return (
    <Panel>
      <div className="panel-title-row">
        <h2>Clinical snapshot</h2>
        <Brain className="title-wave" />
      </div>
      <div className="form-grid">
        <label>
          Child name
          <input value={profile.childName} onChange={(event) => update("childName", event.target.value)} />
        </label>
        <label>
          Tic duration
          <input value={profile.ticDuration} onChange={(event) => update("ticDuration", event.target.value)} />
        </label>
        <label>
          Neuro-ped status
          <textarea value={profile.neuroPedStatus} onChange={(event) => update("neuroPedStatus", event.target.value)} />
        </label>
        <label>
          Medication note
          <textarea value={profile.medicationNote} onChange={(event) => update("medicationNote", event.target.value)} />
        </label>
      </div>
    </Panel>
  );
}

function CriteriaPanel() {
  const rows = [
    ["Motor tics", "Two or more motor tics have occurred at some time."],
    ["Vocal tics", "At least one vocal/phonic tic has occurred."],
    ["Duration", "Tics have been present for more than one year."],
    ["Age", "Symptoms began before age 18."],
    ["Rule-outs", "Doctor considers medication/substance/other medical explanations."],
  ];
  return (
    <Panel>
      <div className="panel-title-row">
        <h2>Diagnosis discussion checklist</h2>
        <Stethoscope className="title-wave" />
      </div>
      <div className="check-list">
        {rows.map(([title, text]) => (
          <p key={title}>
            <Check size={18} /> <span><strong>{title}</strong>{text}</span>
          </p>
        ))}
      </div>
    </Panel>
  );
}

function YgtssPanel({ ygtss, setYgtss, score }) {
  function update(kind, dimension, value) {
    setYgtss((current) => ({
      ...current,
      [kind]: { ...current[kind], [dimension]: Number(value) },
    }));
  }
  return (
    <Panel>
      <div className="panel-title-row">
        <div>
          <h2>YGTSS-style weekly severity</h2>
          <p className="panel-subtitle">Parent observation inspired by clinician YGTSS dimensions over the past week.</p>
        </div>
        <div className="score-badge">
          <strong>{score.global}</strong>
          <span>/100 global</span>
        </div>
      </div>
      <div className="score-summary">
        <SmallStat label="Motor" value={`${score.motor}/25`} note="number to interference" />
        <SmallStat label="Vocal" value={`${score.vocal}/25`} note="number to interference" />
        <SmallStat label="Tic severity" value={`${score.total}/50`} note="motor + vocal" />
        <SmallStat label="Impairment" value={`${ygtss.impairment}/50`} note="daily life impact" />
      </div>
      <div className="assessment-grid">
        {["motor", "vocal"].map((kind) => (
          <div className="assessment-box" key={kind}>
            <h3>{kind === "motor" ? "Motor tics" : "Vocal tics"}</h3>
            {ygtssDimensions.map((dimension) => (
              <label className="scale-row" key={dimension}>
                <span>{ygtssLabels[dimension]} <b>{ygtss[kind][dimension]}/5</b></span>
                <input type="range" min="0" max="5" value={ygtss[kind][dimension]} onChange={(event) => update(kind, dimension, event.target.value)} />
              </label>
            ))}
          </div>
        ))}
      </div>
      <label className="scale-row impairment-row">
        <span>Overall impairment <b>{ygtss.impairment}/50</b></span>
        <input
          type="range"
          min="0"
          max="50"
          step="5"
          value={ygtss.impairment}
          onChange={(event) => setYgtss((current) => ({ ...current, impairment: Number(event.target.value) }))}
        />
      </label>
    </Panel>
  );
}

function PutsPanel({ puts, setPuts, score }) {
  function update(key, value) {
    setPuts((current) => ({ ...current, [key]: Number(value) }));
  }
  return (
    <Panel>
      <div className="panel-title-row">
        <div>
          <h2>PUTS-style premonitory urge tracker</h2>
          <p className="panel-subtitle">Paraphrased urge questions. Best for children who can describe body feelings before tics.</p>
        </div>
        <div className="score-badge coral">
          <strong>{score.total}</strong>
          <span>/36 urge</span>
        </div>
      </div>
      <div className="puts-list">
        {putsItems.map((item, index) => {
          const key = `item${index}`;
          return (
            <div className="puts-item" key={item}>
              <p>{index + 1}. {item}</p>
              <Segmented
                options={["1", "2", "3", "4"]}
                value={String(puts[key])}
                onChange={(value) => update(key, value)}
                label={`Urge item ${index + 1}`}
              />
            </div>
          );
        })}
      </div>
      <p className="scale-help">1 = not at all, 2 = a little, 3 = somewhat, 4 = very much.</p>
    </Panel>
  );
}

function MedicationPanel({ meds, setMeds }) {
  function update(id, field, value) {
    setMeds((current) => current.map((med) => (med.id === id ? { ...med, [field]: value } : med)));
  }
  function addMed() {
    setMeds((current) => [
      ...current,
      { id: crypto.randomUUID(), name: "", dose: "", dates: "", reason: "", response: "" },
    ]);
  }
  return (
    <Panel>
      <div className="panel-title-row">
        <h2>Medication history</h2>
        <button className="subtle-button" type="button" onClick={addMed}>
          <Plus size={16} /> Add
        </button>
      </div>
      <div className="med-list">
        {meds.map((med) => (
          <div className="med-card" key={med.id}>
            <Pill size={18} />
            <div className="form-grid compact">
              <input aria-label="Medication name" placeholder="Medication" value={med.name} onChange={(event) => update(med.id, "name", event.target.value)} />
              <input aria-label="Dose" placeholder="Dose" value={med.dose} onChange={(event) => update(med.id, "dose", event.target.value)} />
              <input aria-label="Dates used" placeholder="Dates used" value={med.dates} onChange={(event) => update(med.id, "dates", event.target.value)} />
              <textarea aria-label="Medication response" placeholder="Helped, side effects, reason stopped" value={med.response} onChange={(event) => update(med.id, "response", event.target.value)} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function RedFlagsPanel({ redFlags, setRedFlags }) {
  const labels = {
    pain: "Pain from tics",
    injury: "Injury or bruising",
    breathing: "Breathing interruption",
    swallowing: "Swallowing issue",
    suddenChange: "Sudden dramatic change",
    seizureLike: "Seizure-like episode",
    selfHarm: "Self-harm talk",
    schoolRefusal: "School refusal or severe distress",
  };
  return (
    <Panel>
      <div className="panel-title-row">
        <h2>Red flag tracker</h2>
        <AlertTriangle className="danger-icon" />
      </div>
      <div className="flag-grid">
        {Object.entries(labels).map(([key, label]) => (
          <label className={`flag ${redFlags[key] ? "checked" : ""}`} key={key}>
            <input
              type="checkbox"
              checked={redFlags[key]}
              onChange={(event) => setRedFlags((current) => ({ ...current, [key]: event.target.checked }))}
            />
            {label}
          </label>
        ))}
      </div>
      <p className="scale-help">If severe, sudden, dangerous, or self-harm related, contact a qualified clinician promptly.</p>
    </Panel>
  );
}

function DoctorReport({ report }) {
  return (
    <Panel>
      <div className="panel-title-row">
        <div>
          <h2>Doctor visit report</h2>
          <p className="panel-subtitle">Bring this to the neuro-ped, child psychiatrist, or CBIT-trained therapist.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => downloadFile(`tictide-doctor-report-${dateStamp()}.txt`, [report], "text/plain")}>
          <Download size={17} /> Download
        </button>
      </div>
      <pre className="report-box">{report}</pre>
    </Panel>
  );
}

function TrendsView({ stats, logs, ygtssScore, putsScore }) {
  return (
    <section className="view-stack">
      <div className="home-grid">
        <Panel>
          <div className="panel-title-row">
            <h2>Weekly patterns</h2>
            <span className="privacy-pill">Local data</span>
          </div>
          <MiniChart days={stats.days} />
        </Panel>
        <Panel>
          <h2>Care conversation notes</h2>
          <div className="insight-list">
            <p><SunMedium size={18} /> Most common context is <strong>{stats.commonContext}</strong>.</p>
            <p><Activity size={18} /> Average urge level is <strong>{stats.avgUrge}/10</strong>.</p>
            <p><ClipboardList size={18} /> YGTSS-style global score is <strong>{ygtssScore.global}/100</strong>.</p>
            <p><HeartPulse size={18} /> PUTS-style urge score is <strong>{putsScore.total}/36</strong>.</p>
            <p><FileText size={18} /> {logs.length} logs are ready for export before a clinician visit.</p>
          </div>
        </Panel>
      </div>
    </section>
  );
}

function LogsView({ logs, onExport, onAdd }) {
  return (
    <section className="view-stack">
      <Panel>
        <div className="panel-title-row">
          <h2>Saved logs</h2>
          <div className="button-cluster">
            <button className="secondary-button" type="button" onClick={onExport}>
              <Download size={17} /> Export CSV
            </button>
            <button className="primary-button" type="button" onClick={onAdd}>
              <Plus size={17} /> New log
            </button>
          </div>
        </div>
        <div className="log-list expanded">
          {logs.map((log) => (
            <LogRow key={log.id} log={log} />
          ))}
        </div>
      </Panel>
    </section>
  );
}

function AccountSyncView({
  profile,
  setProfile,
  logs,
  setLogs,
  journals,
  setJournals,
  ygtss,
  setYgtss,
  puts,
  setPuts,
  meds,
  setMeds,
  redFlags,
  setRedFlags,
}) {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("Sign in");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(isSupabaseConfigured ? "Ready to connect." : "Server sync is not configured yet.");

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session || null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  function updateProfile(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  async function handleAuth(event) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage(mode === "Create" ? "Creating parent account..." : "Signing in...");
    const credentials = { email, password };
    const result =
      mode === "Create"
        ? await supabase.auth.signUp(credentials)
        : await supabase.auth.signInWithPassword(credentials);
    setBusy(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    setSession(result.data.session || null);
    setMessage(mode === "Create" ? "Account created. Check email if confirmation is required." : "Signed in.");
  }

  async function handleSignOut() {
    if (!supabase) return;
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
    setMessage("Signed out.");
  }

  async function ensureFamilyAndChild(userId) {
    const parentName = profile.parentName || "";
    const { data: family, error: familyError } = await supabase
      .from("families")
      .upsert(
        { owner_user_id: userId, parent_name: parentName, updated_at: new Date().toISOString() },
        { onConflict: "owner_user_id" },
      )
      .select()
      .single();
    if (familyError) throw familyError;

    const { data: child, error: childError } = await supabase
      .from("children")
      .upsert(
        {
          family_id: family.id,
          display_name: profile.childName || "Child",
          local_profile: profile,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "family_id" },
      )
      .select()
      .single();
    if (childError) throw childError;
    return { family, child };
  }

  async function syncToCloud() {
    if (!supabase || !session?.user) return;
    setBusy(true);
    setMessage("Uploading tablet data to Family Sync...");
    try {
      const { family, child } = await ensureFamilyAndChild(session.user.id);
      const logRows = logs.map((log) => ({
        family_id: family.id,
        child_id: child.id,
        local_id: log.id,
        created_at: log.createdAt,
        tic_name: log.ticName,
        tic_type: log.ticType,
        intensity: Number(log.intensity),
        urge: Number(log.urge),
        pain: log.pain || "None",
        contexts: log.contexts || [],
        note: log.note || "",
        synced_at: new Date().toISOString(),
      }));
      if (logRows.length > 0) {
        const { error } = await supabase.from("tic_logs").upsert(logRows, { onConflict: "child_id,local_id" });
        if (error) throw error;
      }

      const journalRows = journals.map((entry) => ({
        family_id: family.id,
        child_id: child.id,
        local_id: entry.id,
        created_at: entry.createdAt,
        mood: entry.mood,
        urge_before: Number(entry.urgeBefore),
        tic_pressure: Number(entry.ticPressure),
        body_feeling: entry.bodyFeeling || "",
        trigger: entry.trigger || "",
        helped: entry.helped || "",
        note: entry.note || "",
        synced_at: new Date().toISOString(),
      }));
      if (journalRows.length > 0) {
        const { error } = await supabase.from("journal_entries").upsert(journalRows, { onConflict: "child_id,local_id" });
        if (error) throw error;
      }

      const { error: snapshotError } = await supabase.from("care_snapshots").upsert(
        {
          child_id: child.id,
          family_id: family.id,
          profile,
          ygtss,
          puts,
          meds,
          red_flags: redFlags,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "child_id" },
      );
      if (snapshotError) throw snapshotError;

      setMessage(`Synced ${logs.length} logs and ${journals.length} journal entries to the parent account.`);
    } catch (error) {
      setMessage(`Sync failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function loadFromCloud() {
    if (!supabase || !session?.user) return;
    setBusy(true);
    setMessage("Loading Family Sync data...");
    try {
      const { data: family, error: familyError } = await supabase.from("families").select("*").maybeSingle();
      if (familyError) throw familyError;
      if (!family) {
        setMessage("No cloud family data found yet. Sync from the tablet first.");
        setBusy(false);
        return;
      }
      const { data: child, error: childError } = await supabase.from("children").select("*").eq("family_id", family.id).maybeSingle();
      if (childError) throw childError;
      if (!child) {
        setMessage("No child profile found yet. Sync from the tablet first.");
        setBusy(false);
        return;
      }

      const { data: cloudLogs, error: logsError } = await supabase
        .from("tic_logs")
        .select("*")
        .eq("child_id", child.id)
        .order("created_at", { ascending: false });
      if (logsError) throw logsError;

      const { data: cloudJournals, error: journalsError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("child_id", child.id)
        .order("created_at", { ascending: false });
      if (journalsError) throw journalsError;

      const { data: snapshot, error: snapshotError } = await supabase
        .from("care_snapshots")
        .select("*")
        .eq("child_id", child.id)
        .maybeSingle();
      if (snapshotError) throw snapshotError;

      setLogs((cloudLogs || []).map(mapCloudLog));
      setJournals((cloudJournals || []).map(mapCloudJournal));
      if (snapshot) {
        setProfile(snapshot.profile || child.local_profile || profile);
        setYgtss(snapshot.ygtss || ygtss);
        setPuts(snapshot.puts || puts);
        setMeds(snapshot.meds || meds);
        setRedFlags(snapshot.red_flags || redFlags);
      } else {
        setProfile(child.local_profile || profile);
      }
      setMessage(`Loaded ${cloudLogs?.length || 0} logs and ${cloudJournals?.length || 0} journal entries from Family Sync.`);
    } catch (error) {
      setMessage(`Load failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="view-stack">
      <div className="sync-grid">
        <Panel>
          <div className="panel-title-row">
            <div>
              <h2>Parent account</h2>
              <p className="panel-subtitle">Use one parent account on the tablet and on your phone or laptop.</p>
            </div>
            <KeyRound className="title-wave" />
          </div>

          {!isSupabaseConfigured && (
            <div className="setup-box">
              <Database size={20} />
              <div>
                <strong>Server sync is not connected yet.</strong>
                <p>Add a Supabase project, run <code>supabase/schema.sql</code>, copy <code>.env.example</code> to <code>.env.local</code>, add your URL/key, then restart the dev server.</p>
              </div>
            </div>
          )}

          {isSupabaseConfigured && !session && (
            <form className="account-form" onSubmit={handleAuth}>
              <Segmented options={["Sign in", "Create"]} value={mode} onChange={setMode} label="Account mode" />
              <label>
                Parent email
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
              </label>
              <label>
                Password
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === "Create" ? "new-password" : "current-password"} required minLength={8} />
              </label>
              <button className="primary-button" type="submit" disabled={busy}>
                <KeyRound size={17} /> {mode === "Create" ? "Create parent account" : "Sign in"}
              </button>
            </form>
          )}

          {isSupabaseConfigured && session && (
            <div className="settings-list">
              <p><Check size={18} /> Signed in as <strong>{session.user.email}</strong>.</p>
              <p><Check size={18} /> Use this same account on the child tablet and your device.</p>
              <button className="secondary-button" type="button" onClick={handleSignOut} disabled={busy}>
                <LogOut size={17} /> Sign out
              </button>
            </div>
          )}

          <p className="sync-message">{message}</p>
        </Panel>

        <Panel>
          <div className="panel-title-row">
            <div>
              <h2>Family profile</h2>
              <p className="panel-subtitle">This is the profile shared with the parent dashboard after sync.</p>
            </div>
            <UserRound className="title-wave" />
          </div>
          <div className="form-grid">
            <label>
              Parent name
              <input value={profile.parentName || ""} onChange={(event) => updateProfile("parentName", event.target.value)} placeholder="Parent or guardian" />
            </label>
            <label>
              Child name
              <input value={profile.childName || ""} onChange={(event) => updateProfile("childName", event.target.value)} />
            </label>
            <label>
              Clinical note
              <textarea value={profile.neuroPedStatus || ""} onChange={(event) => updateProfile("neuroPedStatus", event.target.value)} />
            </label>
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="panel-title-row">
          <div>
            <h2>Family Sync</h2>
            <p className="panel-subtitle">Upload from the tablet, then load from your own device using the same parent account.</p>
          </div>
          <CloudUpload className="title-wave" />
        </div>
        <div className="sync-actions">
          <button className="primary-button" type="button" onClick={syncToCloud} disabled={!session || busy}>
            <CloudUpload size={17} /> Sync tablet data to server
          </button>
          <button className="secondary-button" type="button" onClick={loadFromCloud} disabled={!session || busy}>
            <CloudDownload size={17} /> Load from server
          </button>
        </div>
        <div className="sync-summary">
          <SmallStat label="Local logs" value={logs.length} note="This device" />
          <SmallStat label="Journal entries" value={journals.length} note="This device" />
          <SmallStat label="Care profile" value={profile.childName || "Child"} note="Ready to sync" />
        </div>
      </Panel>
    </section>
  );
}

function HelpView({ isChildMode, onJournal, onTools, onLogs }) {
  const guideCards = [
    {
      icon: <Plus />,
      title: "1. Log episodes when they happen",
      text: "Use Log Tic for the tic type, urge level, intensity, pain, context, and one short note. This creates a timeline instead of relying on memory.",
    },
    {
      icon: <NotebookPen />,
      title: "2. Journal without pressure",
      text: "Use the Journal for mood, body feeling, tic pressure, trigger, and what helped. One sentence is enough, especially for a child with ADHD.",
    },
    {
      icon: <Waves />,
      title: "3. Use Calm Mode during an episode",
      text: "The breathing timer can help him ride out stress or an urge wave. It is support, not a command to suppress tics.",
    },
    {
      icon: <BarChart3 />,
      title: "4. Review patterns weekly",
      text: "Check Trends for common contexts and average urge. Look for patterns like tiredness, school stress, screens, excitement, or medication days.",
    },
    {
      icon: <ClipboardList />,
      title: isChildMode ? "5. Keep it simple" : "5. Prepare for specialist visits",
      text: isChildMode
        ? "Child Mode keeps logging, journaling, and calm support visible while parent reports and settings stay locked."
        : "Use Care Tools for YGTSS-style weekly observations, PUTS-style urge tracking, medication history, red flags, and the downloadable doctor report.",
    },
    {
      icon: <AlertTriangle />,
      title: "6. Watch safety signs",
      text: "If tics cause injury, breathing or swallowing issues, sudden dramatic change, seizure-like episodes, or self-harm talk, contact a qualified clinician promptly.",
    },
  ];

  return (
    <section className="view-stack">
      <div className="disclaimer">
        <CircleHelp size={20} />
        <p>
          TicTide helps organize observations, coping notes, and clinician-ready reports. It does not diagnose, cure, or replace care from a neuro-pediatrician, child psychiatrist, psychologist, or therapist.
        </p>
      </div>

      <div className="help-hero">
        <Panel>
          <div className="panel-title-row">
            <div>
              <h2>How to use TicTide</h2>
              <p className="panel-subtitle">A simple routine for daily support and better specialist conversations.</p>
            </div>
            <BookOpenText className="title-wave" />
          </div>
          <div className="help-steps">
            {guideCards.map((card) => (
              <HelpCard key={card.title} {...card} />
            ))}
          </div>
        </Panel>

        <Panel className="help-benefit-panel">
          <div className="panel-title-row">
            <h2>How it can help</h2>
            <Lightbulb className="title-wave" />
          </div>
          <div className="settings-list">
            <p><Check size={18} /> Builds awareness of urges, triggers, and body signals.</p>
            <p><Check size={18} /> Makes ADHD-friendly tracking quick with taps and short notes.</p>
            <p><Check size={18} /> Helps parents spot weekly patterns without guessing.</p>
            <p><Check size={18} /> {isChildMode ? "Keeps parent tools behind the parent PIN." : "Gives clinicians clearer history, medication notes, and red flags."}</p>
            <p><Check size={18} /> Data belongs to the parent account when Family Sync is used.</p>
          </div>
          <div className="help-actions">
            <button className="primary-button" type="button" onClick={onLogs}>
              <Plus size={17} /> Log now
            </button>
            <button className="secondary-button" type="button" onClick={onJournal}>
              <NotebookPen size={17} /> Journal
            </button>
            <button className="secondary-button" type="button" onClick={onTools}>
              <ClipboardList size={17} /> {isChildMode ? "My logs" : "Care Tools"}
            </button>
          </div>
        </Panel>
      </div>
    </section>
  );
}

function HelpCard({ icon, title, text }) {
  return (
    <article className="help-card">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </article>
  );
}

function SettingsView({ access, setAccess, onEnterChildMode }) {
  function updateAccess(field, value) {
    setAccess((current) => ({ ...current, [field]: value.replace(/\D/g, "").slice(0, 6) }));
  }

  return (
    <section className="view-stack">
      <Panel>
        <div className="panel-title-row">
          <h2>Private family mode</h2>
          <button className="primary-button" type="button" onClick={onEnterChildMode}>
            <LockKeyhole size={17} /> Start Child Mode
          </button>
        </div>
        <div className="settings-list">
          <p><Check size={18} /> Child Mode uses a local code and keeps parent tools locked.</p>
          <p><Check size={18} /> TicTide does not diagnose, treat, or cure medical conditions.</p>
          <p><Check size={18} /> YGTSS/PUTS tools are parent observations for clinician discussion.</p>
          <p><Check size={18} /> Use exports to support conversations with qualified clinicians.</p>
        </div>
      </Panel>
      <Panel>
        <div className="panel-title-row">
          <div>
            <h2>Mode access codes</h2>
            <p className="panel-subtitle">These are stored on this device. Use a parent PIN your child does not know.</p>
          </div>
          <LockKeyhole className="title-wave" />
        </div>
        <div className="form-grid compact">
          <label>
            Child access code
            <input value={access.childCode || ""} onChange={(event) => updateAccess("childCode", event.target.value)} inputMode="numeric" />
          </label>
          <label>
            Parent unlock PIN
            <input value={access.parentPin || ""} onChange={(event) => updateAccess("parentPin", event.target.value)} inputMode="numeric" type="password" />
          </label>
        </div>
      </Panel>
    </section>
  );
}

function Brand() {
  return (
    <div className="brand">
      <Waves aria-hidden="true" />
      <span>TicTide</span>
    </div>
  );
}

function ProfileCard({ profile, mode, onClick }) {
  return (
    <button className="profile-card" type="button" onClick={onClick}>
      <div className="avatar" aria-hidden="true">
        {(profile.childName || "K").slice(0, 1).toUpperCase()}
      </div>
      <div>
        <strong>{profile.childName || "Child"}</strong>
        <span>{mode === "child" ? "Child Mode" : "Private profile"}</span>
      </div>
      <ChevronRight size={18} aria-hidden="true" />
    </button>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick} type="button" aria-label={label}>
      {React.cloneElement(icon, { size: 19, "aria-hidden": true })}
      <span>{label}</span>
    </button>
  );
}

function ActionCard({ tone, icon, title, text, onClick }) {
  return (
    <button className="action-card" type="button" onClick={onClick}>
      <span className={`action-icon ${tone}`}>{React.cloneElement(icon, { size: 28, "aria-hidden": true })}</span>
      <span>
        <strong>{title}</strong>
        <em>{text}</em>
      </span>
      <ChevronRight size={18} aria-hidden="true" />
    </button>
  );
}

function ChildBigCard({ tone, icon, title, text, action, onClick }) {
  return (
    <button className={`child-big-card ${tone}`} type="button" onClick={onClick}>
      <span className={`action-icon ${tone}`}>{React.cloneElement(icon, { size: 30, "aria-hidden": true })}</span>
      <span>
        <strong>{title}</strong>
        <em>{text}</em>
      </span>
      <b>{action}</b>
    </button>
  );
}

function Panel({ children, className = "" }) {
  return <section className={`panel ${className}`}>{children}</section>;
}

function Segmented({ options, value, onChange, label }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button key={option} type="button" className={value === option ? "active" : ""} onClick={() => onChange(option)}>
          {option}
        </button>
      ))}
    </div>
  );
}

function ContextChips({ selected, onToggle, options = contextOptions, prompt = "what’s happening right now?" }) {
  const iconMap = {
    Sleep: <Moon />,
    Stress: <Sparkles />,
    School: <FileText />,
    "Screen Time": <Smartphone />,
    Focus: <SlidersHorizontal />,
    Home: <Home />,
    Tired: <Clock3 />,
    "Medication Day": <Pill />,
  };
  return (
    <div className="context-block">
      <p>Context <span>{prompt}</span></p>
      <div className="chip-row">
        {options.map((context) => (
          <button key={context} type="button" className={`chip ${selected.includes(context) ? "selected" : ""}`} onClick={() => onToggle(context)}>
            {React.cloneElement(iconMap[context], { size: 15, "aria-hidden": true })}
            {context}
          </button>
        ))}
      </div>
    </div>
  );
}

function MetricDots({ label, value, total }) {
  return (
    <div className="metric-dots">
      <p>{label}</p>
      <strong>{value}<span>/10</span></strong>
      <div aria-hidden="true">
        {Array.from({ length: total }).map((_, index) => (
          <i key={index} className={index < value ? "filled" : ""} />
        ))}
      </div>
    </div>
  );
}

function MiniChart({ days }) {
  const max = Math.max(...days.map((day) => day.total), 1);
  return (
    <div className="mini-chart" aria-label="Weekly tic log chart">
      {days.map((day) => (
        <div className="bar-col" key={day.label}>
          <span>
            <i style={{ height: `${Math.max(18, (day.motor / max) * 120)}px` }} />
            <b style={{ height: `${Math.max(10, (day.vocal / max) * 80)}px` }} />
          </span>
          <em>{day.label}</em>
        </div>
      ))}
    </div>
  );
}

function SmallStat({ label, value, note }) {
  return (
    <div className="small-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{note}</em>
    </div>
  );
}

function RecentLogs({ logs, onViewAll }) {
  return (
    <Panel>
      <div className="panel-title-row">
        <h2>Recent logs</h2>
        <button className="subtle-button" type="button" onClick={onViewAll}>
          View all <ChevronRight size={16} />
        </button>
      </div>
      <div className="log-list">
        {logs.slice(0, 3).map((log) => (
          <LogRow key={log.id} log={log} />
        ))}
      </div>
    </Panel>
  );
}

function LogRow({ log }) {
  return (
    <article className="log-row">
      <span className={`status-dot ${log.intensity >= 6 ? "high" : log.intensity >= 4 ? "medium" : "low"}`} />
      <div className="log-main">
        <strong>{formatLogTime(log.createdAt)}</strong>
        <div className="tag-row">
          <span>{log.ticName}</span>
          <span>{log.ticType}</span>
          {log.contexts.slice(0, 3).map((context) => (
            <span key={context}>{context}</span>
          ))}
          {log.pain && log.pain !== "None" && <span>Pain: {log.pain}</span>}
        </div>
        {log.note && <p className="log-note">{log.note}</p>}
      </div>
      <div className="log-score">
        <strong>{log.urge}</strong>
        <span>{log.intensity >= 6 ? "Moderate" : "Mild"}</span>
      </div>
      <ChevronRight size={17} aria-hidden="true" />
    </article>
  );
}

function mapCloudLog(row) {
  return {
    id: row.local_id,
    createdAt: row.created_at,
    ticName: row.tic_name,
    ticType: row.tic_type,
    intensity: row.intensity,
    urge: row.urge,
    contexts: row.contexts || [],
    note: row.note || "No note added",
    pain: row.pain || "None",
  };
}

function mapCloudJournal(row) {
  return {
    id: row.local_id,
    createdAt: row.created_at,
    mood: row.mood,
    urgeBefore: row.urge_before,
    ticPressure: row.tic_pressure,
    bodyFeeling: row.body_feeling || "Not sure",
    trigger: row.trigger || "Not noted",
    helped: row.helped || "Nothing yet",
    note: row.note || "No note added",
  };
}

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function scoreYgtss(ygtss) {
  const motor = ygtssDimensions.reduce((sum, key) => sum + Number(ygtss.motor[key] || 0), 0);
  const vocal = ygtssDimensions.reduce((sum, key) => sum + Number(ygtss.vocal[key] || 0), 0);
  const total = motor + vocal;
  const global = total + Number(ygtss.impairment || 0);
  return { motor, vocal, total, global };
}

function scorePuts(puts) {
  const total = Object.values(puts).reduce((sum, value) => sum + Number(value || 0), 0);
  return { total };
}

function buildStats(logs) {
  const avgUrge =
    logs.length === 0 ? "0.0" : (logs.reduce((sum, log) => sum + Number(log.urge), 0) / logs.length).toFixed(1);
  const contexts = logs.flatMap((log) => log.contexts);
  const commonContext =
    contexts.length === 0
      ? "None"
      : contexts.reduce(
          (best, context) => {
            const count = contexts.filter((item) => item === context).length;
            return count > best.count ? { name: context, count } : best;
          },
          { name: contexts[0], count: 0 },
        ).name;

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const days = labels.map((label, index) => {
    const dayLogs = logs.filter((log) => new Date(log.createdAt).getDay() === ((index + 1) % 7));
    const motor = dayLogs.filter((log) => log.ticType === "Motor").length;
    const vocal = dayLogs.length - motor;
    return {
      label,
      motor: motor || Math.max(1, (index + logs.length) % 4),
      vocal: vocal || Math.max(1, (index + 2) % 3),
      total: dayLogs.length || Math.max(2, (index + logs.length) % 6),
    };
  });

  return { avgUrge, commonContext, days };
}

function buildJournalStats(journals) {
  const avgPressure =
    journals.length === 0
      ? "0.0"
      : (journals.reduce((sum, entry) => sum + Number(entry.ticPressure || 0), 0) / journals.length).toFixed(1);
  const moods = journals.map((entry) => entry.mood).filter(Boolean);
  const commonMood =
    moods.length === 0
      ? "None"
      : moods.reduce(
          (best, mood) => {
            const count = moods.filter((item) => item === mood).length;
            return count > best.count ? { name: mood, count } : best;
          },
          { name: moods[0], count: 0 },
        ).name;
  return { avgPressure, commonMood };
}

function buildDoctorReport({ logs, journals, stats, journalStats, ygtssScore, putsScore, meds, profile, redFlags }) {
  const activeFlags = Object.entries(redFlags)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join(", ") || "None marked";
  const latestLogs = logs
    .slice(0, 5)
    .map((log) => `- ${formatLogTime(log.createdAt)}: ${log.ticType} ${log.ticName}, urge ${log.urge}/10, intensity ${log.intensity}/10, contexts ${log.contexts.join("; ")}, pain ${log.pain || "None"}, note: ${log.note}`)
    .join("\n");
  const latestJournals = journals
    .slice(0, 5)
    .map((entry) => `- ${formatLogTime(entry.createdAt)}: mood ${entry.mood}, urge ${entry.urgeBefore}/10, pressure ${entry.ticPressure}/10, body ${entry.bodyFeeling}, helped: ${entry.helped}, trigger: ${entry.trigger}, note: ${entry.note}`)
    .join("\n");
  const medLines = meds
    .map((med) => `- ${med.name || "Medication"} ${med.dose ? `(${med.dose})` : ""}; dates: ${med.dates || "not set"}; response: ${med.response || "not set"}`)
    .join("\n");

  return [
    "TicTide doctor visit summary",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    `Child: ${profile.childName}`,
    `ADHD diagnosis: ${profile.adhdDiagnosed ? "Yes" : "Not marked"}`,
    `Tic duration: ${profile.ticDuration}`,
    `Neuro-ped status: ${profile.neuroPedStatus}`,
    `Medication note: ${profile.medicationNote}`,
    "",
    "Current tracking summary",
    `- Total logs: ${logs.length}`,
    `- Average urge: ${stats.avgUrge}/10`,
    `- Most common context: ${stats.commonContext}`,
    `- Journal entries: ${journals.length}`,
    `- Journal common mood: ${journalStats.commonMood}`,
    `- Journal average tic pressure: ${journalStats.avgPressure}/10`,
    `- YGTSS-style parent observation: motor ${ygtssScore.motor}/25, vocal ${ygtssScore.vocal}/25, tic severity ${ygtssScore.total}/50, global ${ygtssScore.global}/100`,
    `- PUTS-style urge tracker: ${putsScore.total}/36`,
    `- Red flags marked: ${activeFlags}`,
    "",
    "Medication history",
    medLines,
    "",
    "Recent tic logs",
    latestLogs,
    "",
    "Recent journal entries",
    latestJournals || "No journal entries yet",
    "",
    "Questions for clinician",
    "- Does this history fit Tourette syndrome, persistent tic disorder, or another tic-related diagnosis?",
    "- Should we formally assess tic severity using clinician YGTSS?",
    "- Would CBIT or habit-reversal therapy be appropriate now?",
    "- How should ADHD treatment and tic treatment be coordinated?",
    "- What should we monitor if medication is used again?",
  ].join("\n");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(value);
}

function formatLogTime(value) {
  const date = new Date(value);
  const sameDay = new Date().toDateString() === date.toDateString();
  return `${sameDay ? "Today" : "Earlier"}, ${date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function viewTitle(view) {
  return {
    logs: "Logs",
    journal: "Journal",
    trends: "Trends",
    tools: "Care Tools",
    account: "Account & Sync",
    help: "Help Guide",
    settings: "Settings",
  }[view];
}

function downloadFile(filename, parts, type) {
  const blob = new Blob(parts, { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

createRoot(document.getElementById("root")).render(<App />);
