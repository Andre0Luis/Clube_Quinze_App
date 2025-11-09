import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ImageBackground,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import Cap from "../assets/Cap.svg";
import Wifipath3 from "../assets/Wifi-path.svg";
import Wifipath4 from "../assets/Wifi-path.svg";
import Wifipath5 from "../assets/Wifi-path.svg";
import CellularConnection from "../assets/Cellular-Connection.svg";
import Bell from "../assets/bell.svg";
import Calendar from "../assets/calendar.svg";
import Topright1 from "../assets/top-right1.svg";
import Calendaradd from "../assets/calendar-add.svg";
import Time1 from "../assets/time1.svg";
import Users from "../assets/users.svg";
import Topright2 from "../assets/top-right2.svg";
import Home02 from "../assets/home-02.svg";
import Ellipse11 from "../assets/Ellipse-11.svg";
import Home from "../assets/home.svg";
import Calendardate from "../assets/calendar-date.svg";
import Users1 from "../assets/users1.svg";
import User from "../assets/user.svg";
import Building02 from "../assets/building-02.svg";
import {
  Color,
  FontFamily,
  StyleVariable,
  Border,
  Gap,
  LineHeight,
  FontSize,
  Width,
  Height,
  Padding,
} from "../GlobalStyles";

const Home10 = () => {
  return (
    <SafeAreaView style={styles.home10}>
      <View style={styles.view}>
        <View style={styles.statusBar}>
          <View style={[styles.battery, styles.batteryPosition]}>
            <View style={styles.border} />
            <Cap style={styles.capIcon} width={1} height={Height.height_4} />
            <View style={styles.capacity} />
          </View>
          <View style={styles.wifi}>
            <Wifipath3
              style={[styles.wifiPathIcon, styles.batteryPosition]}
              width={15}
              height={5}
            />
            <Wifipath4
              style={styles.home10WifiPathIcon}
              width={10}
              height={4}
            />
            <Wifipath5 style={styles.wifiPathIcon2} width={5} height={3} />
          </View>
          <CellularConnection
            style={styles.cellularConnectionIcon}
            width={17}
            height={11}
          />
          <View style={styles.timeStyle}>
            <Text style={[styles.time, styles.timePosition]}>9:41</Text>
          </View>
        </View>
        <View style={styles.frameParent}>
          <View style={[styles.frameGroup, styles.frameGroupFlexBox]}>
            <View style={styles.logoQuinzeNovoAzulParent}>
              <Image
                style={styles.logoQuinzeNovoAzulIcon}
                contentFit="cover"
                source={require("../assets/logo-quinze-novo-azul.png")}
              />
              <Text style={[styles.buttonText, styles.buttonTypo1]}>
                Clube Quinze
              </Text>
            </View>
            <View style={styles.notificationsWrapper}>
              <View style={[styles.notifications, styles.timePosition]}>
                <Bell style={[styles.bellIcon, styles.iconLayout1]} />
              </View>
            </View>
          </View>
          <Text style={[styles.olJoo, styles.buttonFlexBox]}>Olá, João 👋</Text>
        </View>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainerContent}
        >
          <View style={[styles.card, styles.cardBorder]}>
            <View style={[styles.frameGroup, styles.frameGroupFlexBox]}>
              <View style={styles.notificationsWrapper}>
                <View style={[styles.notifications, styles.timePosition]}>
                  <Calendar
                    style={[styles.calendarIcon, styles.iconPosition4]}
                  />
                </View>
              </View>
              <View style={[styles.mdsPublicTwTag, styles.mdsSpaceBlock]}>
                <Text style={[styles.labelText, styles.labelItemTypo]}>
                  Agendado
                </Text>
              </View>
            </View>
            <Text style={[styles.home10ButtonText, styles.buttonTypo]}>
              Seu próximo cuidado pessoal
            </Text>
            <View style={styles.labelTextWrapper}>
              <Text style={[styles.home10LabelText, styles.labelItemTypo]}>
                Sexta-feira, 17 de Junho - 15:30
              </Text>
            </View>
            <View style={styles.mdsPublicTwTabs}>
              <Text style={[styles.tabText, styles.tabTypo]}>Ver detalhes</Text>
              <View style={styles.iconLayout}>
                <Topright1
                  style={[styles.topRightIcon, styles.topIconPosition]}
                />
              </View>
            </View>
          </View>
          <View style={styles.cardParent}>
            <View style={[styles.home10Card, styles.cardBorder]}>
              <View style={styles.labelTextWrapper}>
                <View style={styles.notificationsWrapper}>
                  <View style={[styles.notifications, styles.timePosition]}>
                    <Calendaradd style={styles.calendarAddIcon} />
                  </View>
                </View>
              </View>
              <Text style={[styles.buttonText2, styles.buttonFlexBox]}>
                Meus agendamentos
              </Text>
            </View>
            <View style={[styles.home10Card, styles.cardBorder]}>
              <View style={styles.labelTextWrapper}>
                <View style={styles.notificationsWrapper}>
                  <View style={[styles.notifications, styles.timePosition]}>
                    <Time1
                      style={[styles.calendarIcon, styles.iconPosition4]}
                    />
                  </View>
                </View>
              </View>
              <Text style={[styles.buttonText2, styles.buttonFlexBox]}>
                Meus Históricos
              </Text>
            </View>
          </View>
          <View style={[styles.card3, styles.cardBorder]}>
            <View style={styles.labelTextWrapper}>
              <View style={styles.notificationsWrapper}>
                <View style={[styles.notifications, styles.timePosition]}>
                  <Users style={[styles.usersIcon, styles.usersIconPosition]} />
                </View>
              </View>
            </View>
            <Text style={[styles.buttonText4, styles.buttonTypo]}>
              Comunidade Quinze
            </Text>
            <View style={styles.labelTextWrapper}>
              <Text style={[styles.home10LabelText, styles.labelItemTypo]}>
                Descubra as últimas novidades agora
              </Text>
            </View>
            <View style={styles.mdsPublicTwTabs}>
              <Text style={[styles.home10TabText, styles.tabTypo]}>Entrar</Text>
              <View style={styles.iconLayout}>
                <Topright2
                  style={[styles.home10TopRightIcon, styles.topIconPosition]}
                />
              </View>
            </View>
          </View>
          <ImageBackground
            style={styles.cardPassosMgicos}
            resizeMode="cover"
            source={require("../assets/Card-Passos-M-gicos.png")}
          >
            <View style={styles.mdsPublicTwTagParent}>
              <View style={[styles.home10MdsPublicTwTag, styles.mdsSpaceBlock]}>
                <Text style={styles.labelText3}>Responsabilidade Social</Text>
              </View>
              <Text style={[styles.olJoo, styles.buttonFlexBox]}>
                Passos Mágicos
              </Text>
              <Text style={[styles.buttonText6, styles.labelItemTypo]}>
                Participe de uma de nossas ações. Interagindo com nossos alunos,
                compartilhando experiências e conhecimento
              </Text>
            </View>
          </ImageBackground>
          <ImageBackground
            style={styles.cardQuinzeIcon}
            resizeMode="cover"
            source={require("../assets/Card-Quinze.png")}
          >
            <View style={styles.buttonTextParent}>
              <Text style={[styles.olJoo, styles.buttonFlexBox]}>
                Produtos Quinze
              </Text>
              <Text style={[styles.buttonText6, styles.labelItemTypo]}>
                Descubra a linha que leva o autocuidado masculino a outro nível
              </Text>
            </View>
          </ImageBackground>
        </ScrollView>
        <View style={[styles.menuDeNavegao10, styles.frameGroupFlexBox]}>
          <View style={[styles.item, styles.itemFlexBox]}>
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
            <View style={[styles.marcador, styles.marcadorPosition]} />
          </View>
          <View style={[styles.home10Item, styles.itemFlexBox1]}>
            <View style={[styles.home10Tipo, styles.tipoFlexBox]}>
              <View style={styles.menu1}>
                <View style={styles.iconLayout}>
                  <Home style={[styles.homeIcon, styles.iconPosition]} />
                </View>
                <Text style={[styles.menuItemText, styles.labelItemTypo]}>
                  Home
                </Text>
              </View>
              <Ellipse11
                style={[styles.tipoItem, styles.tipoPosition]}
                width={Width.width_8}
                height={Height.height_8}
              />
            </View>
            <View style={[styles.home10Marcador, styles.marcadorPosition]} />
          </View>
          <View style={styles.itemFlexBox1}>
            <View style={[styles.tipo2, styles.tipoFlexBox]}>
              <View style={styles.menu1}>
                <View style={styles.iconLayout}>
                  <Calendardate
                    style={[styles.calendarDateIcon, styles.iconPosition]}
                  />
                </View>
                <Text style={[styles.home10MenuItemText, styles.labelItemTypo]}>
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
          <View style={styles.itemFlexBox1}>
            <View style={[styles.tipo2, styles.tipoFlexBox]}>
              <View style={styles.menu1}>
                <View style={styles.iconLayout}>
                  <Users1
                    style={[styles.home10UsersIcon, styles.iconPosition]}
                  />
                </View>
                <Text style={[styles.home10MenuItemText, styles.labelItemTypo]}>
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
          <View style={styles.itemFlexBox1}>
            <View style={[styles.tipo2, styles.tipoFlexBox]}>
              <View style={styles.menu1}>
                <View style={styles.iconLayout}>
                  <User style={[styles.userIcon, styles.iconPosition1]} />
                </View>
                <Text style={[styles.home10MenuItemText, styles.labelItemTypo]}>
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
          <View style={styles.itemFlexBox}>
            <View style={styles.tipo5}>
              <Building02
                style={[styles.building02Icon, styles.iconLayout]}
                width={Width.width_24}
                height={Height.height_24}
              />
              <Text style={[styles.home10Nome, styles.nomeTypo]}>Serviços</Text>
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
    paddingTop: 24,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 16,
  },
  home10: {
    backgroundColor: Color.white,
    flex: 1,
  },
  batteryPosition: {
    top: 17,
    position: "absolute",
  },
  timePosition: {
    top: "50%",
    position: "absolute",
  },
  frameGroupFlexBox: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  buttonTypo1: {
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
  },
  iconLayout1: {
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden",
  },
  buttonFlexBox: {
    textAlign: "left",
    alignSelf: "stretch",
  },
  cardBorder: {
    padding: StyleVariable.surfaceBorderRadiusRadiusSLg,
    borderColor: Color.piccolo,
    borderRadius: Border.br_8,
    gap: Gap.gap_8,
    borderWidth: 1,
    borderStyle: "solid",
    overflow: "hidden",
  },
  iconPosition4: {
    left: "20.31%",
    right: "20.31%",
    width: "59.38%",
    maxHeight: "100%",
    maxWidth: "100%",
    color: Color.mainBulma,
    position: "absolute",
    overflow: "hidden",
  },
  mdsSpaceBlock: {
    paddingVertical: StyleVariable.py1,
    paddingHorizontal: StyleVariable.px2,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusIXs,
    alignItems: "center",
    overflow: "hidden",
  },
  labelItemTypo: {
    fontFamily: FontFamily.dMSansRegular,
    lineHeight: LineHeight.lh_16,
    fontSize: FontSize.fs_12,
  },
  buttonTypo: {
    fontSize: FontSize.fs_16,
    textAlign: "left",
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
    lineHeight: LineHeight.lh_24,
  },
  tabTypo: {
    textAlign: "right",
    textDecorationLine: "underline",
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
    lineHeight: LineHeight.lh_24,
    fontSize: FontSize.fs_14,
    flex: 1,
  },
  topIconPosition: {
    left: "18.75%",
    bottom: "18.75%",
    right: "18.75%",
    width: "62.5%",
    height: "62.5%",
    top: "18.75%",
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden",
  },
  usersIconPosition: {
    bottom: "25%",
    top: "25%",
    height: "50%",
  },
  itemFlexBox: {
    display: "none",
    justifyContent: "center",
    width: Width.width_72,
    height: Height.height_80,
    alignItems: "center",
  },
  iconLayout: {
    width: Width.width_24,
    height: Height.height_24,
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
  marcadorPosition: {
    borderRadius: Border.br_24,
    left: 28,
    width: Width.width_16,
    zIndex: 1,
    height: Height.height_4,
    top: 0,
    position: "absolute",
  },
  itemFlexBox1: {
    justifyContent: "center",
    width: Width.width_72,
    height: Height.height_80,
    alignItems: "center",
  },
  tipoFlexBox: {
    gap: Gap.gap_4,
    alignItems: "center",
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
  },
  view: {
    height: 1120,
    overflow: "hidden",
    backgroundColor: Color.mainGohan,
    width: "100%",
    flex: 1,
  },
  statusBar: {
    height: 44,
    backgroundColor: Color.piccolo,
    width: Width.width_375,
  },
  battery: {
    right: 14,
    width: 24,
    height: 11,
  },
  border: {
    right: 2,
    borderRadius: 3,
    borderColor: Color.white,
    width: Width.width_22,
    opacity: 0.35,
    borderWidth: 1,
    top: 0,
    borderStyle: "solid",
    height: 11,
    position: "absolute",
  },
  capIcon: {
    top: 4,
    right: 0,
    width: 1,
    color: Color.mainGohan,
    height: Height.height_4,
    position: "absolute",
  },
  capacity: {
    top: 2,
    right: 4,
    borderRadius: 1,
    width: Width.width_18,
    height: 7,
    position: "absolute",
    backgroundColor: Color.white,
  },
  wifi: {
    height: Height.height_11,
    width: 15,
    backgroundColor: Color.white,
  },
  wifiPathIcon: {
    right: -316,
    height: 5,
    color: Color.mainBulma,
    width: 15,
  },
  home10WifiPathIcon: {
    top: 21,
    right: -313,
    width: 10,
    height: 4,
    color: Color.mainBulma,
    position: "absolute",
  },
  wifiPathIcon2: {
    top: 25,
    right: -311,
    width: 5,
    height: 3,
    color: Color.mainBulma,
    position: "absolute",
  },
  cellularConnectionIcon: {
    width: 17,
    height: 11,
  },
  timeStyle: {
    top: 7,
    left: 21,
    height: 21,
    width: Width.width_54,
    position: "absolute",
  },
  time: {
    marginTop: -3.5,
    left: 0,
    fontSize: FontSize.fs_15,
    letterSpacing: -0.3,
    fontWeight: "600",
    fontFamily: FontFamily.sFProText,
    textAlign: "center",
    color: Color.white,
    width: Width.width_54,
  },
  frameParent: {
    borderBottomRightRadius: Border.br_24,
    borderBottomLeftRadius: Border.br_24,
    padding: Padding.padding_24,
    gap: Gap.gap_24,
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: Color.piccolo,
  },
  frameGroup: {
    gap: Gap.gap_20,
    alignSelf: "stretch",
  },
  logoQuinzeNovoAzulParent: {
    gap: Gap.gap_8,
    flexDirection: "row",
    alignItems: "center",
  },
  logoQuinzeNovoAzulIcon: {
    height: 42,
    width: 42,
    borderRadius: 56,
  },
  buttonText: {
    lineHeight: LineHeight.lh_24,
    fontSize: FontSize.fs_14,
    fontWeight: "700",
    textAlign: "center",
    color: Color.white,
  },
  notificationsWrapper: {
    height: Height.height_36,
    width: Width.width_36,
    borderRadius: Border.br_58,
    borderColor: Color.jiren,
    borderWidth: 2,
    borderStyle: "solid",
    overflow: "hidden",
  },
  notifications: {
    marginTop: -16,
    marginLeft: -16,
    left: "50%",
    width: Width.width_32,
    height: Height.height_32,
  },
  bellIcon: {
    width: "50%",
    right: "25%",
    left: "25%",
    bottom: "20.31%",
    top: "20.31%",
    height: "59.38%",
    color: Color.mainGohan,
  },
  olJoo: {
    fontSize: FontSize.fs_24,
    lineHeight: LineHeight.lh_32,
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
    color: Color.white,
  },
  content: {
    maxWidth: 375,
    width: Width.width_375,
    backgroundColor: Color.mainGohan,
    flex: 1,
  },
  card: {
    width: Width.width_327,
    backgroundColor: Color.white,
  },
  calendarIcon: {
    bottom: "20.31%",
    top: "20.31%",
    height: "59.38%",
  },
  mdsPublicTwTag: {
    backgroundColor: Color.supportiveRoshi,
  },
  labelText: {
    color: Color.mainGoten,
    textAlign: "center",
  },
  home10ButtonText: {
    color: Color.mainBulma,
  },
  labelTextWrapper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
  },
  home10LabelText: {
    color: Color.hit,
    textAlign: "center",
  },
  mdsPublicTwTabs: {
    paddingLeft: StyleVariable.pl2,
    paddingTop: StyleVariable.py1,
    paddingRight: StyleVariable.pr1,
    paddingBottom: StyleVariable.py1,
    gap: StyleVariable.gap1,
    height: Height.height_32,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    overflow: "hidden",
  },
  tabText: {
    color: Color.mainBulma,
  },
  topRightIcon: {
    color: Color.mainBulma,
  },
  cardParent: {
    gap: Gap.gap_16,
    flexDirection: "row",
    alignSelf: "stretch",
  },
  home10Card: {
    alignSelf: "stretch",
    backgroundColor: Color.white,
    flex: 1,
  },
  calendarAddIcon: {
    bottom: "21.88%",
    top: "18.75%",
    left: "20.31%",
    right: "20.31%",
    width: "59.38%",
    maxHeight: "100%",
    maxWidth: "100%",
    height: "59.38%",
    color: Color.mainBulma,
    position: "absolute",
    overflow: "hidden",
  },
  buttonText2: {
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
    lineHeight: LineHeight.lh_24,
    fontSize: FontSize.fs_14,
    color: Color.mainBulma,
  },
  card3: {
    width: Width.width_327,
    backgroundColor: Color.mainGohan,
  },
  usersIcon: {
    left: "20.31%",
    right: "20.31%",
    width: "59.38%",
    maxHeight: "100%",
    maxWidth: "100%",
    color: Color.mainBulma,
    position: "absolute",
    overflow: "hidden",
  },
  buttonText4: {
    color: Color.hit,
  },
  home10TabText: {
    color: Color.hit,
  },
  home10TopRightIcon: {
    color: Color.hit,
  },
  cardPassosMgicos: {
    paddingHorizontal: Padding.padding_16,
    paddingTop: Padding.padding_8,
    paddingBottom: Padding.padding_16,
    borderRadius: Border.br_16,
    alignSelf: "stretch",
  },
  mdsPublicTwTagParent: {
    gap: Gap.gap_8,
    alignSelf: "stretch",
  },
  home10MdsPublicTwTag: {
    backgroundColor: Color.colorSteelblue,
  },
  labelText3: {
    lineHeight: LineHeight.lh_16,
    fontSize: FontSize.fs_12,
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
    textAlign: "center",
    color: Color.white,
  },
  buttonText6: {
    textAlign: "left",
    alignSelf: "stretch",
    color: Color.white,
  },
  cardQuinzeIcon: {
    height: 116,
    paddingHorizontal: 19,
    paddingVertical: 9,
    borderRadius: Border.br_16,
    width: Width.width_327,
  },
  buttonTextParent: {
    width: 279,
    gap: Gap.gap_8,
  },
  menuDeNavegao10: {
    borderColor: Color.colorGainsboro,
    borderTopWidth: 1,
    paddingHorizontal: StyleVariable.padding24,
    paddingBottom: StyleVariable.padding8,
    gap: -72,
    borderStyle: "solid",
    width: Width.width_375,
    backgroundColor: Color.mainGohan,
  },
  item: {
    gap: Gap.gap_24,
  },
  tipo: {
    zIndex: 0,
    gap: Gap.gap_8,
    alignItems: "center",
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
  home10Item: {
    gap: Gap.gap_24,
  },
  home10Tipo: {
    zIndex: 0,
    alignSelf: "stretch",
  },
  menu1: {
    height: Height.height_51,
    gap: Gap.gap_3,
    zIndex: 0,
    alignItems: "center",
    width: Width.width_54,
  },
  homeIcon: {
    bottom: "20%",
    top: "20.42%",
    height: "59.58%",
    right: "20%",
    width: "59.58%",
    left: "20.42%",
    color: Color.mainBulma,
  },
  menuItemText: {
    textAlign: "center",
    color: Color.mainBulma,
  },
  tipoItem: {
    zIndex: 1,
  },
  home10Marcador: {
    backgroundColor: Color.hit,
  },
  tipo2: {
    width: "100%",
  },
  calendarDateIcon: {
    width: "59.17%",
    right: "20.42%",
    color: Color.jiren,
    bottom: "20%",
    top: "20.42%",
    height: "59.58%",
  },
  home10MenuItemText: {
    color: Color.jiren,
    textAlign: "center",
  },
  home10UsersIcon: {
    color: Color.jiren,
    right: "20%",
    width: "59.58%",
    left: "20.42%",
    bottom: "25%",
    top: "25%",
    height: "50%",
  },
  userIcon: {
    width: "55%",
    right: "22.5%",
    left: "22.5%",
    color: Color.jiren,
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden",
  },
  tipo5: {
    gap: Gap.gap_8,
    alignItems: "center",
    width: "100%",
  },
  building02Icon: {
    color: Color.tokenColorNeutralMedium,
    zIndex: 0,
  },
  home10Nome: {
    color: Color.tokenColorNeutralMedium,
    zIndex: 1,
  },
});

export default Home10;
