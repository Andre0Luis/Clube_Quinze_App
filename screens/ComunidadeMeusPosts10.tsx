import * as React from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import Time from "../assets/Time.svg";
import NetworkWiFiFull from "../assets/Network-WiFi-Full.svg";
import Illustration from "../assets/Illustration.svg";
import Vector70 from "../assets/Vector-70.svg";
import Vector from "../assets/Vector.svg";
import Icfluentchevrondown24regular1 from "../assets/ic-fluent-chevron-down-24-regular-1.svg";
import Vector2 from "../assets/Vector2.svg";
import Vector1 from "../assets/Vector1.svg";
import Group543 from "../assets/Group-543.svg";
import Home02 from "../assets/home-02.svg";
import Ellipse11 from "../assets/Ellipse-11.svg";
import Home1 from "../assets/home1.svg";
import Calendardate from "../assets/calendar-date.svg";
import Users2 from "../assets/users2.svg";
import User from "../assets/user.svg";
import Building02 from "../assets/building-02.svg";
import {
  Color,
  Padding,
  Width,
  Gap,
  Border,
  StyleVariable,
  LineHeight,
  FontSize,
  FontFamily,
  Height,
} from "../GlobalStyles";

const ComunidadeMeusPosts10 = () => {
  return (
    <SafeAreaView style={styles.comunidadeMeusPosts10}>
      <View style={styles.view}>
        <View style={[styles.topHeader20, styles.topHeader20SpaceBlock]}>
          <View style={[styles.statusBar, styles.statusBarFlexBox]}>
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
          <View style={styles.titleWrapper}>
            <View style={[styles.title, styles.titleSpaceBlock]}>
              <Text style={[styles.comunidadeQuinze, styles.tabTextFlexBox]}>
                Comunidade Quinze
              </Text>
            </View>
          </View>
          <Illustration
            style={styles.illustrationIcon}
            width={Width.width_80}
            height={96}
          />
        </View>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainerContent}
        >
          <View style={styles.mdsPublicTwSegmentedContro}>
            <View style={[styles.mdsPublicTwTabs, styles.mdsSpaceBlock]}>
              <Text style={[styles.tabText, styles.textTypo]}>Meus posts</Text>
            </View>
            <View
              style={[
                styles.comunidadeMeusPosts10MdsPublicTwTabs,
                styles.mdsSpaceBlock,
              ]}
            >
              <Text style={[styles.tabText, styles.textTypo]}>
                Minha comunidade
              </Text>
            </View>
          </View>
          <View style={[styles.frameParent, styles.topHeader20SpaceBlock]}>
            <View style={[styles.frameWrapper, styles.frameWrapperBorder]}>
              <View style={styles.frameGroup}>
                <View style={styles.image205Parent}>
                  <Image
                    style={styles.image205Icon}
                    contentFit="cover"
                    source={require("../assets/image-206.png")}
                  />
                  <Text style={[styles.escrevaSuaPostagem, styles.suaTypo]}>
                    Escreva sua postagem aqui
                  </Text>
                </View>
                <Vector70
                  style={[styles.frameChild, styles.userIconLayout]}
                  height={Height.height_1}
                />
                <View
                  style={[styles.frameContainer, styles.frameContainerFlexBox]}
                >
                  <View style={styles.frameView}>
                    <View style={[styles.vectorParent, styles.tipoFlexBox1]}>
                      <Vector
                        style={[styles.vectorIcon, styles.vectorIconLayout]}
                        width={14}
                        height={14}
                      />
                      <Text
                        style={[styles.adicioneSuaPostagem, styles.hoje0600Clr]}
                      >
                        Adicione sua postagem em
                      </Text>
                      <Icfluentchevrondown24regular1
                        style={styles.icFluentChevronDown24ReguIcon}
                        width={16}
                        height={16}
                      />
                    </View>
                  </View>
                  <View style={styles.mdsPublicTwButton}>
                    <Text style={[styles.buttonText, styles.textTypo]}>
                      Publicar
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={[styles.frameWrapper, styles.frameWrapperBorder]}>
              <View style={styles.comunidadeMeusPosts10FrameParent}>
                <View style={styles.frameParent2}>
                  <View style={styles.image205Parent}>
                    <Image
                      style={styles.image205Icon}
                      contentFit="cover"
                      source={require("../assets/image-206.png")}
                    />
                    <View>
                      <Text style={[styles.tabText, styles.textTypo]}>
                        Quinze
                      </Text>
                    </View>
                  </View>
                  <View style={styles.hoje0600Wrapper}>
                    <Text style={[styles.hoje0600, styles.menuItemTypo]}>
                      Hoje - 06:00
                    </Text>
                  </View>
                </View>
                <Text style={[styles.vocSabiaQue, styles.menuItemTypo]}>
                  Você sabia que segundo o calendário MAIA, hoje é ”um dia fora
                  do tempo” ?!
                </Text>
                <Vector70
                  style={[styles.frameChild, styles.userIconLayout]}
                  height={Height.height_1}
                />
                <View style={[styles.frameParent3, styles.statusBarFlexBox]}>
                  <View style={styles.frameParent4}>
                    <View style={[styles.vectorGroup, styles.groupFlexBox]}>
                      <Vector2
                        style={styles.comunidadeMeusPosts10VectorIcon}
                        width={16}
                        height={14}
                      />
                      <Text style={[styles.escrevaSuaPostagem, styles.suaTypo]}>
                        16
                      </Text>
                    </View>
                    <View style={[styles.vectorGroup, styles.groupFlexBox]}>
                      <Vector1
                        style={[styles.vectorIcon2, styles.vectorIconLayout]}
                        width={14}
                        height={14}
                      />
                      <Text style={[styles.escrevaSuaPostagem, styles.suaTypo]}>
                        03
                      </Text>
                    </View>
                  </View>
                  <View style={styles.groupFlexBox}>
                    <Group543
                      style={styles.frameInner}
                      width={12}
                      height={12}
                    />
                    <Text style={[styles.escrevaSuaPostagem, styles.suaTypo]}>
                      Compartilhar
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={[styles.menuDeNavegao10, styles.frameWrapperBorder]}>
          <View style={[styles.item, styles.itemLayout]}>
            <View style={[styles.tipo, styles.tipoFlexBox]}>
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
            <View style={[styles.marcador, styles.marcadorPosition]} />
          </View>
          <View style={styles.itemLayout1}>
            <View
              style={[styles.comunidadeMeusPosts10Tipo, styles.tipoFlexBox1]}
            >
              <View style={[styles.menu1, styles.menu1FlexBox]}>
                <View style={styles.iconLayout}>
                  <Home1 style={[styles.homeIcon, styles.iconPosition]} />
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
          <View style={styles.itemLayout1}>
            <View
              style={[styles.comunidadeMeusPosts10Tipo, styles.tipoFlexBox1]}
            >
              <View style={[styles.menu1, styles.menu1FlexBox]}>
                <View style={styles.iconLayout}>
                  <Calendardate
                    style={[styles.calendarDateIcon, styles.iconPosition]}
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
          <View style={styles.itemLayout}>
            <View style={[styles.tipo3, styles.tipoFlexBox1]}>
              <View style={[styles.menu1, styles.menu1FlexBox]}>
                <View style={styles.iconLayout}>
                  <Users2 style={[styles.usersIcon, styles.iconPosition]} />
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
            <View
              style={[
                styles.comunidadeMeusPosts10Marcador,
                styles.marcadorPosition,
              ]}
            />
          </View>
          <View style={styles.itemLayout1}>
            <View
              style={[styles.comunidadeMeusPosts10Tipo, styles.tipoFlexBox1]}
            >
              <View style={[styles.menu1, styles.menu1FlexBox]}>
                <View style={styles.iconLayout}>
                  <User style={[styles.userIcon, styles.iconPosition1]} />
                </View>
                <Text style={[styles.menuItemText, styles.menuItemTypo]}>
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
          <View style={[styles.item5, styles.itemLayout1]}>
            <View style={[styles.tipo5, styles.tipoFlexBox]}>
              <Building02
                style={[styles.building02Icon, styles.iconLayout]}
                width={Width.width_24}
                height={Height.height_24}
              />
              <Text style={[styles.comunidadeMeusPosts10Nome, styles.nomeTypo]}>
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
    paddingTop: 8,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 24,
  },
  comunidadeMeusPosts10: {
    backgroundColor: Color.mainGohan,
    flex: 1,
  },
  topHeader20SpaceBlock: {
    paddingHorizontal: Padding.padding_24,
    width: Width.width_375,
  },
  statusBarFlexBox: {
    gap: Gap.gap_20,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
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
  titleSpaceBlock: {
    paddingHorizontal: Padding.padding_0,
    flexDirection: "row",
  },
  tabTextFlexBox: {
    textAlign: "left",
    color: Color.hit,
  },
  mdsSpaceBlock: {
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
    borderRadius: Border.br_8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  textTypo: {
    lineHeight: LineHeight.lh_24,
    fontSize: FontSize.fs_14,
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
  },
  frameWrapperBorder: {
    borderStyle: "solid",
    backgroundColor: Color.mainGohan,
  },
  suaTypo: {
    fontFamily: FontFamily.dMSansRegular,
    lineHeight: LineHeight.lh_24,
    fontSize: FontSize.fs_14,
  },
  userIconLayout: {
    maxHeight: "100%",
    maxWidth: "100%",
    overflow: "hidden",
  },
  frameContainerFlexBox: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  tipoFlexBox1: {
    gap: Gap.gap_4,
    alignItems: "center",
  },
  vectorIconLayout: {
    width: 14,
    height: 14,
  },
  hoje0600Clr: {
    color: Color.mainTrunks,
    textAlign: "left",
  },
  menuItemTypo: {
    lineHeight: LineHeight.lh_16,
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansRegular,
  },
  groupFlexBox: {
    gap: 8,
    alignItems: "center",
    flexDirection: "row",
  },
  itemLayout: {
    gap: Gap.gap_24,
    width: Width.width_72,
    height: Height.height_80,
    justifyContent: "center",
    alignItems: "center",
  },
  tipoFlexBox: {
    gap: Gap.gap_8,
    alignItems: "center",
  },
  iconLayout: {
    height: Height.height_24,
    width: Width.width_24,
  },
  nomeTypo: {
    fontFamily: FontFamily.robotoRegular,
    lineHeight: LineHeight.lh_18,
    zIndex: 1,
    textAlign: "center",
    fontSize: FontSize.fs_14,
  },
  tipoPosition: {
    color: Color.tokenColorStatusError,
    left: 38,
    top: 0,
    height: Height.height_8,
    width: Width.width_8,
    position: "absolute",
  },
  marcadorPosition: {
    borderRadius: Border.br_24,
    left: 28,
    height: Height.height_4,
    width: Width.width_16,
    top: 0,
    zIndex: 1,
    position: "absolute",
  },
  iconPosition: {
    left: "20.42%",
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden",
  },
  iconPosition1: {
    bottom: "20%",
    top: "20.42%",
    height: "59.58%",
    color: Color.jiren,
  },
  itemLayout1: {
    width: Width.width_72,
    height: Height.height_80,
    justifyContent: "center",
    alignItems: "center",
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
    width: Width.width_327,
    paddingTop: Padding.padding_16,
    paddingBottom: Padding.padding_8,
  },
  timeIcon: {
    width: 27,
    color: Color.hit,
    height: 12,
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
    flexDirection: "row",
  },
  title: {
    paddingVertical: Padding.padding_16,
    justifyContent: "center",
    flex: 1,
  },
  comunidadeQuinze: {
    fontSize: FontSize.fs_24,
    lineHeight: LineHeight.lh_32,
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
    textAlign: "left",
    flex: 1,
  },
  illustrationIcon: {
    width: Width.width_80,
    height: 96,
    display: "none",
  },
  content: {
    maxWidth: 375,
    width: Width.width_375,
    flex: 1,
  },
  mdsPublicTwSegmentedContro: {
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusIMd,
    padding: StyleVariable.px1,
    gap: StyleVariable.gap1,
    maxHeight: StyleVariable.heightH12,
    backgroundColor: Color.mainGoku,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  mdsPublicTwTabs: {
    backgroundColor: Color.white,
  },
  tabText: {
    textAlign: "left",
    color: Color.hit,
  },
  comunidadeMeusPosts10MdsPublicTwTabs: {
    backgroundColor: Color.mainGoku,
  },
  frameParent: {
    paddingVertical: 6,
    gap: 16,
  },
  frameWrapper: {
    borderColor: Color.piccolo,
    borderWidth: 1,
    padding: 14,
    borderRadius: Border.br_8,
    borderStyle: "solid",
    alignSelf: "stretch",
  },
  frameGroup: {
    gap: 14,
    alignSelf: "stretch",
  },
  image205Parent: {
    gap: 12,
    alignItems: "center",
    flexDirection: "row",
  },
  image205Icon: {
    height: Height.height_32,
    width: Width.width_32,
    borderRadius: Border.br_18,
  },
  escrevaSuaPostagem: {
    textAlign: "left",
    color: Color.hit,
  },
  frameChild: {
    height: Height.height_1,
    color: Color.piccolo,
    alignSelf: "stretch",
  },
  frameContainer: {
    gap: 3,
    alignSelf: "stretch",
  },
  frameView: {
    justifyContent: "center",
    alignItems: "center",
  },
  vectorParent: {
    justifyContent: "center",
    flexDirection: "row",
  },
  vectorIcon: {
    color: Color.lightTextTertiary,
  },
  adicioneSuaPostagem: {
    fontFamily: FontFamily.dMSansRegular,
    lineHeight: LineHeight.lh_24,
    fontSize: FontSize.fs_14,
  },
  icFluentChevronDown24ReguIcon: {
    height: 16,
    width: 16,
  },
  mdsPublicTwButton: {
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    backgroundColor: Color.piccolo,
    paddingHorizontal: StyleVariable.paddingsGapsP3,
    paddingVertical: StyleVariable.paddingsGapsP1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
  },
  buttonText: {
    color: Color.mainGoten,
    textAlign: "center",
  },
  comunidadeMeusPosts10FrameParent: {
    gap: 16,
    alignSelf: "stretch",
  },
  frameParent2: {
    gap: Gap.gap_16,
    justifyContent: "center",
    alignSelf: "stretch",
    alignItems: "center",
    flexDirection: "row",
  },
  hoje0600Wrapper: {
    justifyContent: "flex-end",
    flexDirection: "row",
    flex: 1,
  },
  hoje0600: {
    color: Color.mainTrunks,
    textAlign: "left",
  },
  vocSabiaQue: {
    textAlign: "left",
    color: Color.hit,
    alignSelf: "stretch",
  },
  frameParent3: {
    alignSelf: "stretch",
  },
  frameParent4: {
    gap: 16,
    flexDirection: "row",
  },
  vectorGroup: {
    justifyContent: "center",
  },
  comunidadeMeusPosts10VectorIcon: {
    color: Color.supportiveChichi,
    width: 16,
    height: 14,
  },
  vectorIcon2: {
    color: Color.hit,
  },
  frameInner: {
    width: 12,
    height: 12,
  },
  menuDeNavegao10: {
    borderColor: Color.colorGainsboro,
    borderTopWidth: 1,
    paddingHorizontal: StyleVariable.padding24,
    paddingBottom: StyleVariable.padding8,
    gap: -52,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    width: Width.width_375,
  },
  item: {
    display: "none",
  },
  tipo: {
    zIndex: 0,
    alignSelf: "stretch",
  },
  home02Icon: {
    color: Color.tokenColorBrandPrimaryPrimary,
    zIndex: 0,
  },
  nome: {
    zIndex: 1,
    color: Color.hit,
  },
  tipoChild: {
    zIndex: 2,
  },
  marcador: {
    backgroundColor: Color.tokenColorBrandPrimaryPrimary,
  },
  comunidadeMeusPosts10Tipo: {
    width: "100%",
  },
  menu1: {
    width: Width.width_54,
    height: Height.height_51,
    zIndex: 0,
  },
  homeIcon: {
    color: Color.jiren,
    bottom: "20%",
    top: "20.42%",
    height: "59.58%",
    right: "20%",
    width: "59.58%",
    left: "20.42%",
  },
  menuItemText: {
    color: Color.jiren,
    textAlign: "center",
  },
  tipoItem: {
    zIndex: 1,
  },
  calendarDateIcon: {
    width: "59.17%",
    right: "20.42%",
    color: Color.jiren,
    bottom: "20%",
    top: "20.42%",
    height: "59.58%",
  },
  tipo3: {
    zIndex: 0,
    alignSelf: "stretch",
  },
  usersIcon: {
    height: "50%",
    top: "25%",
    bottom: "25%",
    right: "20%",
    width: "59.58%",
    left: "20.42%",
    color: Color.hit,
  },
  menuItemText2: {
    textAlign: "center",
    color: Color.hit,
  },
  comunidadeMeusPosts10Marcador: {
    backgroundColor: Color.hit,
    borderRadius: Border.br_24,
    left: 28,
    height: Height.height_4,
    width: Width.width_16,
  },
  userIcon: {
    width: "55%",
    right: "22.5%",
    left: "22.5%",
    color: Color.jiren,
    maxHeight: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    position: "absolute",
    top: "20.42%",
    height: "59.58%",
  },
  item5: {
    display: "none",
  },
  tipo5: {
    width: "100%",
  },
  building02Icon: {
    color: Color.tokenColorNeutralMedium,
    zIndex: 0,
  },
  comunidadeMeusPosts10Nome: {
    color: Color.tokenColorNeutralMedium,
    zIndex: 1,
  },
});

export default ComunidadeMeusPosts10;
