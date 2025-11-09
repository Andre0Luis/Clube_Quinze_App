import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Building02 from "../assets/building-02.svg";
import Calendardate1 from "../assets/calendar-date1.svg";
import Calendar from "../assets/calendar.svg";
import Cap1 from "../assets/Cap1.svg";
import CellularConnection1 from "../assets/Cellular-Connection1.svg";
import Ellipse11 from "../assets/Ellipse-11.svg";
import Home02 from "../assets/home-02.svg";
import Home1 from "../assets/home1.svg";
import Topright1 from "../assets/top-right1.svg";
import User from "../assets/user.svg";
import Users1 from "../assets/users1.svg";
import { default as Wifipath, default as Wifipath1, default as Wifipath2 } from "../assets/Wifi-path.svg";
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

const AgendamentoScreen = () => {
  return (
    <SafeAreaView style={styles.agendamento11}>
      <View style={styles.view}>
        <View style={styles.statusBar}>
          <View style={[styles.battery, styles.batteryPosition]}>
            <View style={styles.border} />
            <Cap1 style={styles.capIcon} width={1} height={Height.height_4} />
            <View style={styles.capacity} />
          </View>
          <View style={styles.wifi}>
            <Wifipath
              style={[styles.wifiPathIcon, styles.batteryPosition]}
              width={15}
              height={5}
            />
            <Wifipath1
              style={styles.agendamento11WifiPathIcon}
              width={10}
              height={4}
            />
            <Wifipath2 style={styles.wifiPathIcon2} width={5} height={3} />
          </View>
          <CellularConnection1
            style={styles.cellularConnectionIcon}
            width={17}
            height={11}
          />
          <View style={styles.timeStyle}>
            <Text style={[styles.time, styles.timePosition]}>9:41</Text>
          </View>
        </View>
        <View style={styles.content}>
          <View style={[styles.mdsPublicTwSegmentedContro, styles.mdsFlexBox]}>
            <View style={[styles.mdsPublicTwTabs, styles.mdsSpaceBlock]}>
              <Text style={[styles.tabText, styles.tabTypo]}>
                Meus agendamentos
              </Text>
            </View>
            <View style={styles.mdsSpaceBlock}>
              <Text style={[styles.tabText, styles.tabTypo]}>Histórico</Text>
            </View>
          </View>
          <View style={styles.buttonTextParent}>
            <Text style={[styles.buttonText, styles.buttonTypo]}>
              Agendamento dos próximo 30 dias
            </Text>
            <View style={[styles.card, styles.cardSpaceBlock]}>
              <View style={[styles.frameParent, styles.frameParentFlexBox]}>
                <View style={styles.timeWrapper}>
                  <View style={[styles.agendamento11Time, styles.timePosition]}>
                    <Calendar
                      style={[styles.calendarIcon, styles.iconLayout1]}
                    />
                  </View>
                </View>
                <View style={styles.mdsPublicTwTag}>
                  <Text style={[styles.labelText, styles.textClr]}>
                    Agendado
                  </Text>
                </View>
              </View>
              <Text style={[styles.agendamento11ButtonText, styles.buttonTypo]}>
                Seu próximo cuidado pessoal
              </Text>
              <View
                style={[
                  styles.labelTextWrapper,
                  styles.labelTextWrapperFlexBox,
                ]}
              >
                <Text
                  style={[styles.agendamento11LabelText, styles.labelItemTypo]}
                >
                  Sexta-feira, 17 de Junho - 15:30
                </Text>
              </View>
              <View style={[styles.mdsPublicTwTabs2, styles.mdsFlexBox]}>
                <Text style={[styles.tabText2, styles.tabTypo]}>
                  Ver detalhes
                </Text>
                <View style={styles.iconLayout}>
                  <Topright1
                    style={[styles.topRightIcon, styles.iconLayout1]}
                  />
                </View>
              </View>
            </View>
            <View style={[styles.card, styles.cardSpaceBlock]}>
              <View style={[styles.frameParent, styles.frameParentFlexBox]}>
                <View style={styles.timeWrapper}>
                  <View style={[styles.agendamento11Time, styles.timePosition]}>
                    <Calendar
                      style={[styles.calendarIcon, styles.iconLayout1]}
                    />
                  </View>
                </View>
                <View style={styles.mdsPublicTwTag}>
                  <Text style={[styles.labelText, styles.textClr]}>
                    Agendado
                  </Text>
                </View>
              </View>
              <Text style={[styles.buttonText2, styles.tabTypo]}>
                Sexta-feira, 25 de Junho - 10:00
              </Text>
              <View style={[styles.mdsPublicTwTabs2, styles.mdsFlexBox]}>
                <Text style={[styles.tabText2, styles.tabTypo]}>
                  Ver detalhes
                </Text>
                <View style={styles.iconLayout}>
                  <Topright1
                    style={[styles.topRightIcon, styles.iconLayout1]}
                  />
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.mdsPublicTwButton, styles.cardSpaceBlock]}>
            <Text style={[styles.buttonText3, styles.textClr]}>Agendar</Text>
          </View>
        </View>
        <View style={[styles.menuDeNavegao10, styles.frameParentFlexBox]}>
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
            <View style={[styles.marcador, styles.marcadorPosition]} />
          </View>
          <View style={styles.itemLayout1}>
            <View style={[styles.agendamento11Tipo, styles.tipoFlexBox]}>
              <View style={styles.menu1}>
                <View style={styles.iconLayout}>
                  <Home1 style={[styles.homeIcon, styles.iconPosition]} />
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
          </View>
          <View style={[styles.item2, styles.itemLayout1]}>
            <View style={[styles.tipo2, styles.tipoFlexBox]}>
              <View style={styles.menu1}>
                <View style={styles.iconLayout}>
                  <Calendardate1
                    style={[styles.calendarDateIcon, styles.iconPosition]}
                  />
                </View>
                <Text
                  style={[
                    styles.agendamento11MenuItemText,
                    styles.labelItemTypo,
                  ]}
                >
                  Reserva
                </Text>
              </View>
              <Ellipse11
                style={[styles.tipoItem, styles.tipoPosition]}
                width={Width.width_8}
                height={Height.height_8}
              />
            </View>
            <View
              style={[styles.agendamento11Marcador, styles.marcadorPosition]}
            />
          </View>
          <View style={styles.itemLayout1}>
            <View style={[styles.agendamento11Tipo, styles.tipoFlexBox]}>
              <View style={styles.menu1}>
                <View style={styles.iconLayout}>
                  <Users1 style={[styles.usersIcon, styles.iconPosition]} />
                </View>
                <Text style={[styles.menuItemText, styles.labelItemTypo]}>
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
          <View style={styles.itemLayout1}>
            <View style={[styles.agendamento11Tipo, styles.tipoFlexBox]}>
              <View style={styles.menu1}>
                <View style={styles.iconLayout}>
                  <User style={[styles.userIcon, styles.iconPosition1]} />
                </View>
                <Text style={[styles.menuItemText, styles.labelItemTypo]}>
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
          <View style={styles.itemLayout}>
            <View style={styles.tipo5}>
              <Building02
                style={[styles.building02Icon, styles.iconLayout]}
                width={Width.width_24}
                height={Height.height_24}
              />
              <Text style={[styles.agendamento11Nome, styles.nomeTypo]}>
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
  agendamento11: {
    backgroundColor: Color.mainGohan,
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
  mdsFlexBox: {
    gap: StyleVariable.gap1,
    flexDirection: "row",
    alignItems: "center",
  },
  mdsSpaceBlock: {
    paddingVertical: StyleVariable.py2,
    paddingHorizontal: StyleVariable.px4,
    borderRadius: Border.br_8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  tabTypo: {
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
    lineHeight: LineHeight.lh_24,
    fontSize: FontSize.fs_14,
  },
  buttonTypo: {
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
    lineHeight: LineHeight.lh_24,
  },
  cardSpaceBlock: {
    paddingHorizontal: StyleVariable.px6,
    width: Width.width_327,
    overflow: "hidden",
  },
  frameParentFlexBox: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  iconLayout1: {
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden",
  },
  textClr: {
    color: Color.mainGoten,
    textAlign: "center",
  },
  labelTextWrapperFlexBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelItemTypo: {
    fontFamily: FontFamily.dMSansRegular,
    lineHeight: LineHeight.lh_16,
    fontSize: FontSize.fs_12,
  },
  itemLayout: {
    display: "none",
    width: Width.width_72,
    height: Height.height_80,
    justifyContent: "center",
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
  itemLayout1: {
    width: Width.width_72,
    height: Height.height_80,
    justifyContent: "center",
    alignItems: "center",
  },
  iconPosition1: {
    bottom: "20%",
    top: "20.42%",
    height: "59.58%",
  },
  view: {
    height: Height.height_812,
    overflow: "hidden",
    width: "100%",
    backgroundColor: Color.mainGohan,
    flex: 1,
  },
  statusBar: {
    height: 44,
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
    borderColor: Color.ink01,
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
    color: Color.ink01,
    height: Height.height_4,
    position: "absolute",
  },
  capacity: {
    top: 2,
    right: 4,
    borderRadius: 1,
    width: Width.width_18,
    height: 7,
    backgroundColor: Color.ink01,
    position: "absolute",
  },
  wifi: {
    height: Height.height_11,
    width: 15,
    backgroundColor: Color.ink01,
  },
  wifiPathIcon: {
    right: -316,
    height: 5,
    color: Color.mainBulma,
    width: 15,
  },
  agendamento11WifiPathIcon: {
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
    width: Width.width_54,
    color: Color.ink01,
  },
  content: {
    paddingHorizontal: Padding.padding_24,
    paddingTop: Padding.padding_32,
    gap: Gap.gap_24,
    alignItems: "center",
    width: Width.width_375,
    flex: 1,
  },
  mdsPublicTwSegmentedContro: {
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusIMd,
    backgroundColor: Color.mainGoku,
    padding: StyleVariable.px1,
    maxHeight: StyleVariable.heightH12,
    zIndex: 0,
    justifyContent: "center",
  },
  mdsPublicTwTabs: {
    backgroundColor: Color.mainGohan,
  },
  tabText: {
    textAlign: "left",
    color: Color.mainBulma,
  },
  buttonTextParent: {
    gap: Gap.gap_16,
    zIndex: 1,
    alignSelf: "stretch",
  },
  buttonText: {
    alignSelf: "stretch",
    textAlign: "left",
    color: Color.mainBulma,
  },
  card: {
    backgroundColor: Color.white,
    borderColor: Color.piccolo,
    paddingVertical: Padding.padding_16,
    gap: Gap.gap_8,
    borderRadius: Border.br_8,
    paddingHorizontal: StyleVariable.px6,
    width: Width.width_327,
    borderWidth: 1,
    borderStyle: "solid",
  },
  frameParent: {
    gap: Gap.gap_20,
    alignSelf: "stretch",
  },
  timeWrapper: {
    height: Height.height_36,
    width: Width.width_36,
    borderRadius: Border.br_58,
    borderColor: Color.jiren,
    borderWidth: 2,
    borderStyle: "solid",
    overflow: "hidden",
  },
  agendamento11Time: {
    marginTop: -16,
    marginLeft: -16,
    left: "50%",
    width: Width.width_32,
    height: Height.height_32,
  },
  calendarIcon: {
    height: "59.38%",
    width: "59.38%",
    top: "20.31%",
    right: "20.31%",
    bottom: "20.31%",
    left: "20.31%",
    color: Color.mainBulma,
  },
  mdsPublicTwTag: {
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusIXs,
    backgroundColor: Color.supportiveRoshi,
    paddingHorizontal: StyleVariable.px2,
    paddingVertical: StyleVariable.py1,
    alignItems: "center",
    overflow: "hidden",
  },
  labelText: {
    fontFamily: FontFamily.dMSansRegular,
    lineHeight: LineHeight.lh_16,
    fontSize: FontSize.fs_12,
  },
  agendamento11ButtonText: {
    textAlign: "left",
    color: Color.mainBulma,
  },
  labelTextWrapper: {
    alignSelf: "stretch",
  },
  agendamento11LabelText: {
    color: Color.hit,
    textAlign: "center",
  },
  mdsPublicTwTabs2: {
    paddingLeft: StyleVariable.pl2,
    paddingTop: StyleVariable.py1,
    paddingRight: StyleVariable.pr1,
    paddingBottom: StyleVariable.py1,
    height: Height.height_32,
    alignSelf: "stretch",
    overflow: "hidden",
  },
  tabText2: {
    textDecorationLine: "underline",
    textAlign: "right",
    color: Color.mainBulma,
    flex: 1,
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
  buttonText2: {
    color: Color.hit,
    textAlign: "left",
  },
  mdsPublicTwButton: {
    top: 488,
    left: 24,
    borderRadius: StyleVariable.interactiveBorderRadiusRadiusISm,
    backgroundColor: Color.piccolo,
    paddingVertical: StyleVariable.py4,
    zIndex: 2,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
  },
  buttonText3: {
    fontSize: FontSize.fs_16,
    fontFamily: FontFamily.dMSansBold,
    fontWeight: "700",
    lineHeight: LineHeight.lh_24,
  },
  menuDeNavegao10: {
    borderColor: Color.colorGainsboro,
    borderTopWidth: 1,
    paddingHorizontal: StyleVariable.padding24,
    paddingBottom: StyleVariable.padding8,
    gap: -52,
    borderStyle: "solid",
    width: Width.width_375,
    backgroundColor: Color.mainGohan,
  },
  item: {
    gap: Gap.gap_24,
  },
  tipo: {
    gap: Gap.gap_8,
    alignSelf: "stretch",
    zIndex: 0,
    alignItems: "center",
  },
  home02Icon: {
    color: Color.tokenColorBrandPrimaryPrimary,
    zIndex: 0,
  },
  nome: {
    color: Color.hit,
  },
  tipoChild: {
    zIndex: 2,
  },
  marcador: {
    backgroundColor: Color.tokenColorBrandPrimaryPrimary,
  },
  agendamento11Tipo: {
    width: "100%",
  },
  menu1: {
    height: Height.height_51,
    gap: Gap.gap_3,
    zIndex: 0,
    alignItems: "center",
    width: Width.width_54,
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
  item2: {
    gap: Gap.gap_24,
  },
  tipo2: {
    alignSelf: "stretch",
    zIndex: 0,
  },
  calendarDateIcon: {
    width: "59.17%",
    right: "20.42%",
    color: Color.piccolo,
    bottom: "20%",
    top: "20.42%",
    height: "59.58%",
  },
  agendamento11MenuItemText: {
    color: Color.piccolo,
    textAlign: "center",
  },
  agendamento11Marcador: {
    backgroundColor: Color.hit,
  },
  usersIcon: {
    height: "50%",
    top: "25%",
    bottom: "25%",
    color: Color.jiren,
    right: "20%",
    width: "59.58%",
    left: "20.42%",
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
  agendamento11Nome: {
    color: Color.tokenColorNeutralMedium,
  },
});

export default AgendamentoScreen;
