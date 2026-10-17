import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CORE_PROTOCOLS, makeEmptyProfile, parseProfileUri, validateProfile, type CustomProtocol, type Profile, type ProfileDraft, type ProtocolId } from "@/features/profiles/model";
import { Button, C, ChoiceChip, TextField } from "./ui";

export function ProfileEditor({
  visible,
  profile,
  customProtocols,
  onClose,
  onSave,
}: {
  visible: boolean;
  profile: Profile | null;
  customProtocols: CustomProtocol[];
  onClose: () => void;
  onSave: (draft: ProfileDraft, existing?: Profile) => void;
}) {
  const [draft, setDraft] = useState<ProfileDraft>(() => profile ? {
    name: profile.name,
    protocolId: profile.protocolId,
    server: profile.server,
    port: profile.port,
    uuid: profile.uuid,
    password: profile.password,
    cipher: profile.cipher,
    security: profile.security,
    sni: profile.sni,
    publicKey: profile.publicKey,
    shortId: profile.shortId,
    network: profile.network,
    flow: profile.flow,
    obfs: profile.obfs,
    obfsPassword: profile.obfsPassword,
    upMbps: profile.upMbps,
    downMbps: profile.downMbps,
  } : makeEmptyProfile());
  const [importUri, setImportUri] = useState("");
  const [error, setError] = useState("");
  const allProtocols = useMemo(() => [
    ...CORE_PROTOCOLS.map((protocol) => ({ id: protocol.id as ProtocolId, name: protocol.label })),
    ...customProtocols.map((protocol) => ({ id: protocol.id as ProtocolId, name: protocol.name })),
  ], [customProtocols]);

  const change = (key: keyof ProfileDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const isHysteria = draft.protocolId === "hysteria2";
  const usesUuid = draft.protocolId === "vmess" || draft.protocolId === "vless";
  const usesPassword = draft.protocolId === "trojan" || draft.protocolId === "shadowsocks" || isHysteria || String(draft.protocolId).startsWith("custom-");

  const importLink = () => {
    try {
      const parsed = parseProfileUri(importUri);
      setDraft(parsed);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Tautan tidak dapat dibaca.");
    }
  };

  const save = () => {
    const validationError = validateProfile(draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSave({ ...draft, name: draft.name.trim(), server: draft.server.trim(), port: String(Number(draft.port)) }, profile ?? undefined);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.kicker}>{profile ? "EDIT PROFIL" : "PROFIL BARU"}</Text>
                <Text style={styles.sheetTitle}>{profile ? "Perbarui koneksi" : "Tambah profil"}</Text>
              </View>
              <Pressable onPress={onClose} style={styles.close} accessibilityLabel="Tutup editor">
                <Ionicons name="close" size={21} color={C.text} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
              {!profile ? (
                <>
                  <TextField label="Tempel tautan konfigurasi" value={importUri} onChangeText={setImportUri} placeholder="vless://… atau hysteria2://…" autoCapitalize="none" />
                  <Button label="Baca tautan" variant="secondary" compact onPress={importLink} icon={<Ionicons name="download-outline" size={16} color={C.cyan} />} />
                </>
              ) : null}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>PROTOKOL</Text>
                <View style={styles.chips}>
                  {allProtocols.map((protocol) => (
                    <ChoiceChip key={protocol.id} label={protocol.name} selected={draft.protocolId === protocol.id} onPress={() => setDraft((current) => ({ ...current, protocolId: protocol.id, cipher: protocol.id === "shadowsocks" ? current.cipher || "aes-128-gcm" : current.cipher, security: protocol.id === "trojan" || protocol.id === "hysteria2" ? "tls" : current.security }))} />
                  ))}
                </View>
                {String(draft.protocolId).startsWith("custom-") ? <Text style={styles.hint}>Definisi kustom hanya menyimpan metadata; adapter koneksi belum tersedia.</Text> : null}
              </View>
              <TextField label="Nama profil" value={draft.name} onChangeText={(value) => change("name", value)} placeholder="Contoh: Server kantor" autoCapitalize="sentences" />
              <View style={styles.inlineFields}>
                <View style={styles.grow}><TextField label="Server / host" value={draft.server} onChangeText={(value) => change("server", value)} placeholder="vpn.example.net" /></View>
                <View style={styles.port}><TextField label="Port" value={draft.port} onChangeText={(value) => change("port", value.replace(/[^0-9]/g, ""))} placeholder="443" keyboardType="number-pad" /></View>
              </View>
              {usesUuid ? <TextField label="UUID" value={draft.uuid} onChangeText={(value) => change("uuid", value)} placeholder="UUID dari penyedia server" secureTextEntry /> : null}
              {usesPassword ? <TextField label={isHysteria ? "Kata sandi / auth" : "Password / secret"} value={draft.password} onChangeText={(value) => change("password", value)} placeholder="Kredensial profil" secureTextEntry /> : null}
              {draft.protocolId === "shadowsocks" ? <TextField label="Metode enkripsi / cipher" value={draft.cipher} onChangeText={(value) => change("cipher", value)} placeholder="aes-128-gcm" /> : null}
              {draft.protocolId === "vless" ? <TextField label="Flow (opsional)" value={draft.flow} onChangeText={(value) => change("flow", value)} placeholder="xtls-rprx-vision" /> : null}
              {draft.protocolId === "vless" || draft.protocolId === "vmess" || isHysteria ? <TextField label="SNI / server name" value={draft.sni} onChangeText={(value) => change("sni", value)} placeholder="domain.example.net" /> : null}
              {draft.protocolId === "vless" || draft.protocolId === "vmess" || draft.protocolId === "trojan" ? (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>KEAMANAN</Text>
                  <View style={styles.chips}>
                    <ChoiceChip label="Tanpa TLS" selected={draft.security === "none"} onPress={() => change("security", "none")} />
                    <ChoiceChip label="TLS" selected={draft.security === "tls"} onPress={() => change("security", "tls")} />
                    {(draft.protocolId === "vless" || draft.protocolId === "vmess") ? <ChoiceChip label="REALITY" selected={draft.security === "reality"} onPress={() => change("security", "reality")} /> : null}
                  </View>
                </View>
              ) : null}
              {(draft.protocolId === "vless" || draft.protocolId === "vmess") && draft.security === "reality" ? <TextField label="Public key REALITY" value={draft.publicKey} onChangeText={(value) => change("publicKey", value)} placeholder="Public key" secureTextEntry /> : null}
              {(draft.protocolId === "vless" || draft.protocolId === "vmess") && draft.security === "reality" ? <TextField label="Short ID REALITY" value={draft.shortId} onChangeText={(value) => change("shortId", value)} placeholder="Short ID" /> : null}
              {isHysteria ? (
                <>
                  <TextField label="Obfuscation" value={draft.obfs} onChangeText={(value) => change("obfs", value)} placeholder="salamander (opsional)" />
                  <TextField label="Kata sandi obfs" value={draft.obfsPassword} onChangeText={(value) => change("obfsPassword", value)} placeholder="Salamander password" secureTextEntry />
                  <View style={styles.inlineFields}>
                    <View style={styles.grow}><TextField label="Batas upload Mbps" value={draft.upMbps} onChangeText={(value) => change("upMbps", value.replace(/[^0-9.]/g, ""))} placeholder="100" keyboardType="decimal-pad" /></View>
                    <View style={styles.grow}><TextField label="Batas download Mbps" value={draft.downMbps} onChangeText={(value) => change("downMbps", value.replace(/[^0-9.]/g, ""))} placeholder="100" keyboardType="decimal-pad" /></View>
                  </View>
                </>
              ) : null}
              {draft.protocolId === "trojan" || draft.protocolId === "shadowsocks" ? <TextField label="SNI (opsional)" value={draft.sni} onChangeText={(value) => change("sni", value)} placeholder="domain.example.net" /> : null}
              {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
              <Text style={styles.privacy}>Profil disimpan lokal di perangkat. Jangan bagikan tautan atau ekspor yang berisi kredensial.</Text>
              <Button label={profile ? "Simpan perubahan" : "Simpan profil"} onPress={save} icon={<Ionicons name="checkmark" size={18} color={C.bg} />} />
              <Button label="Batal" variant="ghost" onPress={onClose} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Hapus",
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.confirmOverlay}>
        <View style={styles.confirmCard}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <Text style={styles.hint}>{message}</Text>
          <View style={styles.confirmButtons}>
            <Button label="Batal" variant="secondary" compact onPress={onCancel} />
            <Button label={confirmLabel} variant="danger" compact onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "flex-end" },
  keyboard: { width: "100%", maxHeight: "94%" },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1, borderColor: C.border, paddingHorizontal: 20, paddingTop: 19, paddingBottom: Platform.OS === "web" ? 20 : 30, maxHeight: "100%" },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 14 },
  kicker: { color: C.cyan, fontSize: 10, fontWeight: "800", letterSpacing: 1.6 },
  sheetTitle: { color: C.text, fontSize: 20, fontWeight: "800", marginTop: 4 },
  close: { width: 38, height: 38, borderRadius: 13, borderWidth: 1, borderColor: C.border, backgroundColor: C.raised, alignItems: "center", justifyContent: "center" },
  form: { gap: 14, paddingBottom: 20 },
  fieldGroup: { gap: 9 },
  label: { color: C.muted, fontSize: 11, fontWeight: "800", letterSpacing: 1.1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  hint: { color: C.muted, fontSize: 12, lineHeight: 18 },
  inlineFields: { flexDirection: "row", gap: 10 },
  grow: { flex: 1 },
  port: { width: 105 },
  error: { color: C.red, fontSize: 13, lineHeight: 18 },
  privacy: { color: C.amber, fontSize: 11, lineHeight: 17, paddingHorizontal: 2 },
  confirmOverlay: { flex: 1, padding: 22, backgroundColor: "rgba(0,0,0,0.72)", alignItems: "center", justifyContent: "center" },
  confirmCard: { width: "100%", maxWidth: 420, borderRadius: 22, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, padding: 20, gap: 14 },
  confirmButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 9, marginTop: 4 },
});
