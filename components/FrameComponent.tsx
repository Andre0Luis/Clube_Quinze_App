import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import {
    Border,
    Color,
    FontFamily,
    FontSize,
    Gap,
    Height,
    LineHeight,
    Padding,
    StyleVariable,
    Width,
} from "../GlobalStyles";
import Time from "./Time";

const FrameComponent = () => {
  return (
    <View style={styles.buttonTextParent}>
      <Text style={[styles.buttonText, styles.buttonTypo]}>
        Agendamento dos próximo 30 dias
      </Text>
      <View style={[styles.card, styles.cardBorder]}>
        <View style={[styles.frameParent, styles.frameParentFlexBox]}>
          <View style={[styles.timeWrapper, styles.cardBorder]}>
            <Time
              size="32px"
              time="calendar"
              type="stroke"
              timePosition="absolute"
              timeTop="50%"
              timeLeft="50%"
              timeWidth={32}
              timeHeight={32}
              calendar={
                <Ionicons name="calendar-outline" size={20} color={Color.piccolo} />
              }
            />
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Agendado</Text>
          </View>
        </View>
        <Text style={[styles.buttonText2, styles.buttonTypo]}>
          Seu próximo cuidado pessoal
        </Text>
        <View style={styles.frameParentFlexBox}>
          <Text style={styles.labelText}>Sexta-feira, 17 de Junho - 15:30</Text>
        </View>
        <View style={[styles.mdsPublicTwTabs, styles.frameParentFlexBox]}>
          <Text style={[styles.tabText, styles.textTypo]}>Ver detalhes</Text>
          <View style={styles.arrowWrapper}>
            <Ionicons name="arrow-forward" size={18} color={Color.piccolo} />
          </View>
        </View>
      </View>
      <View style={[styles.card, styles.cardBorder]}>
        <View style={[styles.frameParent, styles.frameParentFlexBox]}>
          <View style={[styles.timeWrapper, styles.cardBorder]}>
            <Time
              size="32px"
              time="calendar"
              type="stroke"
              timePosition="absolute"
              timeTop="50%"
              timeLeft="50%"
              timeWidth={32}
              timeHeight={32}
              calendar={
                <Ionicons name="calendar-outline" size={20} color={Color.piccolo} />
              }
            />
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Agendado</Text>
          </View>
        </View>
        <Text style={[styles.buttonText3, styles.textTypo]}>
          Sexta-feira, 25 de Junho - 10:00
        </Text>
        <View style={[styles.mdsPublicTwTabs, styles.frameParentFlexBox]}>
          <Text style={[styles.tabText, styles.textTypo]}>Ver detalhes</Text>
          <View style={styles.arrowWrapper}>
            <Ionicons name="arrow-forward" size={18} color={Color.piccolo} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonTypo: {
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
    lineHeight: LineHeight.lh_24,
    fontSize: FontSize.fs_16,
    textAlign: "left",
    color: Color.mainBulma,
  },
  cardBorder: {
    borderStyle: "solid",
    overflow: "hidden",
  },
  frameParentFlexBox: {
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "stretch",
  },
  textTypo: {
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
    lineHeight: LineHeight.lh_24,
  },
  buttonTextParent: {
    gap: Gap.gap_16,
    zIndex: 1,
    alignSelf: "stretch",
  },
  buttonText: {
    textAlign: "left",
    color: Color.mainBulma,
    alignSelf: "stretch",
  },
  card: {
    width: Width.width_327,
    borderRadius: Border.br_8,
    backgroundColor: Color.white,
    borderColor: Color.piccolo,
    borderWidth: 1,
    paddingHorizontal: StyleVariable.px6,
    paddingVertical: Padding.padding_16,
    gap: Gap.gap_8,
    overflow: "hidden",
  },
  frameParent: {
    justifyContent: "space-between",
    gap: Gap.gap_20,
  },
  timeWrapper: {
    height: Height.height_36,
    width: Width.width_36,
    borderRadius: Border.br_58,
    borderColor: Color.jiren,
    borderWidth: 2,
    overflow: "hidden",
  },
  buttonText2: {
    textAlign: "left",
    color: Color.mainBulma,
  },
  labelText: {
    fontSize: FontSize.fs_12,
    lineHeight: LineHeight.lh_16,
    fontFamily: FontFamily.dMSansRegular,
    textAlign: "center",
    color: Color.hit,
  },
  mdsPublicTwTabs: {
    height: Height.height_32,
    paddingLeft: StyleVariable.pl2,
    paddingTop: StyleVariable.py1,
    paddingRight: StyleVariable.pr1,
    paddingBottom: StyleVariable.py1,
    gap: StyleVariable.gap1,
    overflow: "hidden",
  },
  tabText: {
    flex: 1,
    textDecorationLine: "underline",
    textAlign: "right",
    color: Color.mainBulma,
  },
  buttonText3: {
    color: Color.hit,
    textAlign: "left",
  },
  statusBadge: {
    paddingHorizontal: StyleVariable.px2,
    paddingVertical: StyleVariable.py1,
    borderRadius: Border.br_16,
    backgroundColor: Color.supportiveRoshi,
  },
  statusText: {
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    color: Color.mainGohan,
  },
  arrowWrapper: {
    width: 32,
    height: 32,
    borderRadius: Border.br_58,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FrameComponent;
