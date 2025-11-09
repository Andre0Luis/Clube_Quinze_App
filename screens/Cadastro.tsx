import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import Illustration from "../assets/Illustration.svg";
import NetworkWiFiFull from "../assets/Network-WiFi-Full.svg";
import Time from "../assets/Time.svg";
import Car011 from "../assets/car-011.svg";
import Chevrondown from "../assets/chevron-down.svg";
import Topright from "../assets/top-right.svg";

const CadastroScreen = () => {
  return (
    <SafeAreaView style={styles.cadastro10}>
      <View style={styles.view}>
        <View>
          <View style={[styles.topHeader20, styles.contentSpaceBlock]}>
            <View style={styles.statusBar}>
              <Time style={styles.timeIcon} width={27} height={12} />
              <View style={[styles.status, styles.titleSpaceBlock]}>
                <View style={styles.sim1SingleSim}>
                  <View style={[styles.bar4, styles.barPosition]} />
                  <View style={[styles.bar3, styles.barPosition]} />
                  <View style={[styles.bar2, styles.barPosition]} />
                  <View style={[styles.bar1, styles.barPosition]} />
                </View>
                <NetworkWiFiFull
                  style={styles.networkWifiFull}
                  width={Width.width_20}
                  height={Height.height_12}
                />
                <Image
                  style={styles.batteryFullUncharged}
                  contentFit="cover"
                  source={require("../assets/Battery-Full-Uncharged@3x.png")}
                />
              </View>
            </View>
            <View style={[styles.navigation, styles.titleSpaceBlock]}>
              <View style={[styles.button20, styles.buttonFlexBox]}>
                <Car011
                  style={styles.iconLayout1}
                  width={Width.width_24}
                  height={Height.height_24}
                  color={Color.hit}
                />
                <View style={[styles.labelWrapper, styles.labelWrapperFlexBox]}>
                  <Text style={styles.label}>Entenda os prazos</Text>
                </View>
                <Car011
                  style={styles.iconLayout1}
                  width={Width.width_24}
                  height={Height.height_24}
                  color={Color.hit}
                />
              </View>
              <View
                style={[styles.mdsPublicTwButton, styles.labelWrapperFlexBox]}
              >
                <View style={styles.iconLayout1}>
                  <Topright style={[styles.topRightIcon, styles.iconLayout]} />
                </View>
              </View>
            </View>
            <View style={[styles.title, styles.titleSpaceBlock]}>
              <Text style={[styles.cadastro, styles.cadastroTypo]}>
                Cadastro
              </Text>
            </View>
            <Illustration
              style={styles.illustrationIcon}
              width={Width.width_80}
              height={96}
            />
          </View>
        </View>
        <View style={[styles.content, styles.contentSpaceBlock]}>
          <View
            style={[styles.mdsPublicTwTextInputParent, styles.parentLayout]}
          >
            <View style={styles.mdsPublicTwTextInput}>
              <Text style={[styles.cadastro10Label, styles.buttonTextLayout]}>
                Nome Completo
              </Text>
              <View
                style={[styles.inputContainer, styles.inputContainerBorder]}
              >
                <Text style={[styles.placeholder, styles.placeholderTypo]}>
                  João
                </Text>
              </View>
              <View style={styles.supportingText}>
                <Text
                  style={[styles.insertYourText, styles.insertYourTextTypo]}
                >
                  Informative message holder
                </Text>
              </View>
            </View>
            <View style={styles.mdsPublicTwSelect}>
              <Text style={[styles.cadastro10Label, styles.buttonTextLayout]}>
                Data de nascimento
              </Text>
              <View
                style={[
                  styles.cadastro10InputContainer,
                  styles.inputContainerBorder,
                ]}
              >
                <Text
                  style={[styles.cadastro10Placeholder, styles.placeholderTypo]}
                >
                  15/05/2000
                </Text>
                <View style={styles.controls}>
                  <Chevrondown
                    style={[styles.chevronDownIcon, styles.iconLayout]}
                  />
                </View>
              </View>
              <View style={styles.supportingText}>
                <Text
                  style={[styles.insertYourText, styles.insertYourTextTypo]}
                >
                  Informative message holder
                </Text>
              </View>
            </View>
            <View style={styles.mdsPublicTwTextInput}>
              <Text style={[styles.cadastro10Label, styles.buttonTextLayout]}>
                Email
              </Text>
              <View
                style={[styles.inputContainer, styles.inputContainerBorder]}
              >
                <Text style={[styles.placeholder, styles.placeholderTypo]}>
                  João25@gmail.com
                </Text>
              </View>
              <View style={styles.supportingText}>
                <Text
                  style={[styles.insertYourText, styles.insertYourTextTypo]}
                >
                  Informative message holder
                </Text>
              </View>
            </View>
            <View style={styles.mdsPublicTwTextInput}>
              <Text style={[styles.cadastro10Label, styles.buttonTextLayout]}>
                Senha
              </Text>
              <View
                style={[styles.inputContainer, styles.inputContainerBorder]}
              >
                <Text style={[styles.placeholder, styles.placeholderTypo]}>
                  João*25
                </Text>
              </View>
              <View style={styles.supportingText}>
                <Text
                  style={[styles.insertYourText, styles.insertYourTextTypo]}
                >
                  Informative message holder
                </Text>
              </View>
            </View>
          </View>
          <View
            style={[styles.aoContinuarVocConcordaParent, styles.parentLayout]}
          >
            <Text
              style={[
                styles.aoContinuarVocContainer,
                styles.insertYourTextTypo,
              ]}
            >
              <Text style={styles.cadastro10AoContinuarVocContainer}>
                <Text
                  style={styles.aoContinuarVoc}
                >{`Ao “continuar”, você concorda com os `}</Text>
                <Text style={styles.cadastroTypo}>Termos de Uso</Text>
                <Text style={styles.aoContinuarVoc}>{` e a `}</Text>
                <Text style={styles.cadastroTypo}>Política de Privacidade</Text>
                <Text
                  style={styles.aoContinuarVoc}
                >{` do Clube Quinze. `}</Text>
              </Text>
            </Text>
            <View
              style={[styles.cadastro10MdsPublicTwButton, styles.buttonFlexBox]}
            >
              <Text style={[styles.buttonText, styles.buttonTextLayout]}>
                Continuar
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cadastro10: {
    backgroundColor: Color.mainGohan,
    flex: 1,
  },
  contentSpaceBlock: {
    paddingHorizontal: Padding.padding_24,
    width: Width.width_375,
    paddingVertical: Padding.padding_0,
  },
  titleSpaceBlock: {
    paddingHorizontal: Padding.padding_0,
    flexDirection: "row",
  },
  barPosition: {
    width: Width.width_3_2,
    backgroundColor: Color.hit,
    borderRadius: Border.br_1,
    top: "50%",
    left: "50%",
    position: "absolute",
  },
  buttonFlexBox: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  iconLayout1: {
    width: Width.width_24,
    height: Height.height_24,
  },
  labelWrapperFlexBox: {
    borderStyle: "solid",
    justifyContent: "center",
    alignItems: "center",
  },
  iconLayout: {
    maxHeight: "100%",
    maxWidth: "100%",
    color: Color.mainBulma,
    position: "absolute",
    overflow: "hidden",
  },
  cadastroTypo: {
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
  },
  parentLayout: {
    gap: Gap.gap_24,
    width: Width.width_327,
  },
  buttonTextLayout: {
    lineHeight: LineHeight.lh_24,
    fontSize: FontSize.fs_16,
  },
  inputContainerBorder: {
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    borderStyle: "solid",
    alignSelf: "stretch",
    backgroundColor: Color.mainGohan,
  },
  placeholderTypo: {
    color: Color.mainTrunks,
    fontFamily: FontFamily.dMSansRegular,
    lineHeight: LineHeight.lh_24,
    textAlign: "left",
    fontSize: FontSize.fs_14,
  },
  insertYourTextTypo: {
    lineHeight: LineHeight.lh_16,
    fontSize: FontSize.fs_12,
    textAlign: "left",
  },
  view: {
    height: Height.height_812,
    overflow: "hidden",
    width: "100%",
    backgroundColor: Color.mainGohan,
    flex: 1,
  },
  topHeader20: {
    paddingVertical: Padding.padding_0,
    backgroundColor: Color.mainGohan,
  },
  statusBar: {
    justifyContent: "space-between",
    paddingTop: Padding.padding_16,
    paddingBottom: Padding.padding_8,
    gap: Gap.gap_20,
    alignItems: "center",
    flexDirection: "row",
    width: Width.width_327,
  },
  timeIcon: {
    height: 12,
    width: 27,
    color: Color.hit,
  },
  status: {
    paddingVertical: Padding.padding_3,
    gap: Gap.gap_3,
    alignItems: "center",
  },
  sim1SingleSim: {
    width: Width.width_20,
    height: Height.height_14,
    overflow: "hidden",
  },
  bar4: {
    marginTop: -6,
    marginLeft: 6.4,
    height: Height.height_12,
  },
  bar3: {
    marginTop: -3.6,
    marginLeft: 1.1,
    height: 10,
  },
  bar2: {
    marginTop: -1,
    marginLeft: -4.2,
    height: 7,
  },
  bar1: {
    marginTop: 1.4,
    marginLeft: -9.6,
    height: 5,
  },
  networkWifiFull: {
    height: Height.height_12,
    width: Width.width_20,
  },
  batteryFullUncharged: {
    width: Width.width_28,
    height: Height.height_14,
  },
  navigation: {
    paddingVertical: Padding.padding_8,
    gap: 139,
    alignSelf: "stretch",
  },
  button20: {
    height: Height.height_40,
    top: 16,
    right: 0,
    gap: Gap.gap_8,
    zIndex: 0,
    display: "none",
    position: "absolute",
    justifyContent: "center",
  },
  labelWrapper: {
    borderColor: Color.hit,
    borderBottomWidth: 1,
  },
  label: {
    lineHeight: LineHeight.lh_18,
    fontFamily: FontFamily.robotoBold,
    textAlign: "right",
    fontWeight: "700",
    fontSize: FontSize.fs_14,
    color: Color.hit,
  },
  mdsPublicTwButton: {
    width: Width.width_40,
    borderRadius: 32,
    borderColor: Color.jiren,
    borderWidth: 2,
    padding: StyleVariable.px2,
    zIndex: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  topRightIcon: {
    height: "62.5%",
    width: "62.5%",
    top: "18.75%",
    right: "18.75%",
    bottom: "18.75%",
    left: "18.75%",
    color: Color.mainBulma,
  },
  title: {
    paddingVertical: Padding.padding_16,
    alignSelf: "stretch",
  },
  cadastro: {
    fontSize: FontSize.fs_32,
    letterSpacing: -0.5,
    lineHeight: LineHeight.lh_40,
    textAlign: "left",
    color: Color.hit,
    width: Width.width_327,
  },
  illustrationIcon: {
    width: Width.width_80,
    height: 96,
    display: "none",
  },
  content: {
    alignItems: "center",
    paddingVertical: Padding.padding_0,
    flex: 1,
  },
  mdsPublicTwTextInputParent: {
    zIndex: 0,
  },
  mdsPublicTwTextInput: {
    gap: StyleVariable.gap2,
    alignSelf: "stretch",
  },
  cadastro10Label: {
    fontFamily: FontFamily.dMSansRegular,
    textAlign: "left",
    color: Color.mainBulma,
    alignSelf: "stretch",
  },
  inputContainer: {
    paddingHorizontal: StyleVariable.px3,
    paddingVertical: StyleVariable.py2,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
  },
  placeholder: {
    alignSelf: "stretch",
  },
  supportingText: {
    width: 240,
    paddingHorizontal: Padding.padding_12,
    display: "none",
    flexDirection: "row",
    paddingVertical: Padding.padding_0,
  },
  insertYourText: {
    color: Color.lightTrunks,
    fontFamily: FontFamily.dMSansRegular,
    flex: 1,
  },
  mdsPublicTwSelect: {
    gap: StyleVariable.gap1,
    alignSelf: "stretch",
  },
  cadastro10InputContainer: {
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusIXs,
    paddingHorizontal: StyleVariable.px2,
    paddingVertical: StyleVariable.py1,
    maxHeight: StyleVariable.heightH8,
    gap: StyleVariable.gap2,
    alignItems: "center",
    flexDirection: "row",
  },
  cadastro10Placeholder: {
    flex: 1,
  },
  controls: {
    height: 16,
    width: Width.width_16,
  },
  chevronDownIcon: {
    height: "18.75%",
    width: "37.5%",
    top: "40.63%",
    right: "31.25%",
    bottom: "40.63%",
    left: "31.25%",
    color: Color.mainBulma,
  },
  aoContinuarVocConcordaParent: {
    marginLeft: -163.5,
    top: 504,
    zIndex: 1,
    left: "50%",
    gap: Gap.gap_24,
    position: "absolute",
  },
  aoContinuarVocContainer: {
    textDecorationLine: "underline",
    display: "flex",
    alignItems: "flex-end",
    color: Color.hit,
    width: Width.width_327,
  },
  cadastro10AoContinuarVocContainer: {
    width: "100%",
  },
  aoContinuarVoc: {
    fontFamily: FontFamily.dMSansRegular,
  },
  cadastro10MdsPublicTwButton: {
    backgroundColor: Color.mainBeerus,
    paddingHorizontal: StyleVariable.px6,
    paddingVertical: StyleVariable.py4,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    alignSelf: "stretch",
    overflow: "hidden",
  },
  buttonText: {
    color: Color.mainGoten,
    textAlign: "center",
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
  },
});

export default CadastroScreen;
