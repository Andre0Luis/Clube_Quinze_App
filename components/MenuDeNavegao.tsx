import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
import {
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import {
    Border,
    Color,
    FontFamily,
    FontSize,
    Gap,
    Padding,
} from "../GlobalStyles";

export type MenuItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const DEFAULT_ITEMS: MenuItem[] = [
  { key: "home", label: "Home", icon: "home-outline" },
  { key: "reserve", label: "Reserva", icon: "calendar-outline" },
  { key: "community", label: "Comunidade", icon: "people-outline" },
  { key: "profile", label: "Perfil", icon: "person-outline" },
];

export type MenuDeNavegaoProps = {
  activeKey?: string;
  items?: MenuItem[];
  onSelectTab?: (tab: string) => void;
  style?: StyleProp<ViewStyle>;
};

const MenuDeNavegao = ({
  activeKey,
  items = DEFAULT_ITEMS,
  onSelectTab,
  style,
}: MenuDeNavegaoProps) => {
  const resolvedActiveKey = useMemo(() => {
    if (activeKey) return activeKey;
    return items[0]?.key ?? "home";
  }, [activeKey, items]);

  return (
    <View style={[styles.container, style]}>
      {items.map((tab) => {
        const isActive = tab.key === resolvedActiveKey;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.item}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Ir para ${tab.label}`}
            activeOpacity={0.8}
            onPress={() => onSelectTab?.(tab.key)}
          >
            <View
              style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={isActive ? Color.mainGohan : Color.piccolo}
              />
            </View>
            <Text
              style={[styles.label, isActive && styles.labelActive]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default memo(MenuDeNavegao);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Color.mainGohan,
    borderWidth: 1,
    borderColor: "rgba(0, 5, 61, 0.06)",
    borderRadius: Border.br_24,
    paddingHorizontal: Padding.padding_10,
    paddingVertical: Padding.padding_12,
    gap: Gap.gap_10,
    shadowColor: "rgba(0, 0, 0, 0.08)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: Gap.gap_4,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 999, // garante o formato circular mesmo em Android
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconWrapperActive: {
    backgroundColor: Color.piccolo,
  },
  label: {
    fontSize: FontSize.fs_10,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
    textAlign: "center",
    flexShrink: 1,
  },
  labelActive: {
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
});
