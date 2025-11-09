import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Bell1 from "../assets/bell1.svg";
import Building02 from "../assets/building-02.svg";
import Calendaradd from "../assets/calendar-add.svg";
import Calendardate from "../assets/calendar-date.svg";
import Ellipse11 from "../assets/Ellipse-11.svg";
import Home02 from "../assets/home-02.svg";
import Home from "../assets/home.svg";
import Illustration from "../assets/Illustration.svg";
import Multibet from "../assets/multi-bet.svg";
import NetworkWiFiFull from "../assets/Network-WiFi-Full.svg";
import Time from "../assets/Time.svg";
import Topright2 from "../assets/top-right2.svg";
import User from "../assets/user.svg";
import Users1 from "../assets/users1.svg";
import Users3 from "../assets/users3.svg";
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

const PerfilScreen = () => {
  return (
    <SafeAreaView style={styles.card2Bg}>
      <View style={styles.view}>
        <View>
          <View style={styles.topHeader20}>
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
            <Illustration
              style={styles.illustrationIcon}
              width={Width.width_80}
              height={96}
            />
          </View>
        </View>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainerContent}
        >
          <View
            style={[styles.logoQuinzeNovoAzulParent, styles.statusBarFlexBox]}
          >
            <Image
              style={styles.logoQuinzeNovoAzulIcon}
              contentFit="cover"
              source={require("../assets/logo-quinze-novo-azul1.png")}
            />
            <Text style={[styles.buttonText, styles.textTypo]}>
              Clube Quinze
            </Text>
            <View style={styles.notificationsWrapper}>
              <View style={styles.notifications}>
                <Bell1 style={[styles.bellIcon, styles.iconLayout1]} />
              </View>
            </View>
          </View>
          <Text style={[styles.olQuinze, styles.textTypo]}>Olá, Quinze 👋</Text>
          <View style={[styles.cardParent, styles.cardFlexBox]}>
            <View style={styles.card}>
              <Text style={[styles.perfil10ButtonText, styles.textItemTypo]}>
                Membros
              </Text>
              <View style={styles.buttonTextParent}>
                <Text style={[styles.buttonText2, styles.textTypo]}>44</Text>
                <Text style={[styles.buttonText3, styles.textTypo]}>
                  Started
                </Text>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={[styles.buttonText4, styles.textItemTypo]}>
                Membros
              </Text>
              <View style={styles.buttonTextParent}>
                <Text style={[styles.buttonText2, styles.textTypo]}>08</Text>
                <Text style={[styles.buttonText6, styles.textTypo]}>
                  Select Vip
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.cardGroup, styles.cardFlexBox]}>
            <View style={[styles.card2, styles.cardBorder]}>
              <View style={styles.timeWrapper}>
                <View style={styles.notifications}>
                  <Calendaradd
                    style={[styles.calendarAddIcon, styles.iconPosition4]}
                  />
                </View>
              </View>
              <Text style={[styles.buttonText7, styles.textTypo]}>
                Meus agendamentos
              </Text>
            </View>
            <View style={[styles.card2, styles.cardBorder]}>
              <View style={styles.timeWrapper}>
                <View style={styles.notifications}>
                  <Multibet style={[styles.multiBetIcon, styles.iconLayout1]} />
                </View>
              </View>
              <Text style={[styles.buttonText7, styles.textTypo]}>
                Próximos pagamentos
              </Text>
            </View>
          </View>
          <View style={[styles.card4, styles.cardBorder]}>
            <View style={styles.timeWrapper}>
              <View style={styles.notifications}>
                <Users3 style={[styles.usersIcon, styles.usersIconPosition]} />
              </View>
            </View>
            <Text style={[styles.buttonText9, styles.textTypo]}>
              Comunidade Quinze
            </Text>
            <View style={styles.timeWrapper}>
              <Text style={[styles.labelText, styles.textItemTypo]}>
                Descubra as últimas novidades agora
              </Text>
            </View>
            <View style={styles.mdsPublicTwTabs}>
              <Text style={[styles.tabText, styles.textTypo]}>Entrar</Text>
              <View style={styles.iconLayout}>
                <Topright2 style={[styles.topRightIcon, styles.iconLayout1]} />
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={styles.menuDeNavegao10}>
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
          <View style={styles.itemFlexBox}>
            <View style={[styles.perfil10Tipo, styles.tipoFlexBox]}>
              <View style={[styles.menu1, styles.menu1FlexBox]}>
                <View style={styles.iconLayout}>
                  <Home style={[styles.homeIcon, styles.iconPosition]} />
                </View>
                <Text style={[styles.menuItemText, styles.textItemTypo]}>
                  Home
                </Text>
              </View>
              <Ellipse11
                style={[styles.tipoItem, styles.tipoPosition]}
                width={Width.width_8}
                height={Height.height_8}
              />
            </View>
            <View style={[styles.perfil10Marcador, styles.marcadorPosition]} />
          </View>
          <View style={styles.itemFlexBox1}>
            <View style={[styles.tipo2, styles.tipoFlexBox]}>
              <View style={[styles.menu1, styles.menu1FlexBox]}>
                <View style={styles.iconLayout}>
                  <Calendardate
                    style={[styles.calendarDateIcon, styles.iconPosition]}
                  />
                </View>
                <Text
                  style={[styles.perfil10MenuItemText, styles.textItemTypo]}
                >
                  Agenda
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
              <View style={[styles.menu1, styles.menu1FlexBox]}>
                <View style={styles.iconLayout}>
                  <Users1
                    style={[styles.perfil10UsersIcon, styles.iconPosition]}
                  />
                </View>
                <Text
                  style={[styles.perfil10MenuItemText, styles.textItemTypo]}
                >
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
              <View style={[styles.menu1, styles.menu1FlexBox]}>
                <View style={styles.iconLayout}>
                  <User style={[styles.userIcon, styles.iconPosition1]} />
                </View>
                <Text
                  style={[styles.perfil10MenuItemText, styles.textItemTypo]}
                >
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
          <View style={[styles.item5, styles.itemFlexBox1]}>
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
    paddingTop: 16,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 24,
  },
  perfil10: {
    flex: 1,
    backgroundColor: "#fff",
  },
  statusBarFlexBox: {
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
    position: "absolute",
    backgroundColor: Color.hit,
  },
  textTypo: {
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
  },
  iconLayout1: {
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden",
  },
  cardFlexBox: {
    gap: Gap.gap_16,
    flexDirection: "row",
  },
  textItemTypo: {
    fontFamily: FontFamily.dMSansRegular,
    lineHeight: LineHeight.lh_16,
    fontSize: FontSize.fs_12,
  },
  cardBorder: {
    paddingHorizontal: StyleVariable.px6,
    gap: Gap.gap_8,
    paddingVertical: StyleVariable.py4,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    borderStyle: "solid",
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    overflow: "hidden",
  },
  iconPosition4: {
    left: "20.31%",
    right: "20.31%",
    width: "59.38%",
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
    gap: Gap.gap_24,
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
  itemFlexBox1: {
    justifyContent: "center",
    width: Width.width_72,
    height: Height.height_80,
    alignItems: "center",
  },
  card2Bg: {
    backgroundColor: Color.white,
    flex: 1,
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
    paddingHorizontal: Padding.padding_24,
    width: Width.width_375,
    backgroundColor: Color.mainGohan,
  },
  statusBar: {
    paddingTop: Padding.padding_16,
    paddingBottom: Padding.padding_8,
    gap: Gap.gap_20,
    width: Width.width_327,
  },
  timeIcon: {
    height: 12,
    width: 27,
    color: Color.hit,
  },
  status: {
    paddingHorizontal: Padding.padding_0,
    paddingVertical: Padding.padding_3,
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
  logoQuinzeNovoAzulParent: {
    width: 330,
    gap: 0,
  },
  logoQuinzeNovoAzulIcon: {
    height: Height.height_40,
    width: Width.width_40,
  },
  buttonText: {
    textAlign: "center",
    color: Color.mainBulma,
    lineHeight: LineHeight.lh_24,
    fontWeight: "700",
    fontSize: FontSize.fs_14,
  },
  notificationsWrapper: {
    justifyContent: "flex-end",
    alignSelf: "stretch",
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
  },
  notifications: {
    width: Width.width_32,
    height: Height.height_32,
  },
  bellIcon: {
    width: "50%",
    top: "20.31%",
    right: "25%",
    bottom: "20.31%",
    left: "25%",
    height: "59.38%",
    color: Color.mainBulma,
  },
  olQuinze: {
    fontSize: FontSize.fs_24,
    lineHeight: LineHeight.lh_32,
    textAlign: "left",
    color: Color.hit,
    width: Width.width_327,
  },
  cardParent: {
    alignSelf: "stretch",
  },
  card: {
    gap: Gap.gap_8,
    paddingVertical: StyleVariable.py4,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    borderStyle: "solid",
    alignSelf: "stretch",
    paddingHorizontal: Padding.padding_24,
    overflow: "hidden",
    backgroundColor: Color.white,
    flex: 1,
  },
  perfil10ButtonText: {
    textAlign: "left",
    color: Color.mainBulma,
  },
  buttonTextParent: {
    alignSelf: "stretch",
  },
  buttonText2: {
    fontSize: FontSize.fs_32,
    letterSpacing: -0.5,
    lineHeight: LineHeight.lh_40,
    textAlign: "left",
    color: Color.mainBulma,
  },
  buttonText3: {
    color: Color.piccolo,
    textAlign: "left",
    alignSelf: "stretch",
    lineHeight: LineHeight.lh_24,
    fontWeight: "700",
    fontSize: FontSize.fs_14,
  },
  buttonText4: {
    textAlign: "left",
    alignSelf: "stretch",
    color: Color.mainBulma,
  },
  buttonText6: {
    textAlign: "left",
    alignSelf: "stretch",
    lineHeight: LineHeight.lh_24,
    fontWeight: "700",
    fontSize: FontSize.fs_14,
  },
  cardGroup: {
    height: 120,
    width: Width.width_327,
  },
  card2: {
    alignSelf: "stretch",
    backgroundColor: Color.white,
    flex: 1,
  },
  timeWrapper: {
    alignSelf: "stretch",
    alignItems: "center",
    flexDirection: "row",
  },
  calendarAddIcon: {
    bottom: "21.88%",
    top: "18.75%",
    height: "59.38%",
    color: Color.mainBulma,
  },
  buttonText7: {
    textAlign: "left",
    alignSelf: "stretch",
    color: Color.mainBulma,
    lineHeight: LineHeight.lh_24,
    fontWeight: "700",
    fontSize: FontSize.fs_14,
  },
  multiBetIcon: {
    height: "73.44%",
    width: "64.69%",
    top: "13.13%",
    right: "17.81%",
    bottom: "13.44%",
    left: "17.5%",
    color: Color.mainBulma,
  },
  card4: {
    width: Width.width_327,
    backgroundColor: Color.mainGohan,
  },
  usersIcon: {
    left: "20.31%",
    right: "20.31%",
    width: "59.38%",
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden",
    color: Color.hit,
  },
  buttonText9: {
    fontSize: FontSize.fs_16,
    textAlign: "left",
    lineHeight: LineHeight.lh_24,
    fontWeight: "700",
    color: Color.hit,
  },
  labelText: {
    textAlign: "center",
    color: Color.hit,
  },
  mdsPublicTwTabs: {
    paddingLeft: StyleVariable.pl2,
    paddingTop: StyleVariable.py1,
    paddingRight: StyleVariable.pr1,
    paddingBottom: StyleVariable.py1,
    gap: StyleVariable.gap1,
    height: Height.height_32,
    alignSelf: "stretch",
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
  },
  tabText: {
    textDecorationLine: "underline",
    textAlign: "right",
    lineHeight: LineHeight.lh_24,
    fontWeight: "700",
    fontSize: FontSize.fs_14,
    color: Color.hit,
    flex: 1,
  },
  topRightIcon: {
    height: "62.5%",
    width: "62.5%",
    right: "18.75%",
    bottom: "18.75%",
    left: "18.75%",
    top: "18.75%",
    color: Color.hit,
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
  perfil10Tipo: {
    zIndex: 0,
    alignSelf: "stretch",
  },
  menu1: {
    width: Width.width_54,
    height: Height.height_51,
    zIndex: 0,
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
  perfil10Marcador: {
    backgroundColor: Color.hit,
    borderRadius: Border.br_24,
    left: 28,
    height: Height.height_4,
    width: Width.width_16,
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
  perfil10MenuItemText: {
    color: Color.jiren,
    textAlign: "center",
  },
  perfil10UsersIcon: {
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
  item5: {
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
  },
  perfil10Nome: {
    color: Color.tokenColorNeutralMedium,
    zIndex: 1,
  },
});

export default PerfilScreen;
