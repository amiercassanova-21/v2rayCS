import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useV2rayCS } from "@/features/app/AppProvider";
import { Button, C, Card, Pill, ScreenFrame } from "@/components/v2raycs/ui";

function SettingRow({ icon, title, value, onPress, tone = C.cyan }: { icon: keyof typeof Ionicons.glyphMap; title: string; value: string; onPress?: () => void; tone?: string }) {
  const content = (
    <>
      <View style={[styles.rowIcon, { backgroundColor: `${tone}12` }]}><Ionicons name={icon} size={18} color={tone} /></View>
      <View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowValue}>{value}</Text></View>
      {onPress ? <Ionicons name="chevron-forward" size={17} color={C.dim} /> : null}
    </>
  );
  return onPress ? <Pressable onPress={onPress} style={styles.settingRow}>{content}</Pressable> : <View style={styles.settingRow}>{content}</View>;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { settings } = useV2rayCS();
  return (
    <ScreenFrame title="Pengaturan" subtitle="Preferensi aplikasi dan informasi proyek.">
      <Card style={styles.identityCard}>
        <View style={styles.identityTop}>
          <View style={styles.appMark}><Ionicons name="git-network-outline" size={22} color={C.cyan} /></View>
          <View style={styles.identityCopy}>
            <Text style={styles.appName}>{settings.displayName}</Text>
            <Text style={styles.appVersion}>MOBILE CLIENT · BUILD PROTOTIPE</Text>
          </View>
          <Pill label="0.1.0" color={C.cyan} soft />
        </View>
        <Text style={styles.identityNote}>Nama tampilan dapat diubah admin di Panel Admin. Label launcher Android/iOS memerlukan perubahan app config dan rebuild binary.</Text>
      </Card>

      <Text style={styles.groupLabel}>ADMINISTRASI</Text>
      <Card style={styles.listCard}>
        <SettingRow icon="shield-checkmark-outline" title="Panel Admin" value="Akses dicek oleh server untuk akun admin" tone={C.amber} onPress={() => router.push("/(tabs)/admin" as never)} />
        <View style={styles.separator} />
        <SettingRow icon="layers-outline" title="Definisi protokol tambahan" value={`${settings.customProtocols.length} protokol kustom · UI saja`} onPress={() => router.push("/(tabs)/admin" as never)} />
      </Card>

      <Text style={styles.groupLabel}>PRIVASI & STATUS</Text>
      <Card style={styles.listCard}>
        <SettingRow icon="phone-portrait-outline" title="Penyimpanan profil" value="Lokal pada perangkat ini" />
        <View style={styles.separator} />
        <SettingRow icon="pulse-outline" title="Runtime koneksi" value="Belum terintegrasi · simulasi UI" tone={C.amber} />
        <View style={styles.separator} />
        <SettingRow icon="logo-github" title="Repositori kode" value="Mobile WebDev · kanonis dikelola Manus" />
      </Card>

      <Card style={styles.limitationCard}>
        <View style={styles.limitationTitleRow}><Ionicons name="information-circle-outline" size={19} color={C.amber} /><Text style={styles.limitationTitle}>Perlu diketahui</Text></View>
        <Text style={styles.limitationText}>v2rayCS saat ini adalah antarmuka pengelola profil dan demonstrasi. Tunnel VPN memerlukan Android VpnService, runtime Xray/Hysteria2 native, development build, konfigurasi izin, dan pengujian di perangkat nyata.</Text>
      </Card>
      <Button label="Buka panel admin" variant="secondary" onPress={() => router.push("/(tabs)/admin" as never)} icon={<Ionicons name="settings-outline" size={16} color={C.text} />} />
      <Text style={styles.footer}>v2rayCS · proyek terinspirasi dari daftar fitur Xelvra. Tidak ada kode atau tangkapan layar Xelvra yang disalin ke UI ini.</Text>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  identityCard: { gap: 12, borderColor: `${C.cyan}45` },
  identityTop: { flexDirection: "row", alignItems: "center", gap: 11 },
  appMark: { width: 46, height: 46, borderRadius: 15, backgroundColor: `${C.cyan}13`, borderWidth: 1, borderColor: `${C.cyan}42`, alignItems: "center", justifyContent: "center" },
  identityCopy: { flex: 1, gap: 4 },
  appName: { color: C.text, fontSize: 17, fontWeight: "800" },
  appVersion: { color: C.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  identityNote: { color: C.muted, fontSize: 11, lineHeight: 17 },
  groupLabel: { color: C.dim, fontSize: 10, fontWeight: "800", letterSpacing: 1.3, marginBottom: -10 },
  listCard: { paddingVertical: 4, gap: 0 },
  settingRow: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 10 },
  rowIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowCopy: { flex: 1, gap: 4 },
  rowTitle: { color: C.text, fontSize: 13, fontWeight: "700" },
  rowValue: { color: C.muted, fontSize: 10, lineHeight: 15 },
  separator: { height: 1, backgroundColor: C.border, marginLeft: 47 },
  limitationCard: { borderColor: `${C.amber}35`, backgroundColor: `${C.amber}08` },
  limitationTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  limitationTitle: { color: C.text, fontSize: 13, fontWeight: "800" },
  limitationText: { color: C.muted, fontSize: 12, lineHeight: 19 },
  footer: { color: C.dim, fontSize: 10, lineHeight: 16, textAlign: "center", paddingHorizontal: 12 },
});
