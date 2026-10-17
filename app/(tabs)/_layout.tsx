import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C } from "@/components/v2raycs/ui";

const TAB_ITEMS = [
  { name: "index", title: "Beranda", icon: "home-outline" as const, active: "home" as const },
  { name: "profiles", title: "Profil", icon: "server-outline" as const, active: "server" as const },
  { name: "logs", title: "Log", icon: "pulse-outline" as const, active: "pulse" as const },
  { name: "settings", title: "Setelan", icon: "settings-outline" as const, active: "settings" as const },
  { name: "admin", title: "Admin", icon: "shield-outline" as const, active: "shield" as const },
];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.cyan,
        tabBarInactiveTintColor: C.dim,
        tabBarLabelStyle: { fontSize: 9, fontWeight: "700", marginTop: 1 },
        tabBarStyle: { height: 58 + bottomPadding, paddingTop: 7, paddingBottom: bottomPadding, backgroundColor: C.bg, borderTopColor: C.border, borderTopWidth: 1 },
        sceneStyle: { backgroundColor: C.bg },
      }}
    >
      {TAB_ITEMS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? tab.active : tab.icon} size={19} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
