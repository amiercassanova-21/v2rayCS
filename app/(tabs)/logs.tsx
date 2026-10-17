import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useV2rayCS } from "@/features/app/AppProvider";
import { C, Card, ChoiceChip, Pill, ScreenFrame, SectionTitle } from "@/components/v2raycs/ui";
import { ConfirmDialog } from "@/components/v2raycs/ProfileEditor";
import type { LogLevel } from "@/features/profiles/model";

const FILTERS: { id: "all" | LogLevel; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "info", label: "Info" },
  { id: "warning", label: "Peringatan" },
  { id: "error", label: "Error" },
];

export default function LogsScreen() {
  const { logs, clearLogs } = useV2rayCS();
  const [filter, setFilter] = useState<"all" | LogLevel>("all");
  const [confirmClear, setConfirmClear] = useState(false);
  const visibleLogs = useMemo(() => logs.filter((log) => filter === "all" || log.level === filter), [logs, filter]);
  const levelColor = (level: LogLevel) => level === "error" ? C.red : level === "warning" ? C.amber : C.cyan;
  const titleCase = (level: LogLevel) => level === "warning" ? "WARN" : level.toUpperCase();

  return (
    <ScreenFrame title="Log" subtitle="Aktivitas aplikasi dan simulasi, tanpa log tunnel native.">
      <View style={styles.headingRow}>
        <View style={styles.countWrap}>
          <Text style={styles.count}>{visibleLogs.length.toString().padStart(2, "0")}</Text>
          <Text style={styles.countLabel}>ENTRI</Text>
        </View>
        {logs.length ? <Pressable onPress={() => setConfirmClear(true)} style={styles.clearButton}><Ionicons name="trash-outline" size={15} color={C.red} /><Text style={styles.clearText}>Bersihkan</Text></Pressable> : null}
      </View>
      <View style={styles.filters}>
        {FILTERS.map((item) => <ChoiceChip key={item.id} label={item.label} selected={filter === item.id} onPress={() => setFilter(item.id)} />)}
      </View>
      <Card style={styles.banner}>
        <View style={styles.bannerIcon}><Ionicons name="pulse-outline" size={18} color={C.amber} /></View>
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerTitle}>Sumber log: aplikasi / simulasi</Text>
          <Text style={styles.bannerText}>Belum menerima log dari Android VpnService atau runtime Xray.</Text>
        </View>
      </Card>
      <SectionTitle title="Kejadian terbaru" action={<Pill label="LOKAL" color={C.cyan} soft />} />
      {visibleLogs.length ? visibleLogs.map((log, index) => (
        <View key={log.id} style={styles.logItem}>
          <View style={styles.timeline}>
            <View style={[styles.dot, { backgroundColor: levelColor(log.level) }]} />
            {index < visibleLogs.length - 1 ? <View style={styles.line} /> : null}
          </View>
          <View style={styles.logBody}>
            <View style={styles.logHeader}>
              <View style={[styles.levelTag, { borderColor: `${levelColor(log.level)}55`, backgroundColor: `${levelColor(log.level)}12` }]}><Text style={[styles.levelText, { color: levelColor(log.level) }]}>{titleCase(log.level)}</Text></View>
              <Text style={styles.time}>{new Date(log.timestamp).toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</Text>
            </View>
            <Text style={styles.message}>{log.message}</Text>
            <Text style={styles.source}>CLIENT · SIMULATION</Text>
          </View>
        </View>
      )) : (
        <Card style={styles.empty}>
          <View style={styles.emptyIcon}><Ionicons name="document-text-outline" size={22} color={C.cyan} /></View>
          <Text style={styles.emptyTitle}>{filter === "all" ? "Belum ada log" : `Tidak ada log ${filter}`}</Text>
          <Text style={styles.emptyText}>Aktivitas manajemen profil dan simulasi akan tercatat di sini. Tidak ada data koneksi nyata.</Text>
        </Card>
      )}
      <ConfirmDialog visible={confirmClear} title="Bersihkan semua log?" message="Entri log lokal akan dihapus dari perangkat ini." confirmLabel="Bersihkan" onCancel={() => setConfirmClear(false)} onConfirm={() => { clearLogs(); setConfirmClear(false); }} />
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  headingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  countWrap: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  count: { color: C.cyan, fontSize: 29, fontWeight: "800", fontVariant: ["tabular-nums"] },
  countLabel: { color: C.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.3 },
  clearButton: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 11, paddingVertical: 9, borderRadius: 12, backgroundColor: `${C.red}10`, borderWidth: 1, borderColor: `${C.red}38` },
  clearText: { color: C.red, fontSize: 11, fontWeight: "700" },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  banner: { flexDirection: "row", gap: 11, alignItems: "flex-start", borderColor: `${C.amber}35`, backgroundColor: `${C.amber}08`, padding: 13 },
  bannerIcon: { width: 33, height: 33, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: `${C.amber}12` },
  bannerCopy: { flex: 1, gap: 3 },
  bannerTitle: { color: C.text, fontSize: 12, fontWeight: "700" },
  bannerText: { color: C.muted, fontSize: 11, lineHeight: 16 },
  logItem: { flexDirection: "row", gap: 12, minHeight: 93 },
  timeline: { width: 11, alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  line: { flex: 1, width: 1, backgroundColor: C.border, marginTop: 5 },
  logBody: { flex: 1, borderBottomWidth: 1, borderBottomColor: C.border, paddingBottom: 12, gap: 6 },
  logHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  levelTag: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  levelText: { fontSize: 8, fontWeight: "900", letterSpacing: 0.7 },
  time: { color: C.dim, fontSize: 10, fontVariant: ["tabular-nums"] },
  message: { color: C.text, fontSize: 12, lineHeight: 18 },
  source: { color: C.dim, fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  empty: { alignItems: "center", paddingHorizontal: 23, paddingVertical: 28 },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: `${C.cyan}10`, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: C.text, fontSize: 15, fontWeight: "800" },
  emptyText: { color: C.muted, fontSize: 12, textAlign: "center", lineHeight: 19 },
});
