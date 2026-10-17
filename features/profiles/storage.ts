import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_SETTINGS,
  type AppLog,
  type AppSettings,
  type Profile,
} from "./model";

const PROFILE_KEY = "v2raycs.profiles.v1";
const LOG_KEY = "v2raycs.logs.v1";
const SETTINGS_KEY = "v2raycs.settings.v1";

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const localStore = {
  loadProfiles: () => readJson<Profile[]>(PROFILE_KEY, []),
  saveProfiles: (profiles: Profile[]) => AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profiles)),
  loadLogs: () => readJson<AppLog[]>(LOG_KEY, []),
  saveLogs: (logs: AppLog[]) => AsyncStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, 300))),
  loadSettings: async (): Promise<AppSettings> => {
    const stored = await readJson<Partial<AppSettings>>(SETTINGS_KEY, {});
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      customProtocols: Array.isArray(stored.customProtocols) ? stored.customProtocols : [],
    };
  },
  saveSettings: (settings: AppSettings) => AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)),
};
