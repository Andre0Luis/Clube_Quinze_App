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
                size={20}
                color={isActive ? Color.mainGohan : Color.piccolo}
              />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
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
    borderRadius: Border.br_24,
    paddingHorizontal: Padding.padding_16,
    paddingVertical: Padding.padding_12,
    gap: Gap.gap_16,
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
    width: 40,
    height: 40,
    borderRadius: Border.br_58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconWrapperActive: {
    backgroundColor: Color.piccolo,
  },
  label: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
    color: Color.mainTrunks,
  },
  labelActive: {
    fontFamily: FontFamily.dMSansBold,
    color: Color.piccolo,
  },
});
