import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import Time from "../assets/Time.svg";
import NetworkWiFiFull from "../assets/Network-WiFi-Full.svg";
import Illustration from "../assets/Illustration.svg";
import Vector3 from "../assets/Vector3.svg";
import Chevrondown1 from "../assets/chevron-down1.svg";
import Home02 from "../assets/home-02.svg";
import Ellipse11 from "../assets/Ellipse-11.svg";
import Home2 from "../assets/home2.svg";
import Calendardate2 from "../assets/calendar-date2.svg";
import Users1 from "../assets/users1.svg";
import User1 from "../assets/user1.svg";
import Building02 from "../assets/building-02.svg";
import {
  Color,
  Padding,
  Gap,
  Width,
  Border,
  FontFamily,
  LineHeight,
  Height,
  StyleVariable,
  FontSize,
} from "../GlobalStyles";

const Perfil101 = () => {
  return (
    <SafeAreaView style={styles.perfil10}>
      <View style={styles.view}>
        <View>
          <View style={[styles.topHeader20, styles.opesSpaceBlock]}>
            <View style={styles.statusBar}>
              <Time style={styles.timeIcon} width={27} height={12} />
              <View style={[styles.status, styles.menu1FlexBox]}>
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
                  source={require("../assets/Battery-Full-Uncharged.png")}
                />
              </View>
            </View>
            <View style={[styles.titleWrapper, styles.dataFlexBox]}>
              <View style={[styles.title, styles.titleSpaceBlock]}>
                <Text style={[styles.olJoo, styles.olJooTypo]}>
                  Olá, João 👋
                </Text>
              </View>
            </View>
            <Illustration
              style={styles.illustrationIcon}
              width={Width.width_80}
              height={96}
            />
            <View style={styles.mdsPublicTwAvatarParent}>
              <ImageBackground
                style={[styles.mdsPublicTwAvatarIcon, styles.badgesPosition]}
                resizeMode="cover"
                source={require("../assets/MDS-Public-TW-Avatar.png")}
              >
                <Text style={[styles.initials, styles.olJooTypo]} />
                <View style={[styles.badges, styles.badgesPosition]}>
                  <View style={[styles.badgeTr, styles.badgeLayout]} />
                  <View style={[styles.badgeTr, styles.badgeLayout]} />
                  <View style={[styles.badgeBl, styles.badgeLayout]} />
                  <View style={[styles.badgeBl, styles.badgeLayout]} />
                </View>
              </ImageBackground>
              <View style={styles.generic}>
                <Vector3 style={[styles.vectorIcon, styles.iconLayout1]} />
              </View>
            </View>
          </View>
        </View>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainerContent}
        >
          <View style={styles.dadosDaConta}>
            <View style={[styles.opes, styles.opesSpaceBlock]}>
              <View style={[styles.dataParent, styles.dataFlexBox]}>
                <View style={[styles.data, styles.dataFlexBox]}>
                  <View style={styles.currencyType}>
                    <Text style={styles.perfil10Data}>Dados pessoais</Text>
                  </View>
                </View>
                <View style={styles.controlsWrapper}>
                  <View style={[styles.controls, styles.iconLayout]}>
                    <Chevrondown1
                      style={[styles.chevronDownIcon, styles.iconLayout1]}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.borderTop} />
          <View style={styles.dadosDaConta}>
            <View style={[styles.opes, styles.opesSpaceBlock]}>
              <View style={[styles.dataParent, styles.dataFlexBox]}>
                <View style={[styles.data, styles.dataFlexBox]}>
                  <View style={styles.currencyType}>
                    <Text style={styles.perfil10Data}>Preferências</Text>
                  </View>
                </View>
                <View style={styles.controlsWrapper}>
                  <View style={[styles.controls, styles.iconLayout]}>
                    <Chevrondown1
                      style={[styles.chevronDownIcon, styles.iconLayout1]}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.borderTop} />
          <View style={styles.dadosDaConta}>
            <View style={[styles.opes, styles.opesSpaceBlock]}>
              <View style={[styles.dataParent, styles.dataFlexBox]}>
                <View style={[styles.data, styles.dataFlexBox]}>
                  <View style={styles.currencyType}>
                    <Text style={styles.perfil10Data}>Planos</Text>
                  </View>
                </View>
                <View style={styles.controlsWrapper}>
                  <View style={[styles.controls, styles.iconLayout]}>
                    <Chevrondown1
                      style={[styles.chevronDownIcon, styles.iconLayout1]}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.borderTop} />
          <View style={styles.dadosDaConta}>
            <View style={[styles.opes, styles.opesSpaceBlock]}>
              <View style={[styles.dataParent, styles.dataFlexBox]}>
                <View style={[styles.data, styles.dataFlexBox]}>
                  <View style={styles.currencyType}>
                    <Text style={styles.perfil10Data}>Termos e Politicas</Text>
                  </View>
                </View>
                <View style={styles.controlsWrapper}>
                  <View style={[styles.controls, styles.iconLayout]}>
                    <Chevrondown1
                      style={[styles.chevronDownIcon, styles.iconLayout1]}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.contentChild} />
          <ImageBackground
            style={styles.cardPassosMgicos}
            resizeMode="cover"
            source={require("../assets/Card-Passos-M-gicos.png")}
          >
            <View style={styles.mdsPublicTwTagParent}>
              <View style={[styles.mdsPublicTwTag, styles.mdsSpaceBlock]}>
                <Text style={styles.labelText}>Responsabilidade Social</Text>
              </View>
              <Text style={[styles.buttonText, styles.olJooTypo]}>
                Passos Mágicos
              </Text>
              <Text style={[styles.perfil10ButtonText, styles.menuItemTypo]}>
                Participe de uma de nossas ações. Interagindo com nossos alunos,
                compartilhando experiências e conhecimento
              </Text>
            </View>
          </ImageBackground>
          <View style={styles.mdsPublicTwTabsWrapper}>
            <View style={[styles.mdsPublicTwTabs, styles.mdsSpaceBlock]}>
              <Text style={styles.tabText}>Sair do app</Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.menuDeNavegao10}>
          <View style={[styles.item, styles.itemLayout]}>
            <View style={styles.tipo}>
              <Home02
                style={[styles.home02Icon, styles.iconLayout]}
                width={Width.width_24}
                height={Height.height_24}
              />
              <Text style={[styles.nome, styles.nomeTypo]}>Home</Text>
              <Ellipse11
                style={[styles.tipoChild, styles.tipoPosition]}
                width={Width.width_8}
                height={Height.height_8}
              />
            </View>
            <View style={[styles.marcador, styles.marcadorLayout]} />
          </View>
          <View style={[styles.perfil10Item, styles.itemLayout]}>
            <View style={styles.perfil10Tipo}>
              <View style={[styles.menu1, styles.menu1FlexBox]}>
                <View
                  style={[styles.leadingElementAvatarIcon, styles.iconLayout]}
                >
                  <Home2 style={[styles.homeIcon, styles.iconLayout1]} />
                </View>
                <Text style={[styles.menuItemText, styles.menuItemTypo]}>
                  Home
                </Text>
              </View>
              <Ellipse11
                style={[styles.tipoItem, styles.tipoPosition]}
                width={Width.width_8}
                height={Height.height_8}
              />
            </View>
          </View>
          <View style={[styles.item2, styles.itemLayout]}>
            <View style={styles.perfil10Tipo}>
              <View style={[styles.menu1, styles.menu1FlexBox]}>
                <View
                  style={[styles.leadingElementAvatarIcon, styles.iconLayout]}
                >
                  <Calendardate2
                    style={[styles.calendarDateIcon, styles.iconLayout1]}
                  />
                </View>
                <Text style={[styles.menuItemText, styles.menuItemTypo]}>
                  Reserva
                </Text>
              </View>
              <Ellipse11
                style={[styles.tipoItem, styles.tipoPosition]}
                width={Width.width_8}
                height={Height.height_8}
              />
            </View>
          </View>
          <View style={[styles.item3, styles.itemLayout]}>
            <View style={styles.perfil10Tipo}>
              <View style={[styles.menu1, styles.menu1FlexBox]}>
                <View
                  style={[styles.leadingElementAvatarIcon, styles.iconLayout]}
                >
                  <Users1 style={[styles.usersIcon, styles.iconLayout1]} />
                </View>
                <Text style={[styles.menuItemText2, styles.menuItemTypo]}>
                  Comunidade
                </Text>
              </View>
              <Ellipse11
                style={[styles.tipoItem, styles.tipoPosition]}
                width={Width.width_8}
                height={Height.height_8}
              />
            </View>
          </View>
          <View style={[styles.item4, styles.itemLayout]}>
            <View style={styles.perfil10Tipo}>
              <View style={[styles.menu1, styles.menu1FlexBox]}>
                <View
                  style={[styles.leadingElementAvatarIcon, styles.iconLayout]}
                >
                  <User1 style={[styles.userIcon, styles.iconLayout1]} />
                </View>
                <Text style={[styles.menuItemText3, styles.menuItemTypo]}>
                  Perfil
                </Text>
              </View>
              <Ellipse11
                style={[styles.tipoItem, styles.tipoPosition]}
                width={Width.width_8}
                height={Height.height_8}
              />
            </View>
          </View>
          <View style={[styles.perfil10Marcador, styles.marcadorLayout]} />
          <View style={[styles.item5, styles.itemLayout]}>
            <View style={styles.tipo5}>
              <Building02
                style={[styles.building02Icon, styles.iconLayout]}
                width={Width.width_24}
                height={Height.height_24}
              />
              <Text style={[styles.perfil10Nome, styles.nomeTypo]}>
                Serviços
              </Text>
              <Ellipse11
                style={[styles.tipoChild, styles.tipoPosition]}
                width={Width.width_8}
                height={Height.height_8}
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contentContainerContent: {
    flexDirection: "column",
    paddingHorizontal: 24,
    paddingVertical: 0,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  perfil10: {
    backgroundColor: Color.white,
    flex: 1,
  },
  opesSpaceBlock: {
    paddingHorizontal: Padding.padding_24,
    backgroundColor: Color.mainGohan,
  },
  menu1FlexBox: {
    gap: Gap.gap_3,
    alignItems: "center",
  },
  barPosition: {
    width: Width.width_3_2,
    borderRadius: Border.br_1,
    left: "50%",
    top: "50%",
    backgroundColor: Color.hit,
    position: "absolute",
  },
  dataFlexBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleSpaceBlock: {
    paddingHorizontal: Padding.padding_0,
    flexDirection: "row",
  },
  olJooTypo: {
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
    lineHeight: LineHeight.lh_32,
  },
  badgesPosition: {
    top: 0,
    position: "absolute",
  },
  badgeLayout: {
    height: Height.height_20,
    borderWidth: 4,
    borderColor: Color.mainGoku,
    backgroundColor: Color.supportiveRoshi,
    borderRadius: Border.br_100,
    borderStyle: "solid",
    display: "none",
    position: "absolute",
    width: Width.width_20,
  },
  iconLayout1: {
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden",
  },
  iconLayout: {
    width: Width.width_24,
    height: Height.height_24,
  },
  mdsSpaceBlock: {
    paddingVertical: StyleVariable.py1,
    paddingHorizontal: StyleVariable.px2,
    overflow: "hidden",
  },
  menuItemTypo: {
    fontFamily: FontFamily.dMSansRegular,
    lineHeight: LineHeight.lh_16,
    fontSize: FontSize.fs_12,
  },
  itemLayout: {
    width: Width.width_72,
    height: Height.height_80,
    justifyContent: "center",
    alignItems: "center",
  },
  nomeTypo: {
    fontFamily: FontFamily.robotoRegular,
    lineHeight: LineHeight.lh_18,
    zIndex: 1,
    fontSize: FontSize.fs_14,
    textAlign: "center",
  },
  tipoPosition: {
    color: Color.tokenColorStatusError,
    left: 38,
    height: Height.height_8,
    width: Width.width_8,
    top: 0,
    position: "absolute",
  },
  marcadorLayout: {
    borderRadius: Border.br_24,
    height: Height.height_4,
    width: Width.width_16,
    top: 0,
    position: "absolute",
  },
  view: {
    height: Height.height_812,
    overflow: "hidden",
    backgroundColor: Color.mainGohan,
    width: "100%",
    flex: 1,
  },
  topHeader20: {
    paddingBottom: Padding.padding_16,
    width: Width.width_375,
  },
  statusBar: {
    paddingTop: Padding.padding_16,
    paddingBottom: Padding.padding_8,
    gap: Gap.gap_20,
    justifyContent: "space-between",
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
    paddingHorizontal: Padding.padding_0,
    flexDirection: "row",
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
  titleWrapper: {
    justifyContent: "center",
    alignSelf: "stretch",
    alignItems: "center",
  },
  title: {
    paddingVertical: Padding.padding_16,
    justifyContent: "center",
    flex: 1,
  },
  olJoo: {
    textAlign: "left",
    fontSize: FontSize.fs_24,
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
    lineHeight: LineHeight.lh_32,
    color: Color.hit,
    flex: 1,
  },
  illustrationIcon: {
    width: Width.width_80,
    height: 96,
    display: "none",
  },
  mdsPublicTwAvatarParent: {
    width: 64,
    height: 70,
  },
  mdsPublicTwAvatarIcon: {
    left: 0,
    borderRadius: StyleVariable.surfaceBorderRadiusRadiusSRounded,
    width: StyleVariable.heightH16,
    height: StyleVariable.heightH16,
  },
  initials: {
    top: 8,
    left: 8,
    fontSize: 20,
    display: "flex",
    width: 48,
    height: 48,
    textAlign: "center",
    color: Color.mainBulma,
    justifyContent: "center",
    position: "absolute",
    alignItems: "center",
  },
  badges: {
    right: 12,
    width: 0,
    height: 0,
  },
  badgeTr: {
    top: -4,
  },
  badgeBl: {
    top: 48,
  },
  generic: {
    height: "34.29%",
    width: "37.5%",
    top: "65.71%",
    right: "0%",
    bottom: "0%",
    left: "62.5%",
    borderRadius: Border.br_8,
    position: "absolute",
    backgroundColor: Color.mainGohan,
  },
  vectorIcon: {
    left: "20.42%",
    maxWidth: "100%",
    bottom: "20%",
    top: "20.42%",
    height: "59.58%",
    right: "20%",
    width: "59.58%",
    color: Color.mainBulma,
  },
  content: {
    maxWidth: 375,
    width: Width.width_375,
    flex: 1,
  },
  dadosDaConta: {
    width: Width.width_375,
  },
  opes: {
    paddingVertical: Padding.padding_8,
    alignSelf: "stretch",
  },
  dataParent: {
    width: 312,
    height: 56,
    alignItems: "center",
  },
  data: {
    alignSelf: "stretch",
    alignItems: "center",
  },
  currencyType: {
    width: 307,
    justifyContent: "center",
    alignSelf: "stretch",
  },
  perfil10Data: {
    fontSize: FontSize.fs_16,
    lineHeight: LineHeight.lh_24,
    textAlign: "left",
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
    alignSelf: "stretch",
    color: Color.hit,
  },
  controlsWrapper: {
    width: Width.width_32,
    marginLeft: -27,
    height: Height.height_32,
  },
  controls: {
    top: 4,
    left: 4,
    height: Height.height_24,
    position: "absolute",
  },
  chevronDownIcon: {
    height: "37.5%",
    width: "18.75%",
    top: "31.25%",
    right: "40.42%",
    bottom: "31.25%",
    left: "40.83%",
    color: Color.mainBulma,
  },
  borderTop: {
    height: 1,
    backgroundColor: Color.mainGoku,
    alignSelf: "stretch",
  },
  contentChild: {
    height: Height.height_24,
    alignSelf: "stretch",
    overflow: "hidden",
  },
  cardPassosMgicos: {
    borderRadius: Border.br_16,
    paddingHorizontal: Padding.padding_16,
    paddingTop: Padding.padding_8,
    width: Width.width_327,
    paddingBottom: Padding.padding_16,
  },
  mdsPublicTwTagParent: {
    gap: Gap.gap_8,
    alignSelf: "stretch",
  },
  mdsPublicTwTag: {
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusIXs,
    backgroundColor: Color.colorSteelblue,
    alignItems: "center",
  },
  labelText: {
    color: Color.white,
    lineHeight: LineHeight.lh_16,
    fontSize: FontSize.fs_12,
    textAlign: "center",
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
  },
  buttonText: {
    color: Color.white,
    textAlign: "left",
    fontSize: FontSize.fs_24,
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
    lineHeight: LineHeight.lh_32,
    alignSelf: "stretch",
  },
  perfil10ButtonText: {
    color: Color.white,
    textAlign: "left",
    alignSelf: "stretch",
  },
  mdsPublicTwTabsWrapper: {
    paddingTop: Padding.padding_32,
  },
  mdsPublicTwTabs: {
    height: Height.height_32,
    justifyContent: "center",
    width: Width.width_327,
  },
  tabText: {
    fontSize: FontSize.fs_14,
    lineHeight: LineHeight.lh_24,
    color: Color.mainBulma,
    textAlign: "left",
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
  },
  menuDeNavegao10: {
    borderColor: Color.colorGainsboro,
    borderTopWidth: 1,
    paddingHorizontal: StyleVariable.padding24,
    paddingBottom: StyleVariable.padding8,
    gap: -52,
    borderStyle: "solid",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    width: Width.width_375,
    backgroundColor: Color.mainGohan,
  },
  item: {
    gap: Gap.gap_24,
    zIndex: 0,
    display: "none",
  },
  tipo: {
    zIndex: 0,
    gap: Gap.gap_8,
    alignSelf: "stretch",
    alignItems: "center",
  },
  home02Icon: {
    color: Color.tokenColorBrandPrimaryPrimary,
    zIndex: 0,
    height: Height.height_24,
  },
  nome: {
    zIndex: 1,
    color: Color.hit,
  },
  tipoChild: {
    zIndex: 2,
  },
  marcador: {
    left: 28,
    backgroundColor: Color.tokenColorBrandPrimaryPrimary,
    zIndex: 1,
  },
  perfil10Item: {
    zIndex: 1,
  },
  perfil10Tipo: {
    gap: Gap.gap_4,
    alignItems: "center",
    width: "100%",
  },
  menu1: {
    width: Width.width_54,
    height: Height.height_51,
    zIndex: 0,
  },
  leadingElementAvatarIcon: {
    height: Height.height_24,
  },
  homeIcon: {
    color: Color.mainBeerus,
    left: "20.42%",
    maxWidth: "100%",
    bottom: "20%",
    top: "20.42%",
    height: "59.58%",
    right: "20%",
    width: "59.58%",
  },
  menuItemText: {
    color: Color.mainBeerus,
    textAlign: "center",
  },
  tipoItem: {
    zIndex: 1,
  },
  item2: {
    zIndex: 2,
  },
  calendarDateIcon: {
    width: "59.17%",
    right: "20.42%",
    color: Color.mainBeerus,
    left: "20.42%",
    maxWidth: "100%",
    bottom: "20%",
    top: "20.42%",
    height: "59.58%",
  },
  item3: {
    zIndex: 3,
  },
  usersIcon: {
    height: "50%",
    top: "25%",
    bottom: "25%",
    color: Color.jiren,
    left: "20.42%",
    maxWidth: "100%",
    right: "20%",
    width: "59.58%",
  },
  menuItemText2: {
    color: Color.jiren,
    textAlign: "center",
  },
  item4: {
    zIndex: 4,
  },
  userIcon: {
    width: "55%",
    right: "22.5%",
    left: "22.5%",
    bottom: "20%",
    top: "20.42%",
    height: "59.58%",
    color: Color.hit,
  },
  menuItemText3: {
    textAlign: "center",
    color: Color.hit,
  },
  perfil10Marcador: {
    left: 307,
    zIndex: 5,
    backgroundColor: Color.hit,
    borderRadius: Border.br_24,
    height: Height.height_4,
    width: Width.width_16,
  },
  item5: {
    zIndex: 6,
    display: "none",
  },
  tipo5: {
    gap: Gap.gap_8,
    alignItems: "center",
    width: "100%",
  },
  building02Icon: {
    color: Color.tokenColorNeutralMedium,
    zIndex: 0,
    height: Height.height_24,
  },
  perfil10Nome: {
    color: Color.tokenColorNeutralMedium,
    zIndex: 1,
  },
});

export default Perfil101;
