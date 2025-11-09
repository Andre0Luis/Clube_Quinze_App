import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    Border,
    Color,
    FontFamily,
    FontSize,
    Gap,
    Height,
    LineHeight,
    StyleVariable,
    Width,
} from "../GlobalStyles";
export type Card1Props = {
  onPress?: () => void;
};

const Card1 = ({ onPress }: Card1Props) => {
  return (
    <TouchableOpacity
      style={[styles.card, styles.cardBorder]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.cardInnerFlexBox}>
        <View style={[styles.iconWrapper, styles.cardBorder]}>
          <Ionicons
            name="people-outline"
            size={20}
            color={Color.piccolo}
          />
        </View>
      </View>
      <Text style={[styles.buttonText, styles.textTypo]}>
        Comunidade Quinze
      </Text>
      <View style={styles.cardInnerFlexBox}>
        <Text style={styles.labelText}>
          Descubra as últimas novidades agora
        </Text>
      </View>
      <View style={[styles.mdsPublicTwTabs, styles.cardInnerFlexBox]}>
        <Text style={[styles.tabText, styles.textTypo]}>Entrar</Text>
        <View style={styles.arrowWrapper}>
          <Ionicons name="arrow-forward" size={18} color={Color.piccolo} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardBorder: {
    borderStyle: "solid",
    overflow: "hidden",
  },
  textTypo: {
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
    lineHeight: LineHeight.lh_24,
    color: Color.hit,
  },
  cardInnerFlexBox: {
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "stretch",
  },
  card: {
    width: Width.width_327,
    borderRadius: Border.br_8,
    backgroundColor: Color.mainGohan,
    borderColor: Color.piccolo,
    borderWidth: 1,
    padding: StyleVariable.surfaceBorderRadiusRadiusSLg,
    gap: Gap.gap_8,
    overflow: "hidden",
  },
  iconWrapper: {
    height: Height.height_36,
    width: Width.width_36,
    borderRadius: Border.br_58,
    borderColor: Color.jiren,
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: FontSize.fs_16,
    textAlign: "left",
    color: Color.hit,
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
  arrowWrapper: {
    width: 32,
    height: 32,
    borderRadius: Border.br_58,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    flex: 1,
    fontSize: FontSize.fs_14,
    textDecorationLine: "underline",
    textAlign: "right",
    color: Color.hit,
  },
});

export default Card1;
