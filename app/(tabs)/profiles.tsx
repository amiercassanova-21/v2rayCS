import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useV2rayCS } from "@/features/app/AppProvider";
import { createProfile, getProtocolLabel, profileAddress, type Profile } from "@/features/profiles/model";
import { Button, C, Card, Pill, ScreenFrame, SectionTitle } from "@/components/v2raycs/ui";
import { ConfirmDialog, ProfileEditor } from "@/components/v2raycs/ProfileEditor";

export default function ProfilesScreen() {
  const { profiles, settings, activeProfileId, addProfile, updateProfile, removeProfile, selectProfile } = useV2rayCS();
  const [search, setSearch] = useState("");
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState<Profile | null>(null);
  const filteredProfiles = useMemo(() => profiles.filter((profile) => {
    const needle = search.trim().toLowerCase();
    return !needle || `${profile.name} ${profile.server} ${profile.protocolId}`.toLowerCase().includes(needle);
  }), [profiles, search]);

  const openCreate = () => { setEditing(null); setEditorKey((current) => current + 1); setEditorVisible(true); };
  const openEdit = (profile: Profile) => { setEditing(profile); setEditorKey((current) => current + 1); setEditorVisible(true); };
  const save = (draft: Parameters<typeof createProfile>[0], existing?: Profile) => {
    const profile = createProfile(draft, existing);
    if (existing) updateProfile(profile);
    else addProfile(profile);
    setEditorVisible(false);
    setEditing(null);
  };

  return (
    <ScreenFrame title="Profil" subtitle="Simpan dan pilih konfigurasi secara lokal.">
      <View style={styles.headerRow}>
        <View style={styles.countBlock}>
          <Text style={styles.count}>{profiles.length.toString().padStart(2, "0")}</Text>
          <Text style={styles.countLabel}>PROFIL</Text>
        </View>
        <Button label="Tambah profil" compact onPress={openCreate} icon={<Ionicons name="add" size={18} color={C.bg} />} />
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={17} color={C.dim} />
        <TextInput value={search} onChangeText={setSearch} placeholder="Cari nama, server, protokol…" placeholderTextColor={C.dim} style={styles.searchInput} autoCapitalize="none" />
        {search ? <Pressable onPress={() => setSearch("")}><Ionicons name="close-circle" size={17} color={C.muted} /></Pressable> : null}
      </View>
      <SectionTitle title="Konfigurasi tersimpan" action={<Pill label="LOKAL" color={C.cyan} soft />} />
      {filteredProfiles.length ? filteredProfiles.map((profile) => {
        const selected = activeProfileId === profile.id;
        return (
          <Card key={profile.id} style={[styles.profileCard, selected && styles.selectedCard]}>
            <Pressable onPress={() => selectProfile(profile.id)} style={styles.profileTop}>
              <View style={[styles.protocolIcon, selected && styles.protocolIconSelected]}><Ionicons name="git-network-outline" size={19} color={selected ? C.cyan : C.muted} /></View>
              <View style={styles.profileCopy}>
                <Text style={styles.profileName} numberOfLines={1}>{profile.name}</Text>
                <Text style={styles.profileHost} numberOfLines={1}>{profileAddress(profile)}</Text>
              </View>
              {selected ? <Pill label="AKTIF" color={C.mint} soft /> : <Pill label="TERSIMPAN" color={C.muted} />}
            </Pressable>
            <View style={styles.cardFooter}>
              <View style={styles.footerMeta}>
                <Text style={styles.protocolName}>{getProtocolLabel(profile.protocolId, settings.customProtocols)}</Text>
                <Text style={styles.metaSeparator}>·</Text>
                <Text style={styles.metaText}>{profile.sni || "SNI tidak diatur"}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => openEdit(profile)} style={styles.iconAction} accessibilityLabel={`Edit ${profile.name}`}><Ionicons name="create-outline" size={17} color={C.cyan} /></Pressable>
                <Pressable onPress={() => setDeleting(profile)} style={styles.iconAction} accessibilityLabel={`Hapus ${profile.name}`}><Ionicons name="trash-outline" size={16} color={C.red} /></Pressable>
              </View>
            </View>
          </Card>
        );
      }) : (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyIcon}><Ionicons name={search ? "search-outline" : "server-outline"} size={24} color={C.cyan} /></View>
          <Text style={styles.emptyTitle}>{search ? "Tidak ada hasil" : "Belum ada profil"}</Text>
          <Text style={styles.emptyCopy}>{search ? "Ubah kata pencarian dan coba lagi." : "Tambahkan server VMess, VLESS, Trojan, Shadowsocks, atau Hysteria2 untuk mulai mengelola konfigurasi."}</Text>
          {!search ? <Button label="Buat profil pertama" compact onPress={openCreate} icon={<Ionicons name="add" size={17} color={C.bg} />} /> : null}
        </Card>
      )}
      <Card style={styles.securityNote}>
        <Ionicons name="shield-checkmark-outline" size={18} color={C.amber} />
        <Text style={styles.securityText}>Profil tersimpan pada perangkat ini. Ekspor atau bagikan konfigurasi hanya jika Anda memahami bahwa tautan dapat berisi kredensial.</Text>
      </Card>
      <ProfileEditor key={editorKey} visible={editorVisible} profile={editing} customProtocols={settings.customProtocols} onClose={() => setEditorVisible(false)} onSave={save} />
      <ConfirmDialog visible={Boolean(deleting)} title="Hapus profil?" message={deleting ? `“${deleting.name}” akan dihapus dari penyimpanan lokal perangkat.` : ""} onCancel={() => setDeleting(null)} onConfirm={() => { if (deleting) removeProfile(deleting.id); setDeleting(null); }} />
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  countBlock: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  count: { color: C.cyan, fontSize: 29, fontWeight: "800", fontVariant: ["tabular-nums"] },
  countLabel: { color: C.muted, fontSize: 10, letterSpacing: 1.4, fontWeight: "800" },
  searchBox: { minHeight: 48, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 15, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 13 },
  searchInput: { flex: 1, color: C.text, fontSize: 13, paddingVertical: 10, outlineStyle: "none" as never },
  profileCard: { padding: 14, gap: 13 },
  selectedCard: { borderColor: `${C.cyan}90`, backgroundColor: "#102330" },
  profileTop: { flexDirection: "row", alignItems: "center", gap: 11 },
  protocolIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: C.raised, alignItems: "center", justifyContent: "center" },
  protocolIconSelected: { backgroundColor: `${C.cyan}16` },
  profileCopy: { flex: 1, gap: 4 },
  profileName: { color: C.text, fontSize: 14, fontWeight: "700" },
  profileHost: { color: C.muted, fontSize: 11 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.border, paddingTop: 9 },
  footerMeta: { flexDirection: "row", alignItems: "center", gap: 7, flex: 1 },
  protocolName: { color: C.cyan, fontSize: 10, fontWeight: "800", letterSpacing: 0.4 },
  metaSeparator: { color: C.dim },
  metaText: { color: C.dim, fontSize: 10, flexShrink: 1 },
  actions: { flexDirection: "row", gap: 6 },
  iconAction: { width: 33, height: 33, borderRadius: 11, backgroundColor: C.raised, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" },
  emptyCard: { alignItems: "center", paddingHorizontal: 25, paddingVertical: 27 },
  emptyIcon: { width: 54, height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: `${C.cyan}12`, marginBottom: 3 },
  emptyTitle: { color: C.text, fontSize: 17, fontWeight: "800" },
  emptyCopy: { color: C.muted, fontSize: 12, lineHeight: 19, textAlign: "center", marginBottom: 3 },
  securityNote: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 13, backgroundColor: `${C.amber}08`, borderColor: `${C.amber}30` },
  securityText: { color: C.muted, fontSize: 11, lineHeight: 17, flex: 1 },
});
