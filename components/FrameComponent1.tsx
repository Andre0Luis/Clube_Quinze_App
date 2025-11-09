import { Image } from "expo-image";
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
import Notifications from "./Notifications";

type FrameComponent1Props = {
  userName?: string;
  onPressNotifications?: () => void;
};

const FrameComponent1 = ({
  userName = "João",
  onPressNotifications,
}: FrameComponent1Props) => {
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
          accessibilityRole="button"
          accessibilityLabel="Abrir notificações"
          onPress={onPressNotifications}
          activeOpacity={0.7}
          style={styles.notificationsWrapper}
        >
          <Notifications notifications="bell" size="32px" type="stroke" />
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
  buttonText: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_24,
    textAlign: "center",
  },
  notificationsWrapper: {
    height: Height.height_36,
    width: Width.width_36,
    borderRadius: Border.br_58,
    borderStyle: "solid",
    borderColor: Color.jiren,
    borderWidth: 2,
    overflow: "hidden",
  },
  olJoo: {
    fontSize: FontSize.fs_24,
    lineHeight: LineHeight.lh_32,
    textAlign: "left",
    alignSelf: "stretch",
  },
});

export default FrameComponent1;
