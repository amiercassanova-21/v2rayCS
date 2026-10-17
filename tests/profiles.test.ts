import { describe, expect, it } from "vitest";
import { makeEmptyProfile, parseProfileUri, validateProfile } from "../features/profiles/model";

describe("profile validation", () => {
  it("requires a valid host, port, and UUID for VLESS", () => {
    const profile = { ...makeEmptyProfile("vless"), name: "Lab", server: "vpn.example.net", port: "443" };
    expect(validateProfile(profile)).toBe("UUID wajib diisi untuk VMess dan VLESS.");
    expect(validateProfile({ ...profile, uuid: "00000000-0000-4000-8000-000000000001" })).toBeNull();
  });

  it("requires a Shadowsocks cipher and password", () => {
    const profile = { ...makeEmptyProfile("shadowsocks"), name: "Lab", server: "ss.example.net", port: "8388", password: "secret", cipher: "" };
    expect(validateProfile(profile)).toBe("Metode enkripsi wajib diisi untuk Shadowsocks.");
  });

  it("rejects an out-of-range port", () => {
    const profile = { ...makeEmptyProfile("hysteria2"), name: "Lab", server: "hy.example.net", port: "70000", password: "secret" };
    expect(validateProfile(profile)).toBe("Port harus berupa angka antara 1 dan 65535.");
  });
});

describe("profile URI parsing", () => {
  it("parses the Hysteria2 auth, SNI, and Salamander settings", () => {
    const profile = parseProfileUri("hysteria2://secret@hy.example.net:8443/?sni=cdn.example.net&obfs=salamander&obfs-password=hide#Tokyo");
    expect(profile.protocolId).toBe("hysteria2");
    expect(profile.name).toBe("Tokyo");
    expect(profile.server).toBe("hy.example.net");
    expect(profile.port).toBe("8443");
    expect(profile.password).toBe("secret");
    expect(profile.sni).toBe("cdn.example.net");
    expect(profile.obfs).toBe("salamander");
    expect(profile.obfsPassword).toBe("hide");
  });

  it("parses VLESS credentials and REALITY parameters", () => {
    const profile = parseProfileUri("vless://user-id@edge.example.net:443?security=reality&sni=site.example.net&pbk=pub&sid=short&flow=xtls-rprx-vision#Edge");
    expect(profile.protocolId).toBe("vless");
    expect(profile.uuid).toBe("user-id");
    expect(profile.security).toBe("reality");
    expect(profile.publicKey).toBe("pub");
    expect(profile.shortId).toBe("short");
    expect(profile.flow).toBe("xtls-rprx-vision");
  });

  it("parses the legacy base64 userinfo form of a Shadowsocks URI", () => {
    const profile = parseProfileUri("ss://YWVzLTEyOC1nY206c2VjcmV0@ss.example.net:8388#Tokyo");
    expect(profile.protocolId).toBe("shadowsocks");
    expect(profile.cipher).toBe("aes-128-gcm");
    expect(profile.password).toBe("secret");
    expect(profile.port).toBe("8388");
  });

  it("rejects unknown URI schemes", () => {
    expect(() => parseProfileUri("ftp://example.net:21")).toThrow("Skema tautan belum didukung.");
  });
});
