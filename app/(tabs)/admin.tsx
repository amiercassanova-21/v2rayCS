import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { startOAuthLogin } from "@/constants/oauth";
import { trpc } from "@/lib/trpc";
import { useV2rayCS } from "@/features/app/AppProvider";
import { Button, C, Card, LoadingBlock, ScreenFrame, TextField } from "@/components/v2raycs/ui";
import { ConfirmDialog } from "@/components/v2raycs/ProfileEditor";

export default function AdminScreen() {
  const access = trpc.admin.access.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const { settings, setDisplayName, addCustomProtocol, removeCustomProtocol } = useV2rayCS();
  const [name, setName] = useState(settings.displayName);
  const [protocolName, setProtocolName] = useState("");
  const [scheme, setScheme] = useState("");
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loginError, setLoginError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const errorCode = (access.error as { data?: { code?: string } } | null)?.data?.code;
  const isAdmin = Boolean(access.data?.allowed);

  const login = async () => {
    try {
      setLoginError("");
      await startOAuthLogin();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Login tidak dapat dimulai.");
    }
  };

  const saveName = () => {
    const clean = name.trim();
    if (!clean) {
      setFeedback("Nama tampilan tidak boleh kosong.");
      return;
    }
    setDisplayName(clean);
    setFeedback("Nama tampilan tersimpan lokal di perangkat ini.");
  };

  const saveProtocol = () => {
    const cleanName = protocolName.trim();
    const cleanScheme = scheme.trim().toLowerCase().replace(/[^a-z0-9+.-]/g, "");
    if (!cleanName || !cleanScheme) {
      setFeedback("Nama protokol dan skema wajib diisi.");
      return;
    }
    addCustomProtocol(cleanName, cleanScheme, note);
    setProtocolName("");
    setScheme("");
    setNote("");
    setFeedback("Definisi ditambahkan. Adapter koneksi native belum tersedia.");
  };

  return (
    <ScreenFrame title="Panel Admin" subtitle="Akses istimewa diverifikasi oleh server.">
      {access.isLoading ? <LoadingBlock label="Memeriksa hak akses admin…" /> : null}
      {!isAdmin && !access.isLoading ? (
        <Card style={styles.lockedCard}>
          <View style={styles.lockIcon}><Ionicons name="lock-closed-outline" size={24} color={C.amber} /></View>
          <Text style={styles.lockTitle}>{errorCode === "FORBIDDEN" ? "Akun ini bukan admin" : errorCode === "UNAUTHORIZED" ? "Masuk untuk memeriksa akses" : "Panel belum dapat dibuka"}</Text>
          <Text style={styles.lockText}>{errorCode === "FORBIDDEN" ? "Gunakan akun yang role-nya ditetapkan admin di server. Perubahan role tidak dapat dilakukan dari aplikasi." : errorCode === "UNAUTHORIZED" ? "Login menggunakan akun Manus. Pemilik proyek dapat diberi role admin oleh aturan server starter." : access.error?.message || "Periksa koneksi API lalu coba lagi."}</Text>
          {errorCode === "UNAUTHORIZED" ? <Button label="Masuk dengan Manus" onPress={() => void login()} icon={<Ionicons name="log-in-outline" size={18} color={C.bg} />} /> : <Button label="Coba lagi" variant="secondary" onPress={() => void access.refetch()} icon={<Ionicons name="refresh" size={16} color={C.text} />} />}
          {loginError ? <Text style={styles.error}>{loginError}</Text> : null}
        </Card>
      ) : null}
      {isAdmin ? (
        <>
          <Card style={styles.accessCard}>
            <View style={styles.accessIcon}><Ionicons name="shield-checkmark" size={19} color={C.mint} /></View>
            <View style={styles.accessCopy}><Text style={styles.accessTitle}>Hak admin terverifikasi</Text><Text style={styles.accessSub}>Pemeriksaan dilakukan server-side.</Text></View>
            <View style={styles.onlineDot} />
          </Card>
          <Card>
            <View style={styles.cardHeading}>
              <View style={styles.cardIcon}><Ionicons name="brush-outline" size={17} color={C.cyan} /></View>
              <View style={styles.cardCopy}><Text style={styles.cardTitle}>Nama tampilan</Text><Text style={styles.cardSub}>Mengubah nama di dalam UI aplikasi.</Text></View>
            </View>
            <TextField label="NAMA APLIKASI" value={name} onChangeText={setName} placeholder="v2rayCS" autoCapitalize="words" maxLength={32} />
            <Button label="Simpan nama" compact onPress={saveName} icon={<Ionicons name="checkmark" size={17} color={C.bg} />} />
            <Text style={styles.helper}>Nama launcher native Android/iOS tetap sama sampai file app config diperbarui dan binary dibangun ulang.</Text>
          </Card>
          <Card>
            <View style={styles.cardHeading}>
              <View style={styles.cardIcon}><Ionicons name="git-branch-outline" size={17} color={C.cyan} /></View>
              <View style={styles.cardCopy}><Text style={styles.cardTitle}>Tambah protokol</Text><Text style={styles.cardSub}>Simpan definisi untuk ditampilkan pada daftar profil.</Text></View>
            </View>
            <TextField label="NAMA PROTOKOL" value={protocolName} onChangeText={setProtocolName} placeholder="Contoh: TUIC" autoCapitalize="words" />
            <TextField label="SKEMA URI" value={scheme} onChangeText={setScheme} placeholder="tuic" />
            <TextField label="CATATAN / FIELD KHUSUS" value={note} onChangeText={setNote} placeholder="Informasi manual untuk admin" multiline />
            <Button label="Tambah definisi" variant="secondary" compact onPress={saveProtocol} icon={<Ionicons name="add" size={17} color={C.text} />} />
            <Text style={styles.helper}>Mendaftarkan nama/skema tidak membuat adapter, parser, atau tunnel protokol baru.</Text>
          </Card>
          <Card style={styles.protocolCard}>
            <View style={styles.protocolHeading}><Text style={styles.cardTitle}>Protokol kustom</Text><Text style={styles.customCount}>{settings.customProtocols.length.toString().padStart(2, "0")}</Text></View>
            {settings.customProtocols.length ? settings.customProtocols.map((protocol) => (
              <View key={protocol.id} style={styles.protocolRow}>
                <View style={styles.protocolBadge}><Ionicons name="git-branch-outline" size={15} color={C.cyan} /></View>
                <View style={styles.cardCopy}><Text style={styles.protocolName}>{protocol.name}</Text><Text style={styles.protocolMeta}>{protocol.scheme}:// · metadata lokal</Text>{protocol.note ? <Text style={styles.protocolNote} numberOfLines={2}>{protocol.note}</Text> : null}</View>
                <Pressable onPress={() => setDeleteTarget(protocol.id)} style={styles.removeButton} accessibilityLabel={`Hapus ${protocol.name}`}><Ionicons name="trash-outline" size={16} color={C.red} /></Pressable>
              </View>
            )) : <Text style={styles.helper}>Belum ada definisi kustom. Protokol bawaan tetap tersedia pada editor profil.</Text>}
          </Card>
          {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
          <Card style={styles.warningCard}>
            <Ionicons name="warning-outline" size={18} color={C.amber} />
            <Text style={styles.warningText}>Pengaturan admin ini tersimpan lokal pada perangkat ini. Admin dapat mengedit tampilan dan metadata protokol; fitur tunnel memerlukan adapter native terpisah.</Text>
          </Card>
        </>
      ) : null}
      <ConfirmDialog visible={Boolean(deleteTarget)} title="Hapus definisi protokol?" message="Profil yang memakai definisi ini mungkin hanya menampilkan label umum setelah definisi dihapus." onCancel={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) removeCustomProtocol(deleteTarget); setDeleteTarget(null); }} />
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  lockedCard: { alignItems: "center", paddingHorizontal: 22, paddingVertical: 25 },
  lockIcon: { width: 58, height: 58, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: `${C.amber}12`, borderWidth: 1, borderColor: `${C.amber}36` },
  lockTitle: { color: C.text, fontSize: 18, fontWeight: "800", textAlign: "center" },
  lockText: { color: C.muted, fontSize: 12, lineHeight: 19, textAlign: "center" },
  error: { color: C.red, fontSize: 12 },
  accessCard: { flexDirection: "row", alignItems: "center", gap: 11, padding: 13, borderColor: `${C.mint}40`, backgroundColor: `${C.mint}08` },
  accessIcon: { width: 37, height: 37, borderRadius: 13, backgroundColor: `${C.mint}14`, alignItems: "center", justifyContent: "center" },
  accessCopy: { flex: 1, gap: 3 },
  accessTitle: { color: C.text, fontSize: 13, fontWeight: "800" },
  accessSub: { color: C.muted, fontSize: 10 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.mint },
  cardHeading: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardIcon: { width: 35, height: 35, borderRadius: 12, backgroundColor: `${C.cyan}12`, alignItems: "center", justifyContent: "center" },
  cardCopy: { flex: 1, gap: 3 },
  cardTitle: { color: C.text, fontSize: 14, fontWeight: "800" },
  cardSub: { color: C.muted, fontSize: 11, lineHeight: 16 },
  helper: { color: C.dim, fontSize: 11, lineHeight: 17 },
  protocolCard: { gap: 12 },
  protocolHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  customCount: { color: C.cyan, fontSize: 15, fontWeight: "800", fontVariant: ["tabular-nums"] },
  protocolRow: { flexDirection: "row", alignItems: "center", gap: 10, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 11 },
  protocolBadge: { width: 33, height: 33, borderRadius: 11, backgroundColor: `${C.cyan}12`, alignItems: "center", justifyContent: "center" },
  protocolName: { color: C.text, fontSize: 12, fontWeight: "700" },
  protocolMeta: { color: C.cyan, fontSize: 10 },
  protocolNote: { color: C.muted, fontSize: 10, lineHeight: 14 },
  removeButton: { width: 34, height: 34, borderRadius: 11, backgroundColor: `${C.red}10`, borderWidth: 1, borderColor: `${C.red}30`, alignItems: "center", justifyContent: "center" },
  feedback: { color: C.mint, fontSize: 12, lineHeight: 18 },
  warningCard: { flexDirection: "row", alignItems: "flex-start", gap: 9, borderColor: `${C.amber}35`, backgroundColor: `${C.amber}08`, padding: 13 },
  warningText: { flex: 1, color: C.amber, fontSize: 11, lineHeight: 17 },
});
