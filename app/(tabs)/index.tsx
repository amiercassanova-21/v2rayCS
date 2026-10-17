import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useV2rayCS } from "@/features/app/AppProvider";
import { getProtocolLabel, profileAddress } from "@/features/profiles/model";
import { Button, C, Card, Pill, ScreenFrame, SectionTitle } from "@/components/v2raycs/ui";

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { settings, profiles, activeProfile, connectionState, elapsedSeconds, toggleConnection, logs } = useV2rayCS();
  const isConnected = connectionState === "connected";
  const isConnecting = connectionState === "connecting";
  const statusColor = isConnected ? C.mint : isConnecting ? C.amber : C.muted;
  const stateLabel = isConnected ? "SIMULASI AKTIF" : isConnecting ? "MENGHUBUNGKAN" : "TERPUTUS";
  const transferIn = isConnected ? (elapsedSeconds * 0.021).toFixed(1) : "0.0";
  const transferOut = isConnected ? (elapsedSeconds * 0.008).toFixed(1) : "0.0";

  return (
    <ScreenFrame title={settings.displayName} subtitle="Kelola profil dan pantau status koneksi.">
      <View style={styles.topline}>
        <View style={styles.brandMark}><Ionicons name="git-network-outline" size={18} color={C.cyan} /></View>
        <Text style={styles.toplineText}>PRIVATE NETWORK CLIENT</Text>
        <Pill label="SIMULASI" color={C.amber} soft />
      </View>

      <Card style={styles.connectionCard}>
        <View style={styles.statusRow}>
          <View style={[styles.orbOuter, { borderColor: `${statusColor}55` }]}>
            <View style={[styles.orbMiddle, { borderColor: `${statusColor}66` }]}>
              <View style={[styles.orbCore, { backgroundColor: `${statusColor}20`, borderColor: `${statusColor}70` }]}>
                <Ionicons name={isConnected ? "radio" : isConnecting ? "sync" : "radio-outline"} size={29} color={statusColor} />
              </View>
            </View>
          </View>
          <View style={styles.statusCopy}>
            <Text style={styles.statusLabel}>{stateLabel}</Text>
            <Text style={styles.statusDescription}>
              {isConnected ? "UI demo berjalan — trafik tidak dirutekan." : isConnecting ? "Menyiapkan simulasi lokal…" : "Pilih profil untuk memulai simulasi."}
            </Text>
          </View>
        </View>
        <View style={styles.statusDivider} />
        {activeProfile ? (
          <View style={styles.profileLine}>
            <View style={styles.profileIcon}><Ionicons name="server-outline" size={16} color={C.cyan} /></View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>{activeProfile.name}</Text>
              <Text style={styles.profileAddress} numberOfLines={1}>{getProtocolLabel(activeProfile.protocolId, settings.customProtocols)} · {profileAddress(activeProfile)}</Text>
            </View>
            <Pressable onPress={() => router.push("/(tabs)/profiles" as never)} style={styles.smallAction} accessibilityLabel="Pilih profil lain">
              <Ionicons name="chevron-forward" size={18} color={C.muted} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => router.push("/(tabs)/profiles" as never)} style={styles.addProfileRow}>
            <View style={styles.profileIcon}><Ionicons name="add" size={19} color={C.cyan} /></View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Belum ada profil</Text>
              <Text style={styles.profileAddress}>Tambahkan konfigurasi untuk memulai</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={C.cyan} />
          </Pressable>
        )}
        <Button
          label={isConnected ? "Hentikan simulasi" : isConnecting ? "Batalkan" : "Mulai simulasi"}
          onPress={() => void toggleConnection()}
          disabled={!activeProfile && !isConnected && !isConnecting}
          variant={isConnected ? "secondary" : "primary"}
          icon={<Ionicons name={isConnected ? "stop" : "play"} size={17} color={isConnected ? C.text : C.bg} />}
        />
      </Card>

      <View style={styles.noteRow}>
        <Ionicons name="information-circle-outline" size={17} color={C.amber} />
        <Text style={styles.noteText}>Mode demonstrasi. Belum menggunakan Android VpnService atau runtime Xray/Hysteria2.</Text>
      </View>

      <SectionTitle title="Ringkasan sesi" />
      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricCaption}>DURASI</Text>
          <Text style={styles.metricValue}>{formatDuration(elapsedSeconds)}</Text>
          <Text style={styles.metricFoot}>waktu simulasi</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricCaption}>PROFIL</Text>
          <Text style={styles.metricValue}>{profiles.length.toString().padStart(2, "0")}</Text>
          <Text style={styles.metricFoot}>tersimpan lokal</Text>
        </Card>
      </View>
      <Card style={styles.trafficCard}>
        <View style={styles.trafficTop}>
          <Text style={styles.trafficTitle}>Trafik demo</Text>
          <Pill label="DATA SIMULASI" color={C.amber} soft />
        </View>
        <View style={styles.trafficMetrics}>
          <TrafficValue label="DITERIMA" value={`${transferIn} MB`} icon="arrow-down" color={C.mint} />
          <View style={styles.trafficDivider} />
          <TrafficValue label="DIKIRIM" value={`${transferOut} MB`} icon="arrow-up" color={C.cyan} />
        </View>
      </Card>

      <SectionTitle title="Aktivitas terbaru" action={<Text style={styles.miniCount}>{logs.length.toString().padStart(2, "0")}</Text>} />
      {logs.slice(0, 2).length ? logs.slice(0, 2).map((log) => (
        <View key={log.id} style={styles.logRow}>
          <View style={[styles.logDot, { backgroundColor: log.level === "error" ? C.red : log.level === "warning" ? C.amber : C.cyan }]} />
          <Text style={styles.logText} numberOfLines={1}>{log.message}</Text>
          <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
        </View>
      )) : (
        <Text style={styles.emptyActivity}>Belum ada aktivitas. Catatan baru muncul saat Anda mengelola profil.</Text>
      )}
    </ScreenFrame>
  );
}

function TrafficValue({ label, value, icon, color }: { label: string; value: string; icon: "arrow-down" | "arrow-up"; color: string }) {
  return (
    <View style={styles.trafficValue}>
      <View style={styles.trafficLabelRow}><Ionicons name={icon} size={14} color={color} /><Text style={styles.metricCaption}>{label}</Text></View>
      <Text style={[styles.trafficAmount, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topline: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: -3 },
  brandMark: { width: 31, height: 31, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: `${C.cyan}55`, backgroundColor: `${C.cyan}10` },
  toplineText: { flex: 1, color: C.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  connectionCard: { padding: 17, borderColor: `${C.cyan}38`, gap: 16 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  orbOuter: { width: 78, height: 78, borderRadius: 39, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  orbMiddle: { width: 62, height: 62, borderRadius: 31, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  orbCore: { width: 47, height: 47, borderRadius: 24, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  statusCopy: { flex: 1, gap: 5 },
  statusLabel: { color: C.text, fontSize: 13, fontWeight: "800", letterSpacing: 1.2 },
  statusDescription: { color: C.muted, fontSize: 12, lineHeight: 17 },
  statusDivider: { height: 1, backgroundColor: C.border },
  profileLine: { flexDirection: "row", alignItems: "center", gap: 11 },
  addProfileRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 2 },
  profileIcon: { width: 37, height: 37, borderRadius: 12, backgroundColor: `${C.cyan}12`, alignItems: "center", justifyContent: "center" },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { color: C.text, fontSize: 14, fontWeight: "700" },
  profileAddress: { color: C.muted, fontSize: 11 },
  smallAction: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  noteRow: { flexDirection: "row", gap: 9, alignItems: "flex-start", borderRadius: 14, borderWidth: 1, borderColor: `${C.amber}38`, backgroundColor: `${C.amber}0A`, padding: 12 },
  noteText: { flex: 1, color: C.amber, fontSize: 11, lineHeight: 16 },
  metricsRow: { flexDirection: "row", gap: 10 },
  metricCard: { flex: 1, minHeight: 104, justifyContent: "center", gap: 6, padding: 15 },
  metricCaption: { color: C.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.15 },
  metricValue: { color: C.text, fontSize: 21, fontWeight: "800", fontVariant: ["tabular-nums"] },
  metricFoot: { color: C.dim, fontSize: 10 },
  trafficCard: { padding: 15 },
  trafficTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  trafficTitle: { color: C.text, fontSize: 14, fontWeight: "700" },
  trafficMetrics: { flexDirection: "row", alignItems: "center", paddingTop: 4 },
  trafficDivider: { width: 1, height: 38, backgroundColor: C.border, marginHorizontal: 20 },
  trafficValue: { flex: 1, gap: 7 },
  trafficLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  trafficAmount: { fontSize: 17, fontWeight: "800", fontVariant: ["tabular-nums"] },
  miniCount: { color: C.dim, fontSize: 11, fontWeight: "700" },
  logRow: { flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: `${C.border}80` },
  logDot: { width: 6, height: 6, borderRadius: 3 },
  logText: { flex: 1, color: C.muted, fontSize: 12 },
  logTime: { color: C.dim, fontSize: 10, fontVariant: ["tabular-nums"] },
  emptyActivity: { color: C.dim, fontSize: 12, lineHeight: 18 },
});
