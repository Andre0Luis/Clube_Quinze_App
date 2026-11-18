import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    Border,
    Color,
    FontFamily,
    FontSize,
    Gap,
    Height,
    LineHeight,
    Padding,
    Width,
} from "../GlobalStyles";
import { getUnreadCount } from "../services/notifications";

type FrameComponent1Props = {
  userName?: string;
};

const FrameComponent1 = ({
  userName = "João",
}: FrameComponent1Props) => {
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  // Recarrega ao voltar para a home (ex.: depois de ler as notificações o selo some).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getUnreadCount()
        .then((count) => active && setUnread(count))
        .catch(() => active && setUnread(0));
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <View style={styles.frameParent}>
      <View style={[styles.frameGroup, styles.frameGroupFlexBox]}>
        <View
          style={[styles.logoQuinzeNovoAzulParent, styles.frameGroupFlexBox]}
        >
          <Image
            style={styles.logoQuinzeNovoAzulIcon}
            contentFit="cover"
            source={require("../assets/images/icon.png")}
          />
          <Text style={[styles.buttonText, styles.olJooTypo]}>
            Clube Quinze
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/notifications")}
          activeOpacity={0.8}
          style={styles.bell}
          accessibilityRole="button"
          accessibilityLabel={
            unread > 0
              ? `Notificações, ${unread} não lidas`
              : "Notificações"
          }
        >
          <Ionicons name="notifications-outline" size={24} color={Color.white} />
          {unread > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
      <Text style={[styles.olJoo, styles.olJooTypo]}>Olá, {userName} 👋</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  frameGroupFlexBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  olJooTypo: {
    color: Color.white,
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
  },
  frameParent: {
    borderBottomRightRadius: Border.br_24,
    borderBottomLeftRadius: Border.br_24,
    backgroundColor: Color.piccolo,
    padding: Padding.padding_24,
    gap: Gap.gap_24,
    alignItems: "center",
    alignSelf: "stretch",
  },
  frameGroup: {
    justifyContent: "space-between",
    gap: Gap.gap_20,
    alignSelf: "stretch",
  },
  logoQuinzeNovoAzulParent: {
    gap: Gap.gap_8,
  },
  logoQuinzeNovoAzulIcon: {
    height: 42,
    width: 42,
    borderRadius: 56,
  },
  bell: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: "#D7263D",
    borderWidth: 2,
    borderColor: Color.piccolo,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 12,
    fontFamily: FontFamily.dMSansBold,
  },
  buttonText: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_24,
    textAlign: "center",
  },
  olJoo: {
    fontSize: FontSize.fs_24,
    lineHeight: LineHeight.lh_32,
    textAlign: "left",
    alignSelf: "stretch",
  },
});

export default FrameComponent1;
