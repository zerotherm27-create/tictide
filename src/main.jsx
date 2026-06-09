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
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down.js";
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

const emptyLogs = [];
const emptyJournals = [];

const defaultYgtss = [];

const emptyYgtssSnapshot = {
  motor: { number: 0, frequency: 0, intensity: 0, complexity: 0, interference: 0 },
  vocal: { number: 0, frequency: 0, intensity: 0, complexity: 0, interference: 0 },
  impairment: 0,
  weekNote: "",
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
  setupComplete: false,
  childName: "",
  parentName: "",
  adhdDiagnosed: false,
  ticDuration: "",
  neuroPedStatus: "",
  medicationNote: "",
};

const emptyMeds = [];

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
  childCode: "",
  parentPin: "",
};

const childViews = new Set(["home", "logs", "journal", "help", "tips"]);

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

function getMondayISO(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d.toISOString().slice(0, 10);
}

function hasEntryThisWeek(ygtss) {
  const weekOf = getMondayISO(new Date());
  return Array.isArray(ygtss) && ygtss.some((s) => s.weekOf === weekOf);
}

function App() {
  const [logs, setLogs] = useStoredState(STORAGE.logs, emptyLogs);
  const [journals, setJournals] = useStoredState(STORAGE.journals, emptyJournals);
  const [ygtss, setYgtss] = useStoredState(STORAGE.ygtss, defaultYgtss);
  const [puts, setPuts] = useStoredState(STORAGE.puts, defaultPuts);
  const [meds, setMeds] = useStoredState(STORAGE.meds, emptyMeds);
  const [profile, setProfile] = useStoredState(STORAGE.profile, defaultProfile);
  const [redFlags, setRedFlags] = useStoredState(STORAGE.redFlags, defaultRedFlags);
  const [access, setAccess] = useStoredState(STORAGE.access, defaultAccess);
  const [appMode, setAppMode] = useStoredState(STORAGE.appMode, "parent");

  const [activeView, setActiveView] = useState("home");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedContexts, setSelectedContexts] = useState([]);
  const [ticName, setTicName] = useState("Custom");
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
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryConfirm, setRecoveryConfirm] = useState("");
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("Choose a new password for the parent account.");
  const [ygtssCheckinOpen, setYgtssCheckinOpen] = useState(false);
  useEffect(() => {
    if (!Array.isArray(ygtss)) {
      const weekOf = getMondayISO(new Date());
      setYgtss([{ weekOf, completedAt: new Date().toISOString(), ...ygtss }]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const isChildMode = appMode === "child";
  const isChildLocked = appMode === "child-lock";
  const needsSetup = !profile.setupComplete;

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsInstalled(standalone);

    function captureInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    function markInstalled() {
      setInstallPrompt(null);
      setIsInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", markInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    let refreshing = false;

    function refreshOnControllerChange() {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    }

    navigator.serviceWorker.addEventListener("controllerchange", refreshOnControllerChange);

    navigator.serviceWorker.register("/public-sw.js").then((registration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setUpdateReady(true);
      }

      registration.addEventListener("updatefound", () => {
        const nextWorker = registration.installing;
        if (!nextWorker) return;
        nextWorker.addEventListener("statechange", () => {
          if (nextWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(nextWorker);
            setUpdateReady(true);
          }
        });
      });
    }).catch(() => {});

    return () => navigator.serviceWorker.removeEventListener("controllerchange", refreshOnControllerChange);
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSeconds((current) => (current > 0 ? current - 1 : 272));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryOpen(true);
        setRecoveryPassword("");
        setRecoveryConfirm("");
        setRecoveryMessage("Choose a new password for the parent account.");
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (appMode !== "parent" && !childViews.has(activeView)) {
      setActiveView("home");
    }
  }, [activeView, appMode]);

  useEffect(() => {
    if (needsSetup) return;
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    if (action === "log") {
      setActiveView("home");
      setFormOpen(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (action === "journal") {
      setActiveView("journal");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [needsSetup]);

  const stats = useMemo(() => buildStats(logs), [logs]);
  const journalStats = useMemo(() => buildJournalStats(journals), [journals]);
  const ygtssScore = useMemo(() => {
    const latest = Array.isArray(ygtss) && ygtss.length > 0 ? ygtss[0] : null;
    return scoreYgtss(latest);
  }, [ygtss]);
  const putsScore = useMemo(() => scorePuts(puts), [puts]);
  const breathingGuide = getBreathingGuide(seconds);
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

  function saveChildLog(data) {
    const log = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ticName: data.ticName,
      ticType: data.ticType,
      intensity: data.intensity,
      urge: data.hadUrge ? 7 : 0,
      pain: data.hurt ? "Mild" : "None",
      contexts: data.contexts,
      note: data.note?.trim() || "No note added",
      hadUrge: data.hadUrge,
    };
    setLogs((current) => [log, ...current]);
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

  async function installApp() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => undefined);
    setInstallPrompt(null);
  }

  function activateUpdate() {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  }

  function completeSetup(setup) {
    setLogs([]);
    setJournals([]);
    setMeds([]);
    setYgtss(defaultYgtss);
    setPuts(defaultPuts);
    setRedFlags(defaultRedFlags);
    setAccess({
      childCode: setup.childCode,
      parentPin: setup.parentPin,
    });
    setProfile({
      ...defaultProfile,
      setupComplete: true,
      childName: setup.childName,
      parentName: setup.parentName,
      adhdDiagnosed: setup.adhdDiagnosed,
      ticDuration: setup.ticDuration,
      neuroPedStatus: setup.neuroPedStatus,
      medicationNote: setup.medicationNote,
    });
    setSelectedContexts([]);
    setTicName("Custom");
    setAppMode("parent");
    setActiveView("home");
  }

  function handleSaveYgtss(snapshot) {
    setYgtss((prev) => [snapshot, ...(Array.isArray(prev) ? prev : [])]);
    setYgtssCheckinOpen(false);
  }

  if (needsSetup) {
    return (
      <>
        <SetupView
          profile={profile}
          onRestore={(data, localAccess) => restoreSetupFromCloud(data, localAccess)}
          installPrompt={installPrompt}
          isInstalled={isInstalled}
          updateReady={updateReady}
          onInstall={installApp}
          onUpdate={activateUpdate}
          onComplete={completeSetup}
        />
        {recoveryModal}
      </>
    );
  }

  function applyCloudData(data) {
    setLogs(data.logs);
    setJournals(data.journals);
    setProfile(data.profile);
    setYgtss(data.ygtss);
    setPuts(data.puts);
    setMeds(data.meds);
    setRedFlags(data.redFlags);
  }

  function restoreSetupFromCloud(data, localAccess) {
    applyCloudData(data);
    setAccess(localAccess);
    setSelectedContexts([]);
    setTicName("Custom");
    setAppMode("child-lock");
    setActiveView("home");
  }

  async function finishPasswordRecovery(event) {
    event.preventDefault();
    if (!supabase) return;
    if (recoveryPassword.length < 8) {
      setRecoveryMessage("Use at least 8 characters for the new password.");
      return;
    }
    if (recoveryPassword !== recoveryConfirm) {
      setRecoveryMessage("The new password and confirmation do not match.");
      return;
    }

    setRecoveryBusy(true);
    setRecoveryMessage("Saving the new password...");
    const { error } = await supabase.auth.updateUser({ password: recoveryPassword });
    setRecoveryBusy(false);
    if (error) {
      setRecoveryMessage(`Could not update password: ${error.message}`);
      return;
    }

    setRecoveryOpen(false);
    setRecoveryPassword("");
    setRecoveryConfirm("");
    setRecoveryMessage("Password updated.");
  }

  const recoveryModal = recoveryOpen ? (
    <PasswordRecoveryModal
      password={recoveryPassword}
      confirmPassword={recoveryConfirm}
      busy={recoveryBusy}
      message={recoveryMessage}
      onPasswordChange={setRecoveryPassword}
      onConfirmChange={setRecoveryConfirm}
      onSubmit={finishPasswordRecovery}
      onClose={() => setRecoveryOpen(false)}
    />
  ) : null;

  if (isChildLocked) {
    return (
      <>
        <ChildUnlockView
          profile={profile}
          access={access}
          onUnlockChild={() => setAppMode("child")}
          onUnlockParent={() => setAppMode("parent")}
        />
        {recoveryModal}
      </>
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

        <PwaPrompt
          installPrompt={installPrompt}
          isInstalled={isInstalled}
          updateReady={updateReady}
          onInstall={installApp}
          onUpdate={activateUpdate}
        />

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
            breathingGuide={breathingGuide}
            onAdd={() => setFormOpen(true)}
            onLogs={() => setActiveView("logs")}
            onJournal={() => navigate("journal")}
            onTrends={() => navigate("trends")}
            onTools={() => navigate("tools")}
            onTips={() => navigate("tips")}
            isChildMode={isChildMode}
            ygtss={ygtss}
            onYgtssCheckin={() => setYgtssCheckinOpen(true)}
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
            isChildMode={isChildMode}
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
            onApplyCloudData={applyCloudData}
          />
        )}
        {isChildMode && activeView === "tips" && (
          <ChildTipsView onBack={() => navigate("home")} />
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
        {!isChildMode && (
          <>
            <NavButton icon={<BarChart3 />} label="Trends" active={activeView === "trends"} onClick={() => navigate("trends")} />
            <NavButton icon={<ClipboardList />} label="Care Tools" active={activeView === "tools"} onClick={() => navigate("tools")} />
          </>
        )}
      </nav>

      {ygtssCheckinOpen && !isChildMode && (
        <YgtssCheckinModal
          onSave={handleSaveYgtss}
          onClose={() => setYgtssCheckinOpen(false)}
        />
      )}
      {formOpen && isChildMode && (
        <ChildLogForm
          defaultContexts={selectedContexts}
          onSave={saveChildLog}
          onClose={() => setFormOpen(false)}
        />
      )}
      {formOpen && !isChildMode && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setFormOpen(false)}>
          <form className="log-form" onSubmit={addLog} onMouseDown={(event) => event.stopPropagation()} aria-label="Log a tic">
            <div className="panel-title-row">
              <h2>{isChildMode ? "Save what happened" : "Log a tic"}</h2>
              <button className="subtle-button" type="button" onClick={() => setFormOpen(false)}>
                Close
              </button>
            </div>
            <label>
              {isChildMode ? "What kind of tic?" : "Tic"}
              <select value={ticName} onChange={(event) => setTicName(event.target.value)}>
                {ticOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            {!isChildMode && (
              <Segmented options={["Motor", "Vocal"]} value={ticType} onChange={setTicType} label="Tic type" />
            )}
            <label>
              {isChildMode ? `How strong was the feeling? ${urge}/10` : `Urge level: ${urge}/10`}
              <input type="range" min="1" max="10" value={urge} onChange={(event) => setUrge(event.target.value)} />
            </label>
            <label>
              {isChildMode ? `How big was the tic? ${intensity}/10` : `Intensity: ${intensity}/10`}
              <input type="range" min="1" max="10" value={intensity} onChange={(event) => setIntensity(event.target.value)} />
            </label>
            <label>
              {isChildMode ? "Did it hurt?" : "Pain or discomfort"}
              <select value={pain} onChange={(event) => setPain(event.target.value)}>
                {["None", "Mild", "Moderate", "Severe"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <ContextChips
              selected={selectedContexts}
              onToggle={toggleContext}
              options={isChildMode ? ["Stress", "School", "Screen Time", "Tired", "Home"] : contextOptions}
              prompt={isChildMode ? "what was happening?" : "what's happening right now?"}
            />
            <label>
              {isChildMode ? "One short note (or skip it)" : "Note"}
              <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={isChildMode ? "One word or one sentence is enough." : "What happened before, during, or after?"} />
            </label>
            <button className="primary-button" type="submit">
              <Check size={18} /> {isChildMode ? "Save it" : "Save log"}
            </button>
          </form>
        </div>
      )}
      {recoveryModal}
    </div>
  );
}

function SetupView({ profile, onRestore, installPrompt, isInstalled, updateReady, onInstall, onUpdate, onComplete }) {
  const isLegacyDemoProfile = !profile.setupComplete && profile.childName === "Kai";
  const [childName, setChildName] = useState(profile.childName && !isLegacyDemoProfile ? profile.childName : "");
  const [parentName, setParentName] = useState(profile.parentName || "");
  const [adhdDiagnosed, setAdhdDiagnosed] = useState(isLegacyDemoProfile ? false : Boolean(profile.adhdDiagnosed));
  const [ticDuration, setTicDuration] = useState(isLegacyDemoProfile ? "" : profile.ticDuration || "");
  const [neuroPedStatus, setNeuroPedStatus] = useState(isLegacyDemoProfile ? "" : profile.neuroPedStatus || "");
  const [medicationNote, setMedicationNote] = useState(isLegacyDemoProfile ? "" : profile.medicationNote || "");
  const [childCode, setChildCode] = useState("");
  const [parentPin, setParentPin] = useState("");
  const [message, setMessage] = useState("Set this up before sharing the app with your child.");
  const [restoreEmail, setRestoreEmail] = useState("");
  const [restorePassword, setRestorePassword] = useState("");
  const [restoreChildCode, setRestoreChildCode] = useState("");
  const [restoreParentPin, setRestoreParentPin] = useState("");
  const [restoreBusy, setRestoreBusy] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState(
    isSupabaseConfigured
      ? "Use the same parent account you used on desktop."
      : "Family Sync is not connected on this build yet.",
  );

  function cleanCode(value) {
    return value.replace(/\D/g, "").slice(0, 6);
  }

  function submitSetup(event) {
    event.preventDefault();
    if (!childName.trim()) {
      setMessage("Add your child’s name first.");
      return;
    }
    if (childCode.length < 4) {
      setMessage("Use at least 4 numbers for the child code.");
      return;
    }
    if (parentPin.length < 4) {
      setMessage("Use at least 4 numbers for the parent PIN.");
      return;
    }
    if (childCode === parentPin) {
      setMessage("Use different numbers for the child code and parent PIN.");
      return;
    }
    onComplete({
      childName: childName.trim(),
      parentName: parentName.trim(),
      adhdDiagnosed,
      ticDuration: ticDuration.trim(),
      neuroPedStatus: neuroPedStatus.trim(),
      medicationNote: medicationNote.trim(),
      childCode,
      parentPin,
    });
  }

  async function restoreFromParentAccount(event) {
    event.preventDefault();
    if (!supabase) {
      setRestoreMessage("Family Sync is not connected on this build yet.");
      return;
    }
    if (restoreChildCode.length < 4) {
      setRestoreMessage("Use at least 4 numbers for the child code on this tablet.");
      return;
    }
    if (restoreParentPin.length < 4) {
      setRestoreMessage("Use at least 4 numbers for the parent PIN on this tablet.");
      return;
    }
    if (restoreChildCode === restoreParentPin) {
      setRestoreMessage("Use different numbers for the child code and parent PIN.");
      return;
    }

    setRestoreBusy(true);
    setRestoreMessage("Signing in and loading Family Sync...");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: restoreEmail.trim(),
        password: restorePassword,
      });
      if (error) throw error;
      if (!data.session?.user) {
        setRestoreMessage("Signed in, but the account needs confirmation before it can restore data.");
        return;
      }

      const cloudData = await loadFamilySyncData({
        profile,
        ygtss: defaultYgtss,
        puts: defaultPuts,
        meds: emptyMeds,
        redFlags: defaultRedFlags,
      });
      onRestore(cloudData, {
        childCode: restoreChildCode,
        parentPin: restoreParentPin,
      });
    } catch (error) {
      setRestoreMessage(friendlyAuthError(error, "restore"));
    } finally {
      setRestoreBusy(false);
    }
  }

  async function sendRestoreReset() {
    const email = restoreEmail.trim();
    if (!email) {
      setRestoreMessage("Enter the parent email first, then use Forgot password.");
      return;
    }
    setRestoreBusy(true);
    const result = await requestPasswordReset(email);
    setRestoreBusy(false);
    setRestoreMessage(result);
  }

  return (
    <main className="access-screen setup-screen">
      <section className="access-card setup-card">
        <Brand />
        <div className="access-hero setup-hero">
          <div className="avatar large" aria-hidden="true">
            {childName.trim() ? childName.trim().slice(0, 1).toUpperCase() : <UserRound size={28} />}
          </div>
          <div>
            <h1>Set up TicTide</h1>
            <p>Create your child’s private profile before handing over the tablet.</p>
          </div>
        </div>

        <PwaPrompt
          installPrompt={installPrompt}
          isInstalled={isInstalled}
          updateReady={updateReady}
          onInstall={onInstall}
          onUpdate={onUpdate}
        />

        <Panel className="restore-panel">
          <div className="panel-title-row">
            <div>
              <h2>Already set up on another device?</h2>
              <p className="panel-subtitle">Sign in with the parent account, then this tablet will load the child profile and saved logs.</p>
            </div>
            <CloudDownload className="title-wave" aria-hidden="true" />
          </div>
          <div className="restore-note">
            <Check size={18} />
            <p>First, on the desktop profile, open Account & Sync, create or sign in to the parent account, then tap Sync tablet data to server.</p>
          </div>
          {!isSupabaseConfigured && (
            <div className="setup-box">
              <Database size={20} />
              <div>
                <strong>Family Sync is not connected.</strong>
                <p>Connect Supabase before restoring a desktop profile on this tablet.</p>
              </div>
            </div>
          )}
          <form className="account-form restore-form" onSubmit={restoreFromParentAccount}>
            <div className="form-grid compact">
              <label>
                Parent email
                <input
                  value={restoreEmail}
                  onChange={(event) => setRestoreEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  disabled={!isSupabaseConfigured || restoreBusy}
                  required
                />
              </label>
              <label>
                Parent password
                <input
                  value={restorePassword}
                  onChange={(event) => setRestorePassword(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                  disabled={!isSupabaseConfigured || restoreBusy}
                  minLength={8}
                  required
                />
              </label>
              <label>
                Child code for this tablet
                <input
                  value={restoreChildCode}
                  onChange={(event) => setRestoreChildCode(cleanCode(event.target.value))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="4 to 6 numbers"
                  disabled={!isSupabaseConfigured || restoreBusy}
                  required
                />
              </label>
              <label>
                Parent PIN for this tablet
                <input
                  value={restoreParentPin}
                  onChange={(event) => setRestoreParentPin(cleanCode(event.target.value))}
                  inputMode="numeric"
                  type="password"
                  placeholder="4 to 6 numbers"
                  disabled={!isSupabaseConfigured || restoreBusy}
                  required
                />
              </label>
            </div>
            <div className="restore-actions">
              <p className="sync-message">{restoreMessage}</p>
              <div className="button-cluster">
                <button className="subtle-button" type="button" onClick={sendRestoreReset} disabled={!isSupabaseConfigured || restoreBusy}>
                  Forgot password
                </button>
                <button className="primary-button" type="submit" disabled={!isSupabaseConfigured || restoreBusy}>
                  <CloudDownload size={17} /> {restoreBusy ? "Restoring..." : "Restore on this tablet"}
                </button>
              </div>
            </div>
          </form>
        </Panel>

        <form className="setup-form" onSubmit={submitSetup}>
          <Panel>
            <div className="panel-title-row">
              <div>
                <h2>Child profile</h2>
                <p className="panel-subtitle">No demo user will be shown after this.</p>
              </div>
              <UserRound className="title-wave" aria-hidden="true" />
            </div>
            <div className="form-grid compact">
              <label>
                Child name
                <input value={childName} onChange={(event) => setChildName(event.target.value)} autoComplete="off" required />
              </label>
              <label>
                Parent name
                <input value={parentName} onChange={(event) => setParentName(event.target.value)} autoComplete="name" placeholder="Optional" />
              </label>
            </div>
            <label className="flag setup-check">
              <input type="checkbox" checked={adhdDiagnosed} onChange={(event) => setAdhdDiagnosed(event.target.checked)} />
              ADHD already diagnosed
            </label>
          </Panel>

          <Panel>
            <div className="panel-title-row">
              <div>
                <h2>Access codes</h2>
                <p className="panel-subtitle">Child code opens Child Mode. Parent PIN protects reports and settings.</p>
              </div>
              <LockKeyhole className="title-wave" aria-hidden="true" />
            </div>
            <div className="form-grid compact">
              <label>
                Child code
                <input value={childCode} onChange={(event) => setChildCode(cleanCode(event.target.value))} inputMode="numeric" autoComplete="one-time-code" placeholder="4 to 6 numbers" required />
              </label>
              <label>
                Parent PIN
                <input value={parentPin} onChange={(event) => setParentPin(cleanCode(event.target.value))} inputMode="numeric" type="password" placeholder="4 to 6 numbers" required />
              </label>
            </div>
          </Panel>

          <Panel>
            <div className="panel-title-row">
              <div>
                <h2>Care notes</h2>
                <p className="panel-subtitle">Optional notes for the parent report.</p>
              </div>
              <ClipboardList className="title-wave" aria-hidden="true" />
            </div>
            <div className="form-grid">
              <label>
                Tic duration
                <input value={ticDuration} onChange={(event) => setTicDuration(event.target.value)} placeholder="Example: about 3 years" />
              </label>
              <label>
                Neuro-ped status
                <textarea value={neuroPedStatus} onChange={(event) => setNeuroPedStatus(event.target.value)} placeholder="Diagnosis, specialist notes, or questions to ask" />
              </label>
              <label>
                Medication note
                <textarea value={medicationNote} onChange={(event) => setMedicationNote(event.target.value)} placeholder="Past medicine, response, side effects, or leave blank" />
              </label>
            </div>
          </Panel>

          <div className="setup-footer">
            <p className="sync-message">{message}</p>
            <button className="primary-button large-button" type="submit">
              <Check size={18} /> Create private profile
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function PwaPrompt({ installPrompt, isInstalled, updateReady, onInstall, onUpdate }) {
  if (updateReady) {
    return (
      <div className="pwa-banner" role="status">
        <div>
          <strong>Update ready</strong>
          <p>A newer TicTide version is ready to use.</p>
        </div>
        <button className="primary-button" type="button" onClick={onUpdate}>
          Refresh
        </button>
      </div>
    );
  }

  if (!installPrompt || isInstalled) return null;

  return (
    <div className="pwa-banner" role="status">
      <div>
        <strong>Install TicTide</strong>
        <p>Add it to the tablet home screen for app-like offline access.</p>
      </div>
      <button className="primary-button" type="button" onClick={onInstall}>
        <Smartphone size={17} /> Install
      </button>
    </div>
  );
}

function PasswordRecoveryModal({ password, confirmPassword, busy, message, onPasswordChange, onConfirmChange, onSubmit, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="log-form recovery-form" onSubmit={onSubmit} onMouseDown={(event) => event.stopPropagation()} aria-label="Reset parent password">
        <div className="panel-title-row">
          <div>
            <h2>Reset parent password</h2>
            <p className="panel-subtitle">This link came from the reset email. Choose a new password to finish recovery.</p>
          </div>
          <button className="subtle-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <label>
          New password
          <input value={password} onChange={(event) => onPasswordChange(event.target.value)} type="password" autoComplete="new-password" minLength={8} required />
        </label>
        <label>
          Confirm new password
          <input value={confirmPassword} onChange={(event) => onConfirmChange(event.target.value)} type="password" autoComplete="new-password" minLength={8} required />
        </label>
        <p className="sync-message">{message}</p>
        <button className="primary-button" type="submit" disabled={busy}>
          <Check size={17} /> {busy ? "Saving..." : "Save new password"}
        </button>
      </form>
    </div>
  );
}

function PinPad({ value, onChange, maxLength = 6 }) {
  function press(digit) {
    if (value.length < maxLength) onChange(value + digit);
  }
  function backspace() {
    onChange(value.slice(0, -1));
  }
  const dots = Array.from({ length: maxLength }).map((_, index) => (
    <span key={index} className={`pin-dot ${index < value.length ? "filled" : ""}`} />
  ));
  return (
    <div className="pin-pad">
      <div className="pin-dots" aria-label={`${value.length} digits entered`}>{dots}</div>
      <div className="pin-grid">
        {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((key) => (
          key === "" ? (
            <span key="empty" />
          ) : key === "⌫" ? (
            <button key="back" type="button" className="pin-key back" onClick={backspace} aria-label="Delete">
              {key}
            </button>
          ) : (
            <button key={key} type="button" className="pin-key" onClick={() => press(key)}>
              {key}
            </button>
          )
        ))}
      </div>
    </div>
  );
}

function ChildUnlockView({ profile, access, onUnlockChild, onUnlockParent }) {
  const [code, setCode] = useState("");
  const [parentPin, setParentPin] = useState("");
  const [showParent, setShowParent] = useState(false);
  const [message, setMessage] = useState("");

  function unlockChild() {
    if (code.trim() === String(access.childCode || "").trim()) {
      setCode("");
      onUnlockChild();
      return;
    }
    setMessage("That code didn't work. Try again.");
    setCode("");
  }

  function unlockParent() {
    if (parentPin.trim() === String(access.parentPin || "").trim()) {
      setParentPin("");
      onUnlockParent();
      return;
    }
    setMessage("Parent PIN didn't match.");
    setParentPin("");
  }

  const maxLen = Math.max(
    String(access.childCode || "").length,
    String(access.parentPin || "").length,
    4,
  );

  function handleCodeChange(value) {
    setCode(value);
    setMessage("");
    if (value.length === maxLen) {
      setTimeout(() => {
        if (value.trim() === String(access.childCode || "").trim()) {
          onUnlockChild();
        } else {
          setMessage("That code didn't work. Try again.");
          setCode("");
        }
      }, 120);
    }
  }

  function handlePinChange(value) {
    setParentPin(value);
    setMessage("");
    if (value.length === maxLen) {
      setTimeout(() => {
        if (value.trim() === String(access.parentPin || "").trim()) {
          onUnlockParent();
        } else {
          setMessage("Parent PIN didn't match.");
          setParentPin("");
        }
      }, 120);
    }
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

        {!showParent ? (
          <div className="pin-section">
            <h2>Enter your code</h2>
            <PinPad value={code} onChange={handleCodeChange} maxLength={maxLen} />
            {message && <p className="sync-message">{message}</p>}
            <button className="subtle-button" type="button" onClick={() => { setShowParent(true); setCode(""); setMessage(""); }}>
              <LockKeyhole size={15} /> Parent unlock
            </button>
          </div>
        ) : (
          <div className="pin-section">
            <h2>Parent PIN</h2>
            <PinPad value={parentPin} onChange={handlePinChange} maxLength={maxLen} />
            {message && <p className="sync-message">{message}</p>}
            <button className="subtle-button" type="button" onClick={() => { setShowParent(false); setParentPin(""); setMessage(""); }}>
              Back to child code
            </button>
          </div>
        )}
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

const CHILD_CHIP_ICONS = {
  sparkle: <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>,
  school:  <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>,
  moon:    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>,
  zap:     <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
  monitor: <><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></>,
  clock:   <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
};

function ChildChipIcon({ name }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {CHILD_CHIP_ICONS[name]}
    </svg>
  );
}

function ChildHomeView(props) {
  return (
    <section className="child-home-v2" aria-label="Child home">

      {/* Breathing ring — CBIT Relaxation hero */}
      <div className="cv2-ring-card">
        <span className="cv2-science-badge">CBIT Relaxation</span>
        <div
          className="breathing-ring cv2-ring"
          aria-label="Breathing timer"
          data-phase={props.breathingGuide.label.toLowerCase()}
        >
          <span className="cv2-ring-phase">{props.breathingGuide.label}</span>
          <strong className="cv2-ring-count">{props.breathingGuide.beat}</strong>
          <small className="cv2-ring-prompt">{props.breathingGuide.prompt}</small>
        </div>
        <div className="cv2-ring-legend">
          <span className="cv2-legend-dot cv2-legend-teal">Inhale 4s</span>
          <span className="cv2-legend-dot cv2-legend-gold">Hold 4s</span>
          <span className="cv2-legend-dot cv2-legend-coral">Exhale 6s</span>
        </div>
        <button
          className="cv2-start-btn"
          type="button"
          onClick={() => props.setRunning((v) => !v)}
        >
          {props.running ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
          {props.running ? "Pause breathing" : "Start 4-4-6 breathing"}
        </button>
      </div>

      {/* Access Tips card — CBIT · HRT · CBT */}
      <button className="cv2-tips-card" type="button" onClick={() => props.onTips()}>
        <div className="cv2-tips-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
            <path d="M9 18h6"/><path d="M10 22h4"/>
          </svg>
        </div>
        <div className="cv2-tips-text">
          <strong>Access tips</strong>
          <span>Strategies that actually help</span>
          <div className="cv2-tips-badges">
            <em className="cv2-mb-cbit">CBIT</em>
            <em className="cv2-mb-hrt">HRT</em>
            <em className="cv2-mb-cbt">CBT</em>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>

      {/* Context chips — CBIT functional assessment */}
      <div className="cv2-chips-card">
        <div className="cv2-chips-heading">
          <span>What's happening?</span>
          <span className="cv2-chips-hint">CBIT trigger log</span>
        </div>
        <div className="cv2-chip-grid">
          {[
            { label: "Stressed", icon: "sparkle" },
            { label: "School",   icon: "school"   },
            { label: "Tired",    icon: "moon"      },
            { label: "Excited",  icon: "zap"       },
            { label: "Screens",  icon: "monitor"   },
            { label: "Bored",    icon: "clock"     },
          ].map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              className={`cv2-chip ${props.selectedContexts.includes(label) ? "cv2-chip-on" : "cv2-chip-off"}`}
              onClick={() => props.toggleContext(label)}
            >
              <ChildChipIcon name={icon} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Save a tic CTA */}
      <button className="cv2-log-cta" type="button" onClick={props.onAdd}>
        <span className="cv2-cta-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
        </span>
        <span className="cv2-cta-text">
          <strong>Save a tic</strong>
          <span>tap during or right after</span>
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>

    </section>
  );
}

const TIC_TILES = [
  {
    id: "arms-legs",
    label: "Arms or legs",
    ticType: "Motor",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="4" r="2"/>
        <line x1="12" y1="6" x2="12" y2="13"/>
        <line x1="12" y1="9" x2="6.5" y2="7"/>
        <line x1="12" y1="9" x2="17.5" y2="7"/>
        <line x1="12" y1="13" x2="9" y2="19"/>
        <line x1="12" y1="13" x2="15" y2="19"/>
      </svg>
    ),
  },
  {
    id: "face-eyes",
    label: "Face or eyes",
    ticType: "Motor",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
        <line x1="8" y1="6.5" x2="7" y2="4.5"/>
        <line x1="12" y1="5.5" x2="12" y2="3.5"/>
        <line x1="16" y1="6.5" x2="17" y2="4.5"/>
      </svg>
    ),
  },
  {
    id: "sound-voice",
    label: "Sound or voice",
    ticType: "Vocal",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" x2="12" y1="19" y2="22"/>
        <line x1="8" x2="16" y1="22" y2="22"/>
      </svg>
    ),
  },
  {
    id: "head-neck",
    label: "Head or neck",
    ticType: "Motor",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="9" r="5"/>
        <line x1="10" y1="14" x2="10" y2="17"/>
        <line x1="14" y1="14" x2="14" y2="17"/>
        <path d="M7 17h10"/>
        <path d="M4 7 Q3 4 6 3"/>
        <path d="M20 7 Q21 4 18 3"/>
      </svg>
    ),
  },
];

const SIZE_OPTS = [
  { label: "Small",  sub: "barely there", intensity: 3, size: 28 },
  { label: "Medium", sub: "noticeable",   intensity: 6, size: 36 },
  { label: "Big",    sub: "hard to hide", intensity: 9, size: 44 },
];

function ChildLogForm({ defaultContexts = [], onSave, onClose }) {
  const [step, setStep] = React.useState(1);
  const [ticTiles, setTicTiles] = React.useState([]);        // array — multi-select
  const [sizePick, setSizePick] = React.useState(null);      // one of SIZE_OPTS
  const [hadUrge, setHadUrge] = React.useState(null);        // true/false/null
  const [hurt, setHurt] = React.useState(null);              // true/false/null
  const [contexts, setContexts] = React.useState(defaultContexts);
  const [note, setNote] = React.useState("");

  function toggleTile(tile) {
    setTicTiles((prev) =>
      prev.some((t) => t.id === tile.id)
        ? prev.filter((t) => t.id !== tile.id)
        : [...prev, tile]
    );
  }

  function toggleCtx(label) {
    setContexts((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  }

  function handleSave() {
    const labels = ticTiles.map((t) => t.label);
    const hasVocal = ticTiles.some((t) => t.ticType === "Vocal");
    const hasMotor = ticTiles.some((t) => t.ticType === "Motor");
    const ticType = hasVocal && hasMotor ? "Both" : hasVocal ? "Vocal" : "Motor";
    onSave({
      ticName: labels.length > 0 ? labels.join(" + ") : "Custom",
      ticType,
      intensity: sizePick?.intensity ?? 5,
      hadUrge: hadUrge ?? false,
      hurt: hurt ?? false,
      contexts,
      note,
    });
  }

  const DOTS = [
    { n: 1, done: step > 1, active: step === 1 },
    { n: 2, done: step > 2, active: step === 2 },
    { n: 3, done: false,    active: step === 3 },
  ];

  return (
    <div className="clf-overlay" role="dialog" aria-modal="true" aria-label="Save a tic">
      <div className="clf-sheet">

        {/* Top bar */}
        <div className="clf-topbar">
          {step > 1 ? (
            <button className="clf-back" type="button" onClick={() => setStep((s) => s - 1)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back
            </button>
          ) : (
            <span/>
          )}
          <div className="clf-dots">
            {DOTS.map((d) => (
              <span
                key={d.n}
                className={`clf-dot ${d.active ? "clf-dot-active" : d.done ? "clf-dot-done" : "clf-dot-todo"}`}
              />
            ))}
          </div>
          <button className="clf-close" type="button" onClick={onClose}>Close</button>
        </div>

        {/* Step 1: What kind? */}
        {step === 1 && (
          <div className="clf-body">
            <div>
              <p className="clf-q">What kind of tic was it?</p>
              <p className="clf-hint">Pick all that fit — he can choose more than one</p>
            </div>
            <div className="clf-tile-grid">
              {TIC_TILES.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  className={`clf-tile ${ticTiles.some((t) => t.id === tile.id) ? "clf-tile-sel" : ""}`}
                  onClick={() => toggleTile(tile)}
                >
                  <span className="clf-tile-icon">{tile.icon}</span>
                  <span className="clf-tile-lbl">{tile.label}</span>
                </button>
              ))}
            </div>
            <button
              className="clf-next-btn"
              type="button"
              disabled={ticTiles.length === 0}
              onClick={() => setStep(2)}
            >
              Next
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        )}

        {/* Step 2: How strong + urge + hurt */}
        {step === 2 && (
          <div className="clf-body">
            <div>
              <p className="clf-q">How strong was it?</p>
              <p className="clf-hint">Everyone's tics are different — this is just for you</p>
            </div>
            <div className="clf-size-row">
              {SIZE_OPTS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  className={`clf-size-opt ${sizePick?.label === opt.label ? "clf-size-sel" : ""}`}
                  onClick={() => setSizePick(opt)}
                >
                  <svg width={opt.size} height={opt.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r={opt.size / 4}/></svg>
                  <span className="clf-size-lbl">{opt.label}</span>
                  <span className="clf-size-sub">{opt.sub}</span>
                </button>
              ))}
            </div>
            <div className="clf-yn-card">
              <div>
                <p className="clf-yn-q">Did you feel it coming?</p>
                <p className="clf-yn-sub">The "premonitory urge" — HRT</p>
              </div>
              <div className="clf-yn-btns">
                <button type="button" className={`clf-yn-btn ${hadUrge === true ? "clf-yn-yes-sel" : ""}`} onClick={() => setHadUrge(true)}>Yes</button>
                <button type="button" className={`clf-yn-btn ${hadUrge === false ? "clf-yn-no-sel" : ""}`} onClick={() => setHadUrge(false)}>No</button>
              </div>
            </div>
            <div className="clf-yn-card">
              <p className="clf-yn-q">Did it hurt?</p>
              <div className="clf-yn-btns">
                <button type="button" className={`clf-yn-btn ${hurt === true ? "clf-yn-yes-sel" : ""}`} onClick={() => setHurt(true)}>Yes</button>
                <button type="button" className={`clf-yn-btn ${hurt === false ? "clf-yn-no-sel" : ""}`} onClick={() => setHurt(false)}>No</button>
              </div>
            </div>
            <button className="clf-next-btn" type="button" onClick={() => setStep(3)}>
              Next
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <button className="clf-skip" type="button" onClick={() => setStep(3)}>Skip this step →</button>
          </div>
        )}

        {/* Step 3: Context + save */}
        {step === 3 && (
          <div className="clf-body">
            <div>
              <p className="clf-q">What was happening?</p>
              <p className="clf-hint">From your home screen — tap to change</p>
            </div>
            <div className="cv2-chip-grid">
              {["Stressed","School","Tired","Excited","Screens","Bored"].map((label) => (
                <button
                  key={label}
                  type="button"
                  className={`cv2-chip ${contexts.includes(label) ? "cv2-chip-on" : "cv2-chip-off"}`}
                  onClick={() => toggleCtx(label)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="clf-note-wrap">
              <label className="clf-note-label" htmlFor="clf-note">One short note (optional)</label>
              <textarea
                id="clf-note"
                className="clf-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="One word or one sentence is enough."
                rows={2}
              />
            </div>
            <button className="clf-save-btn" type="button" onClick={handleSave}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              Save it
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

const TIPS = [
  {
    id: "awareness",
    heading: "Notice the warning feeling",
    approach: "HRT — Awareness Training",
    badgeClass: "ctv-badge-hrt",
    iconClass: "ctv-icon-hrt",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.636 5.636a9 9 0 1 0 12.728 12.728"/>
        <path d="M16.243 7.757a6 6 0 1 0-8.486 8.486"/>
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>
      </svg>
    ),
    body: "Most tics start with a body sensation — a tingle, pressure, or tightness. This is called a premonitory urge. Learning to spot it is the first step to managing tics.",
    tryText: "Next time, pause and notice — where do you feel it? Your shoulder? Your throat?",
    tryClass: "ctv-try-hrt",
  },
  {
    id: "competing",
    heading: "Try a competing response",
    approach: "HRT — Competing Response",
    badgeClass: "ctv-badge-hrt",
    iconClass: "ctv-icon-hrt",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m17 2 4 4-4 4"/>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <path d="m7 22-4-4 4-4"/>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
    ),
    body: "When you feel the urge, do something that makes the tic hard to do at the same time. Hold it for about 1 minute, or until the urge fades.",
    tryText: "Shoulder shrug urge? Press your elbows to your sides. Head jerk? Tuck your chin slightly. Eye blink? Slow-blink once, softly.",
    tryClass: "ctv-try-hrt",
  },
  {
    id: "urge-wave",
    heading: "Ride the urge wave",
    approach: "CBT — Exposure & Response Prevention",
    badgeClass: "ctv-badge-cbt",
    iconClass: "ctv-icon-cbt",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      </svg>
    ),
    body: "Urges always go away on their own — like waves. You don't have to fight the tic or force it. Just notice the urge and breathe until it fades.",
    tryText: "Breathe slowly and count to 10. Most urges peak within 20–30 seconds and then drop.",
    tryClass: "ctv-try-cbt",
  },
  {
    id: "breathe",
    heading: "Breathe to calm down",
    approach: "CBIT — Relaxation Training",
    badgeClass: "ctv-badge-cbit",
    iconClass: "ctv-icon-cbit",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      </svg>
    ),
    body: "When you're stressed, tics often get stronger. Slow breathing (4 in, 4 hold, 6 out) activates your parasympathetic nervous system — your body's natural calm-down switch.",
    tryText: "Use the breathing ring on the home screen. Even one full cycle (14 seconds) helps.",
    tryClass: "ctv-try-cbit",
  },
];

function ChildTipsView({ onBack }) {
  return (
    <section className="ctv-view" aria-label="Tips that help">
      <div className="ctv-topbar">
        <button className="ctv-back" type="button" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <div className="ctv-title">Tips that help</div>
        <div className="ctv-subtitle">Based on what science says works for tics</div>
      </div>
      <div className="ctv-body">
        {TIPS.map((tip) => (
          <div key={tip.id} className="ctv-card">
            <div className="ctv-card-header">
              <div className={`ctv-icon ${tip.iconClass}`}>{tip.icon}</div>
              <div>
                <div className="ctv-heading">{tip.heading}</div>
                <div className={`ctv-badge ${tip.badgeClass}`}>{tip.approach}</div>
              </div>
            </div>
            <p className="ctv-body-text">{tip.body}</p>
            <div className={`ctv-try ${tip.tryClass}`}>
              <strong>Try:</strong> {tip.tryText}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ParentHomeView(props) {
  return (
    <>
      <YgtssBanner ygtss={props.ygtss} onStartCheckin={props.onYgtssCheckin} />
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
            <div className="breathing-ring" aria-label="Breathing timer" data-phase={props.breathingGuide.label.toLowerCase()}>
              <span>{props.breathingGuide.label}</span>
              <strong>
                {props.breathingGuide.beat}
              </strong>
              <small>{props.breathingGuide.prompt}</small>
            </div>
            <div className="calm-controls">
              <div className="breath-instructions">
                <strong>4-4-6 coach</strong>
                <p>Follow the prompt: inhale for 4, hold for 4, then exhale slowly for 6.</p>
              </div>
              <MetricDots label="Urge level" value={props.urge} total={10} />
              <label className="range-label">
                <span>Intensity</span>
                <input type="range" min="1" max="10" value={props.intensity} onChange={(event) => props.setIntensity(event.target.value)} />
                <em>Mild to severe</em>
              </label>
              <button className="primary-button" type="button" onClick={() => props.setRunning((value) => !value)}>
                {props.running ? "Pause breathing" : "Start 4-4-6 coach"}
              </button>
            </div>
          </div>
          <ContextChips selected={props.selectedContexts} onToggle={props.toggleContext} />
          <CbitSupportPanel />
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

function YgtssBanner({ ygtss, onStartCheckin }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || hasEntryThisWeek(ygtss)) return null;
  const monday = getMondayISO(new Date());
  const sun = new Date(monday + "T12:00:00");
  sun.setDate(sun.getDate() + 6);
  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const range = `${fmt(monday)} – ${fmt(sun)}`;
  return (
    <div className="ygtss-banner">
      <div className="ygtss-banner-body">
        <CalendarDays size={18} />
        <div>
          <strong>Rate this week's tics</strong>
          <span>{range} · YGTSS</span>
        </div>
      </div>
      <div className="ygtss-banner-actions">
        <button className="ygtss-banner-cta" type="button" onClick={onStartCheckin}>
          Start check-in →
        </button>
        <button className="ygtss-banner-dismiss" type="button" aria-label="Dismiss" onClick={() => setDismissed(true)}>
          ✕
        </button>
      </div>
    </div>
  );
}

const YGTSS_DIM_LABELS = {
  number: { label: "Number", desc: "How many different tics" },
  frequency: { label: "Frequency", desc: "How often tics happen" },
  intensity: { label: "Intensity", desc: "Force or loudness" },
  complexity: { label: "Complexity", desc: "Simple vs. elaborate" },
  interference: { label: "Interference", desc: "Disruption to activity" },
};

const IMPAIRMENT_OPTS = [
  { value: 0, label: "None" },
  { value: 10, label: "Minimal" },
  { value: 20, label: "Mild" },
  { value: 30, label: "Moderate" },
  { value: 40, label: "Severe" },
  { value: 50, label: "Extreme" },
];

function YgtssCheckinModal({ onSave, onClose }) {
  const [screen, setScreen] = useState(1);
  const emptyDims = { number: 0, frequency: 0, intensity: 0, complexity: 0, interference: 0 };
  const [motor, setMotor] = useState({ ...emptyDims });
  const [noMotor, setNoMotor] = useState(false);
  const [vocal, setVocal] = useState({ ...emptyDims });
  const [noVocal, setNoVocal] = useState(false);
  const [impairment, setImpairment] = useState(0);
  const [note, setNote] = useState("");

  function setDim(setter, key, value) {
    setter((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    const snapshot = {
      weekOf: getMondayISO(new Date()),
      completedAt: new Date().toISOString(),
      motor: noMotor ? { ...emptyDims } : motor,
      vocal: noVocal ? { ...emptyDims } : vocal,
      impairment,
      weekNote: note.trim(),
    };
    onSave(snapshot);
  }

  const motorScore = ygtssDimensions.reduce((s, k) => s + motor[k], 0);
  const vocalScore = ygtssDimensions.reduce((s, k) => s + vocal[k], 0);
  const totalScore = motorScore + vocalScore;

  return (
    <div className="clf-overlay" role="dialog" aria-modal="true">
      <div className="clf-sheet">
        <div className="clf-topbar">
          <button className="clf-back" type="button" onClick={screen === 1 ? onClose : () => setScreen((s) => s - 1)}>
            {screen === 1 ? "✕" : "←"}
          </button>
          <div className="clf-dots">
            {[1, 2, 3].map((n) => (
              <span key={n} className={`clf-dot ${n < screen ? "clf-dot-done" : n === screen ? "clf-dot-active" : "clf-dot-todo"}`} />
            ))}
          </div>
          <span />
        </div>

        {screen === 1 && (
          <div className="ycm-screen">
            <div className="ycm-head">
              <h2>Motor tics this week</h2>
              <span className="ycm-badge">YGTSS</span>
            </div>
            <label className="ycm-no-toggle">
              <input type="checkbox" checked={noMotor} onChange={(e) => setNoMotor(e.target.checked)} />
              No motor tics this week
            </label>
            {!noMotor && ygtssDimensions.map((dim) => (
              <div className="ycm-dim-row" key={dim}>
                <div className="ycm-dim-label">
                  <strong>{YGTSS_DIM_LABELS[dim].label}</strong>
                  <span>{YGTSS_DIM_LABELS[dim].desc}</span>
                </div>
                <div className="ycm-pills">
                  {[0, 1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`ycm-pill ${motor[dim] === v ? "ycm-pill-sel" : ""}`}
                      onClick={() => setDim(setMotor, dim, v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button className="clf-next-btn" type="button" onClick={() => { if (noMotor) setMotor({ ...emptyDims }); setScreen(2); }}>
              Next →
            </button>
          </div>
        )}

        {screen === 2 && (
          <div className="ycm-screen">
            <div className="ycm-head">
              <h2>Vocal tics this week</h2>
              <span className="ycm-badge">YGTSS</span>
            </div>
            <label className="ycm-no-toggle">
              <input type="checkbox" checked={noVocal} onChange={(e) => setNoVocal(e.target.checked)} />
              No vocal tics this week
            </label>
            {!noVocal && ygtssDimensions.map((dim) => (
              <div className="ycm-dim-row" key={dim}>
                <div className="ycm-dim-label">
                  <strong>{YGTSS_DIM_LABELS[dim].label}</strong>
                  <span>{YGTSS_DIM_LABELS[dim].desc}</span>
                </div>
                <div className="ycm-pills">
                  {[0, 1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`ycm-pill ${vocal[dim] === v ? "ycm-pill-sel" : ""}`}
                      onClick={() => setDim(setVocal, dim, v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button className="clf-next-btn" type="button" onClick={() => { if (noVocal) setVocal({ ...emptyDims }); setScreen(3); }}>
              Next →
            </button>
          </div>
        )}

        {screen === 3 && (
          <div className="ycm-screen">
            <div className="ycm-head">
              <h2>Overall impact</h2>
              <span className="ycm-badge">YGTSS</span>
            </div>
            <p className="ycm-screen-sub">How much did tics affect daily life this week?</p>
            <div className="ycm-imp-grid">
              {IMPAIRMENT_OPTS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`ycm-imp-btn ${impairment === opt.value ? "ycm-imp-sel" : ""}`}
                  onClick={() => setImpairment(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="ycm-score-preview">
              Motor {motorScore}/25 · Vocal {vocalScore}/25 · Total {totalScore}/50
            </div>
            <textarea
              className="ycm-note"
              placeholder="Week notes (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
            <button className="clf-save-btn" type="button" onClick={handleSave}>
              Save check-in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const moodEmojis = {
  Calm: "😊",
  Okay: "🙂",
  Stressed: "😟",
  Tired: "😴",
  Frustrated: "😤",
};

function JournalView(props) {
  return (
    <section className="view-stack">
      <div className="journal-grid">
        <Panel>
          <div className="panel-title-row">
            <div>
              <h2>{props.isChildMode ? "How are you feeling?" : "Two-minute journal"}</h2>
              <p className="panel-subtitle">{props.isChildMode ? "Tap your mood, then fill in what you can." : "A short check-in for mood, urge, body feeling, and what helped."}</p>
            </div>
            <PenLine className="title-wave" />
          </div>
          <form className="journal-form" onSubmit={props.onSubmit}>
            {props.isChildMode ? (
              <div className="emoji-mood-row" role="group" aria-label="Mood">
                {moodOptions.map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    className={`emoji-mood-btn ${props.mood === mood ? "selected" : ""}`}
                    onClick={() => props.setMood(mood)}
                    aria-pressed={props.mood === mood}
                  >
                    <span>{moodEmojis[mood]}</span>
                    <em>{mood}</em>
                  </button>
                ))}
              </div>
            ) : (
              <label>
                Mood
                <Segmented options={moodOptions} value={props.mood} onChange={props.setMood} label="Mood" />
              </label>
            )}
            <label className="range-label">
              <span>{props.isChildMode ? <>How strong was the feeling before? <b>{props.urge}/10</b></> : <>Urge before tic <b>{props.urge}/10</b></>}</span>
              <input type="range" min="1" max="10" value={props.urge} onChange={(event) => props.setUrge(event.target.value)} />
            </label>
            <label className="range-label">
              <span>{props.isChildMode ? <>How much pressure did you feel? <b>{props.pressure}/10</b></> : <>Tic pressure <b>{props.pressure}/10</b></>}</span>
              <input type="range" min="1" max="10" value={props.pressure} onChange={(event) => props.setPressure(event.target.value)} />
            </label>
            <div className="form-grid compact">
              <label>
                {props.isChildMode ? "Where did you feel it?" : "Body feeling"}
                <select value={props.bodyFeeling} onChange={(event) => props.setBodyFeeling(event.target.value)}>
                  {bodyFeelingOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                {props.isChildMode ? "What helped a little?" : "What helped"}
                <select value={props.helped} onChange={(event) => props.setHelped(event.target.value)}>
                  {helpedOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              {props.isChildMode ? "What was going on?" : "What was happening?"}
              <input value={props.trigger} onChange={(event) => props.setTrigger(event.target.value)} placeholder={props.isChildMode ? "School, tired, worried, excited..." : "School, screen time, tired, excited, worried..."} />
            </label>
            <label>
              {props.isChildMode ? "Anything else? (you can skip this)" : "My note"}
              <textarea value={props.note} onChange={(event) => props.setNote(event.target.value)} placeholder="One sentence is enough." />
            </label>
            <button className="primary-button" type="submit">
              <Check size={18} /> {props.isChildMode ? "Save my check-in" : "Save journal"}
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
      <YgtssPanel
        ygtss={Array.isArray(ygtss) && ygtss.length > 0 ? ygtss[0] : emptyYgtssSnapshot}
        setYgtss={(updater) =>
          setYgtss((prev) => {
            const arr = Array.isArray(prev) ? prev : [];
            const current = arr[0] ?? { ...emptyYgtssSnapshot, weekOf: getMondayISO(new Date()), completedAt: new Date().toISOString() };
            const updated = typeof updater === "function" ? updater(current) : updater;
            return [updated, ...arr.slice(1)];
          })
        }
        score={ygtssScore}
      />
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
          {logs.length === 0 ? (
            <EmptyState icon={<FileText />} title="No saved logs yet" text="Use New log when your child is ready to record the first tic." />
          ) : (
            logs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))
          )}
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
  onApplyCloudData,
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
      setMessage(friendlyAuthError(result.error, mode === "Create" ? "create" : "sign-in"));
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

  async function handleForgotPassword() {
    const targetEmail = email.trim();
    if (!targetEmail) {
      setMessage("Enter the parent email first, then use Forgot password.");
      return;
    }
    setBusy(true);
    const result = await requestPasswordReset(targetEmail);
    setBusy(false);
    setMessage(result);
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
      const data = await loadFamilySyncData({ profile, ygtss, puts, meds, redFlags });
      onApplyCloudData(data);
      setMessage(`Loaded ${data.logs.length} logs and ${data.journals.length} journal entries from Family Sync.`);
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
              <div className="button-cluster">
                {mode === "Sign in" && (
                  <button className="subtle-button" type="button" onClick={handleForgotPassword} disabled={busy}>
                    Forgot password
                  </button>
                )}
                <button className="primary-button" type="submit" disabled={busy}>
                  <KeyRound size={17} /> {mode === "Create" ? "Create parent account" : "Sign in"}
                </button>
              </div>
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
      text: "The 4-4-6 coach guides inhale, hold, and exhale so he can ride out stress or an urge wave. It is support, not a command to suppress tics.",
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
          <CbitSupportPanel isChildMode={isChildMode} />
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

function CbitSupportPanel({ isChildMode = false }) {
  const items = isChildMode
    ? [
        "Notice the urge and where it starts in your body.",
        "Use the gentle body move your therapist or parent practiced with you, if you have one.",
        "Take one quiet breath cycle before deciding what to do next.",
        "After the wave passes, tell a parent what helped.",
      ]
    : [
        "Notice the urge, body location, and early warning signs.",
        "If a clinician has taught a competing response, prompt that exact response gently. CBIT responses are tic-specific.",
        "Lower stressors you can change right now: noise, screen overload, rushing, or audience pressure.",
        "Praise effort and calm recovery, not perfect suppression. Log triggers and what helped after the episode.",
      ];

  return (
    <div className="cbit-panel">
      <div className="panel-title-row">
        <div>
          <h3>CBIT support tools</h3>
          <p className="panel-subtitle">These are support steps inspired by CBIT. Full CBIT works best with a trained therapist and a tic-specific plan.</p>
        </div>
        <Brain className="title-wave" />
      </div>
      <div className="check-list">
        {items.map((item) => (
          <p key={item}>
            <Check size={18} /> {item}
          </p>
        ))}
      </div>
    </div>
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
      {days.map((day) => {
        const motorHeight = day.motor > 0 ? `${Math.max(18, (day.motor / max) * 120)}px` : "0px";
        const vocalHeight = day.vocal > 0 ? `${Math.max(10, (day.vocal / max) * 80)}px` : "0px";
        return (
          <div className="bar-col" key={day.label}>
            <span>
              <i style={{ height: motorHeight }} />
              <b style={{ height: vocalHeight }} />
            </span>
            <em>{day.label}</em>
          </div>
        );
      })}
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
        {logs.length === 0 ? (
          <EmptyState icon={<FileText />} title="No logs yet" text="The first real log will appear here after setup." />
        ) : (
          logs.slice(0, 3).map((log) => (
            <LogRow key={log.id} log={log} />
          ))
        )}
      </div>
    </Panel>
  );
}

function EmptyState({ icon, title, text }) {
  return (
    <div className="empty-state">
      <span>{React.cloneElement(icon, { size: 20, "aria-hidden": true })}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
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

async function loadFamilySyncData({ profile, ygtss, puts, meds, redFlags }) {
  const { data: family, error: familyError } = await supabase.from("families").select("*").maybeSingle();
  if (familyError) throw familyError;
  if (!family) throw new Error("No cloud family data found yet. Sync from the desktop first.");

  const { data: child, error: childError } = await supabase.from("children").select("*").eq("family_id", family.id).maybeSingle();
  if (childError) throw childError;
  if (!child) throw new Error("No child profile found yet. Sync from the desktop first.");

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

  return {
    logs: (cloudLogs || []).map(mapCloudLog),
    journals: (cloudJournals || []).map(mapCloudJournal),
    profile: { ...defaultProfile, ...(snapshot?.profile || child.local_profile || profile), setupComplete: true },
    ygtss: snapshot?.ygtss || ygtss,
    puts: snapshot?.puts || puts,
    meds: snapshot?.meds || meds,
    redFlags: snapshot?.red_flags || redFlags,
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

function friendlyAuthError(error, context = "sign-in") {
  const code = error?.code || "";
  const message = error?.message || "Authentication failed.";
  const normalized = message.toLowerCase();

  if (code === "email_not_confirmed" || normalized.includes("email not confirmed")) {
    return "Please confirm the parent email first. Open the Supabase confirmation email, then try signing in again.";
  }

  if (code === "invalid_credentials" || normalized.includes("invalid login credentials")) {
    if (context === "restore") {
      return "Could not sign in. On the desktop profile, open Account & Sync, create or sign in to the parent account, tap Sync tablet data to server, then use that same email and password here.";
    }
    return "Could not sign in. Check the parent email and password, or use Create if this parent account has not been made yet.";
  }

  if (normalized.includes("password")) {
    return context === "create"
      ? "Password was not accepted. Use at least 8 characters."
      : "Password was not accepted. Check it and try again.";
  }

  return `${context === "restore" ? "Restore" : "Account"} failed: ${message}`;
}

function getBreathingGuide(seconds) {
  const cycle = 14;
  const elapsed = (272 - seconds + 2730) % cycle;

  if (elapsed < 4) {
    return {
      label: "Inhale",
      beat: 4 - elapsed,
      prompt: "breathe in through your nose",
    };
  }

  if (elapsed < 8) {
    return {
      label: "Hold",
      beat: 8 - elapsed,
      prompt: "keep your shoulders soft",
    };
  }

  return {
    label: "Exhale",
    beat: 14 - elapsed,
    prompt: "breathe out slowly",
  };
}

async function requestPasswordReset(email) {
  if (!supabase) return "Family Sync is not connected on this build yet.";
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    return `Could not send reset email: ${error.message}`;
  }
  return "Password reset email sent. Open the email on this device, then choose a new password when TicTide reopens.";
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

function scoreYgtss(snapshot) {
  if (!snapshot) return { motor: 0, vocal: 0, total: 0, global: 0 };
  const motor = ygtssDimensions.reduce((sum, key) => sum + Number(snapshot.motor?.[key] || 0), 0);
  const vocal = ygtssDimensions.reduce((sum, key) => sum + Number(snapshot.vocal?.[key] || 0), 0);
  const total = motor + vocal;
  const global = total + Number(snapshot.impairment || 0);
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
      motor,
      vocal,
      total: dayLogs.length,
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
