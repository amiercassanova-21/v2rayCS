import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { connectionAdapter } from "@/features/connection/adapter";
import {
  DEFAULT_SETTINGS,
  type AppLog,
  type AppSettings,
  type ConnectionState,
  type CustomProtocol,
  type LogLevel,
  type Profile,
  type ProfileDraft,
} from "@/features/profiles/model";
import { localStore } from "@/features/profiles/storage";

const ACTIVE_PROFILE_KEY = "v2raycs.activeProfile.v1";

type AppContextValue = {
  ready: boolean;
  profiles: Profile[];
  settings: AppSettings;
  logs: AppLog[];
  activeProfile: Profile | null;
  activeProfileId: string | null;
  connectionState: ConnectionState;
  elapsedSeconds: number;
  addProfile: (profile: Profile) => void;
  updateProfile: (profile: Profile) => void;
  removeProfile: (id: string) => void;
  selectProfile: (id: string | null) => void;
  setDisplayName: (name: string) => void;
  addCustomProtocol: (name: string, scheme: string, note: string) => string;
  removeCustomProtocol: (id: string) => void;
  toggleConnection: () => Promise<void>;
  addLog: (message: string, level?: LogLevel) => void;
  clearLogs: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function logRecord(message: string, level: LogLevel = "info"): AppLog {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    level,
    message,
    source: "app-simulation",
  };
}

export function V2rayCSProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [logs, setLogs] = useState<AppLog[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const connectedAt = useRef<number | null>(null);
  const connectSequence = useRef(0);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      localStore.loadProfiles(),
      localStore.loadLogs(),
      localStore.loadSettings(),
      AsyncStorage.getItem(ACTIVE_PROFILE_KEY),
    ]).then(([loadedProfiles, loadedLogs, loadedSettings, activeId]) => {
      if (!mounted) return;
      setProfiles(loadedProfiles);
      setLogs(loadedLogs);
      setSettings(loadedSettings);
      setActiveProfileId(loadedProfiles.some((profile) => profile.id === activeId) ? activeId : null);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void localStore.saveProfiles(profiles);
  }, [profiles, ready]);

  useEffect(() => {
    if (!ready) return;
    void localStore.saveLogs(logs);
  }, [logs, ready]);

  useEffect(() => {
    if (!ready) return;
    void localStore.saveSettings(settings);
  }, [settings, ready]);

  useEffect(() => {
    if (!ready) return;
    if (activeProfileId) void AsyncStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
    else void AsyncStorage.removeItem(ACTIVE_PROFILE_KEY);
  }, [activeProfileId, ready]);

  useEffect(() => {
    if (connectionState !== "connected") return;
    const timer = setInterval(() => {
      if (connectedAt.current) setElapsedSeconds(Math.floor((Date.now() - connectedAt.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [connectionState]);

  const addLog = useCallback((message: string, level: LogLevel = "info") => {
    setLogs((current) => [logRecord(message, level), ...current].slice(0, 300));
  }, []);

  const addProfile = useCallback((profile: Profile) => {
    setProfiles((current) => [profile, ...current]);
    setActiveProfileId((current) => current ?? profile.id);
    addLog(`Profil ${profile.name} ditambahkan.`);
  }, [addLog]);

  const updateProfile = useCallback((updated: Profile) => {
    setProfiles((current) => current.map((profile) => profile.id === updated.id ? updated : profile));
    addLog(`Profil ${updated.name} diperbarui.`);
  }, [addLog]);

  const removeProfile = useCallback((id: string) => {
    const target = profiles.find((profile) => profile.id === id);
    setProfiles((current) => current.filter((profile) => profile.id !== id));
    setActiveProfileId((current) => current === id ? null : current);
    if (activeProfileId === id && connectionState !== "disconnected") {
      connectSequence.current += 1;
      void connectionAdapter.disconnect();
      setConnectionState("disconnected");
      connectedAt.current = null;
      setElapsedSeconds(0);
    }
    if (target) addLog(`Profil ${target.name} dihapus.`, "warning");
  }, [activeProfileId, addLog, connectionState, profiles]);

  const selectProfile = useCallback((id: string | null) => {
    setActiveProfileId(id);
    const target = profiles.find((profile) => profile.id === id);
    if (target) addLog(`Profil aktif diubah ke ${target.name}.`);
  }, [addLog, profiles]);

  const setDisplayName = useCallback((name: string) => {
    const displayName = name.trim().slice(0, 32) || "v2rayCS";
    setSettings((current) => ({ ...current, displayName }));
    addLog(`Nama tampilan diubah menjadi ${displayName}.`);
  }, [addLog]);

  const addCustomProtocol = useCallback((name: string, scheme: string, note: string) => {
    const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "custom";
    const duplicate = settings.customProtocols.some((item) => item.id === `custom-${base}`);
    const id: `custom-${string}` = duplicate ? `custom-${base}-${Date.now().toString(36)}` : `custom-${base}`;
    const protocol: CustomProtocol = { id, name: name.trim(), scheme: scheme.trim().toLowerCase(), note: note.trim() };
    setSettings((current) => ({ ...current, customProtocols: [...current.customProtocols, protocol] }));
    addLog(`Definisi protokol ${name.trim()} ditambahkan.`, "warning");
    return id;
  }, [addLog, settings.customProtocols]);

  const removeCustomProtocol = useCallback((id: string) => {
    const target = settings.customProtocols.find((protocol) => protocol.id === id);
    setSettings((current) => ({ ...current, customProtocols: current.customProtocols.filter((protocol) => protocol.id !== id) }));
    if (target) addLog(`Definisi protokol ${target.name} dihapus.`, "warning");
  }, [addLog, settings.customProtocols]);

  const toggleConnection = useCallback(async () => {
    if (connectionState === "connecting" || connectionState === "connected") {
      connectSequence.current += 1;
      await connectionAdapter.disconnect();
      setConnectionState("disconnected");
      connectedAt.current = null;
      setElapsedSeconds(0);
      addLog("Simulasi koneksi dihentikan.");
      return;
    }
    const profile = profiles.find((item) => item.id === activeProfileId);
    if (!profile) {
      addLog("Pilih profil sebelum memulai simulasi.", "warning");
      return;
    }
    const sequence = ++connectSequence.current;
    setConnectionState("connecting");
    addLog(`Simulasi menghubungkan profil ${profile.name}.`);
    try {
      await connectionAdapter.connect(profile);
      if (connectSequence.current !== sequence) return;
      setConnectionState("connected");
      connectedAt.current = Date.now();
      setElapsedSeconds(0);
      addLog(`Simulasi ${profile.name} siap. Tidak ada tunnel VPN yang dibuat.`);
    } catch {
      if (connectSequence.current !== sequence) return;
      setConnectionState("disconnected");
      addLog("Simulasi koneksi gagal.", "error");
    }
  }, [activeProfileId, addLog, connectionState, profiles]);

  const clearLogs = useCallback(() => setLogs([]), []);
  const activeProfile = useMemo(() => profiles.find((profile) => profile.id === activeProfileId) ?? null, [profiles, activeProfileId]);

  const value = useMemo<AppContextValue>(() => ({
    ready,
    profiles,
    settings,
    logs,
    activeProfile,
    activeProfileId,
    connectionState,
    elapsedSeconds,
    addProfile,
    updateProfile,
    removeProfile,
    selectProfile,
    setDisplayName,
    addCustomProtocol,
    removeCustomProtocol,
    toggleConnection,
    addLog,
    clearLogs,
  }), [ready, profiles, settings, logs, activeProfile, activeProfileId, connectionState, elapsedSeconds, addProfile, updateProfile, removeProfile, selectProfile, setDisplayName, addCustomProtocol, removeCustomProtocol, toggleConnection, addLog, clearLogs]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useV2rayCS(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error("useV2rayCS harus digunakan di dalam V2rayCSProvider.");
  return value;
}
