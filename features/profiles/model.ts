export const CORE_PROTOCOLS = [
  { id: "vmess", label: "VMess" },
  { id: "vless", label: "VLESS" },
  { id: "trojan", label: "Trojan" },
  { id: "shadowsocks", label: "Shadowsocks" },
  { id: "hysteria2", label: "Hysteria2" },
] as const;

export type CoreProtocolId = (typeof CORE_PROTOCOLS)[number]["id"];
export type ProtocolId = CoreProtocolId | `custom-${string}`;
export type LogLevel = "info" | "warning" | "error";
export type ConnectionState = "disconnected" | "connecting" | "connected";

export type CustomProtocol = {
  id: `custom-${string}`;
  name: string;
  scheme: string;
  note: string;
};

export type Profile = {
  id: string;
  name: string;
  protocolId: ProtocolId;
  server: string;
  port: string;
  uuid: string;
  password: string;
  cipher: string;
  security: "none" | "tls" | "reality";
  sni: string;
  publicKey: string;
  shortId: string;
  network: string;
  flow: string;
  obfs: string;
  obfsPassword: string;
  upMbps: string;
  downMbps: string;
  createdAt: string;
  updatedAt: string;
};

export type ProfileDraft = Omit<Profile, "id" | "createdAt" | "updatedAt">;

export type AppLog = {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source: "app-simulation";
};

export type AppSettings = {
  displayName: string;
  customProtocols: CustomProtocol[];
};

export const DEFAULT_SETTINGS: AppSettings = {
  displayName: "v2rayCS",
  customProtocols: [],
};

export function makeEmptyProfile(protocolId: ProtocolId = "vless"): ProfileDraft {
  return {
    name: "",
    protocolId,
    server: "",
    port: protocolId === "hysteria2" ? "443" : "",
    uuid: "",
    password: "",
    cipher: protocolId === "shadowsocks" ? "aes-128-gcm" : "",
    security: protocolId === "hysteria2" || protocolId === "trojan" ? "tls" : "none",
    sni: "",
    publicKey: "",
    shortId: "",
    network: "tcp",
    flow: "",
    obfs: "",
    obfsPassword: "",
    upMbps: "",
    downMbps: "",
  };
}

export function getProtocolLabel(
  protocolId: ProtocolId,
  customProtocols: CustomProtocol[] = [],
): string {
  const builtin = CORE_PROTOCOLS.find((protocol) => protocol.id === protocolId);
  if (builtin) return builtin.label;
  return customProtocols.find((protocol) => protocol.id === protocolId)?.name ?? "Kustom";
}

export function validateProfile(profile: ProfileDraft): string | null {
  if (!profile.name.trim()) return "Nama profil wajib diisi.";
  if (!profile.server.trim()) return "Alamat server wajib diisi.";
  const port = Number(profile.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return "Port harus berupa angka antara 1 dan 65535.";
  }
  if ((profile.protocolId === "vmess" || profile.protocolId === "vless") && !profile.uuid.trim()) {
    return "UUID wajib diisi untuk VMess dan VLESS.";
  }
  if (
    (profile.protocolId === "trojan" || profile.protocolId === "shadowsocks" || profile.protocolId === "hysteria2") &&
    !profile.password.trim()
  ) {
    return "Kredensial/password wajib diisi untuk protokol ini.";
  }
  if (profile.protocolId === "shadowsocks" && !profile.cipher.trim()) {
    return "Metode enkripsi wajib diisi untuk Shadowsocks.";
  }
  return null;
}

function decodeBase64(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  if (typeof globalThis.atob === "function") return globalThis.atob(padded);
  const BufferImpl = (globalThis as typeof globalThis & {
    Buffer?: { from: (input: string, encoding: string) => { toString: (encoding: string) => string } };
  }).Buffer;
  if (BufferImpl) return BufferImpl.from(padded, "base64").toString("utf8");
  throw new Error("Decoder Base64 tidak tersedia pada perangkat ini.");
}

function makeId(): string {
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function fromUrl(input: string, protocolId: CoreProtocolId): ProfileDraft {
  const url = new URL(input);
  const name = decodeURIComponent(url.hash.replace(/^#/, "")) || url.hostname;
  let username = decodeURIComponent(url.username || "");
  let password = decodeURIComponent(protocolId === "shadowsocks" ? url.password || "" : url.password || url.username || "");
  let cipher = "";
  if (protocolId === "shadowsocks") {
    if (!password && username) {
      try {
        const decoded = decodeBase64(username);
        const separator = decoded.indexOf(":");
        if (separator > 0) {
          cipher = decoded.slice(0, separator);
          password = decoded.slice(separator + 1);
        }
      } catch {
        // Keep parsing other standard SS URI variants below.
      }
    } else {
      cipher = username;
    }
  }
  const query = url.searchParams;
  const security = query.get("security");
  return {
    ...makeEmptyProfile(protocolId),
    name,
    server: url.hostname,
    port: url.port || "443",
    uuid: protocolId === "vless" || protocolId === "vmess" ? username : "",
    password,
    cipher: cipher || query.get("method") || query.get("encryption") || "",
    security: security === "reality" ? "reality" : security === "tls" || protocolId === "hysteria2" || protocolId === "trojan" ? "tls" : "none",
    sni: query.get("sni") || query.get("peer") || "",
    publicKey: query.get("pbk") || query.get("publicKey") || "",
    shortId: query.get("sid") || query.get("shortId") || "",
    network: query.get("type") || "tcp",
    flow: query.get("flow") || "",
    obfs: query.get("obfs") || "",
    obfsPassword: query.get("obfs-password") || query.get("obfsPassword") || "",
    upMbps: query.get("upmbps") || "",
    downMbps: query.get("downmbps") || "",
  };
}

export function parseProfileUri(value: string): ProfileDraft {
  const input = value.trim();
  const scheme = input.slice(0, input.indexOf(":")).toLowerCase();
  if (scheme === "vmess") {
    const encoded = input.slice(input.indexOf(":") + 1).replace(/^\/\//, "");
    const config = JSON.parse(decodeBase64(encoded)) as Record<string, unknown>;
    const security = String(config.tls || config.security || "");
    return {
      ...makeEmptyProfile("vmess"),
      name: String(config.ps || config.remarks || config.add || "VMess profile"),
      server: String(config.add || ""),
      port: String(config.port || ""),
      uuid: String(config.id || ""),
      sni: String(config.sni || config.host || ""),
      security: security === "reality" ? "reality" : security === "tls" ? "tls" : "none",
      network: String(config.net || "tcp"),
      flow: String(config.flow || ""),
    };
  }
  const supported: Record<string, CoreProtocolId> = {
    vless: "vless",
    trojan: "trojan",
    ss: "shadowsocks",
    shadowsocks: "shadowsocks",
    hysteria2: "hysteria2",
    hy2: "hysteria2",
  };
  const protocol = supported[scheme];
  if (!protocol) throw new Error("Skema tautan belum didukung.");
  return fromUrl(input, protocol);
}

export function createProfile(draft: ProfileDraft, existing?: Profile): Profile {
  const now = new Date().toISOString();
  return {
    ...draft,
    id: existing?.id ?? makeId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function profileAddress(profile: Profile): string {
  return `${profile.server}:${profile.port}`;
}
