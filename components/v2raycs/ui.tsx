import React from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const C = {
  bg: "#08111B",
  surface: "#0E1B28",
  raised: "#132432",
  border: "#203343",
  text: "#F2F7FB",
  muted: "#91A4B6",
  cyan: "#35D7F2",
  mint: "#9DE8C1",
  amber: "#F5BD64",
  red: "#FF7A83",
  dim: "#5E7284",
};

export function ScreenFrame({
  children,
  title,
  subtitle,
  scroll = true,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  scroll?: boolean;
}) {
  const content = (
    <View style={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>V2RAYCS / NETWORK CONSOLE</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  icon,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  icon?: React.ReactNode;
  compact?: boolean;
}) {
  const style = variant === "primary" ? styles.primaryButton : variant === "danger" ? styles.dangerButton : variant === "ghost" ? styles.ghostButton : styles.secondaryButton;
  const labelStyle = variant === "primary" ? styles.primaryButtonText : variant === "danger" ? styles.dangerButtonText : styles.secondaryButtonText;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [style, compact && styles.compactButton, disabled && styles.disabledButton, pressed && !disabled && styles.pressed]}
    >
      {icon}
      <Text style={labelStyle}>{label}</Text>
    </Pressable>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = "none",
  multiline,
  hint,
  ...props
}: TextInputProps & {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.dim}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={[styles.input, multiline && styles.multiline]}
        selectionColor={C.cyan}
        {...props}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Pill({ label, color = C.cyan, soft = false }: { label: string; color?: string; soft?: boolean }) {
  return (
    <View style={[styles.pill, { borderColor: `${color}66`, backgroundColor: soft ? `${color}12` : "transparent" }]}>
      <View style={[styles.pillDot, { backgroundColor: color }]} />
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

export function ChoiceChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function LoadingBlock({ label = "Memuat data lokal…" }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={C.cyan} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export const uiStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  between: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  muted: { color: C.muted, fontSize: 13, lineHeight: 19 },
  text: { color: C.text, fontSize: 15, lineHeight: 22 },
  iconButton: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.raised, alignItems: "center", justifyContent: "center" },
  separator: { height: 1, backgroundColor: C.border, marginVertical: 16 },
  smallLabel: { color: C.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1.1 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, paddingBottom: 116 },
  content: { paddingHorizontal: 20, paddingTop: 15, gap: 19 },
  heading: { gap: 6, marginBottom: 3 },
  eyebrow: { color: C.cyan, fontSize: 10, fontWeight: "800", letterSpacing: 1.8 },
  title: { color: C.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.6 },
  subtitle: { color: C.muted, fontSize: 14, lineHeight: 20, maxWidth: 360 },
  card: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 17, gap: 13 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 3 },
  sectionTitle: { color: C.text, fontSize: 16, fontWeight: "700" },
  primaryButton: { minHeight: 50, paddingHorizontal: 17, borderRadius: 15, backgroundColor: C.cyan, flexDirection: "row", gap: 9, alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: C.bg, fontSize: 14, fontWeight: "800" },
  secondaryButton: { minHeight: 48, paddingHorizontal: 16, borderRadius: 15, backgroundColor: C.raised, borderWidth: 1, borderColor: C.border, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: C.text, fontSize: 14, fontWeight: "700" },
  dangerButton: { minHeight: 48, paddingHorizontal: 16, borderRadius: 15, backgroundColor: `${C.red}20`, borderWidth: 1, borderColor: `${C.red}60`, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  dangerButtonText: { color: C.red, fontSize: 14, fontWeight: "700" },
  ghostButton: { minHeight: 42, paddingHorizontal: 10, borderRadius: 12, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" },
  compactButton: { minHeight: 40, paddingHorizontal: 12, borderRadius: 12 },
  disabledButton: { opacity: 0.45 },
  pressed: { opacity: 0.77, transform: [{ scale: 0.985 }] },
  fieldWrap: { gap: 7 },
  fieldLabel: { color: C.muted, fontSize: 12, fontWeight: "700", letterSpacing: 0.25 },
  input: { minHeight: 48, borderRadius: 13, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg, paddingHorizontal: 13, color: C.text, fontSize: 14 },
  multiline: { minHeight: 90, paddingTop: 12 },
  hint: { color: C.dim, fontSize: 11, lineHeight: 16 },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, alignSelf: "flex-start" },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.9 },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg },
  chipSelected: { borderColor: C.cyan, backgroundColor: `${C.cyan}16` },
  chipText: { color: C.muted, fontSize: 12, fontWeight: "700" },
  chipTextSelected: { color: C.cyan },
  loading: { minHeight: 150, gap: 12, alignItems: "center", justifyContent: "center" },
  muted: { color: C.muted, fontSize: 13 },
});
