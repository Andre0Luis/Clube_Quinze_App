import { Ionicons } from "@expo/vector-icons";import { Ionicons } from "@expo/vector-icons";import {

import * as SecureStore from "expo-secure-store";

import { Image } from "expo-image";import * as SecureStore from "expo-secure-store";  ImageBackground,

import { useRouter } from "expo-router";

import { jwtDecode } from "jwt-decode";import { Image } from "expo-image";  ScrollView,

import {

  ActivityIndicator,import { useRouter } from "expo-router";  StyleSheet,

  Alert,

  ScrollView,import { jwtDecode } from "jwt-decode";  Text,

  StyleSheet,

  Text,import {  View,

  TouchableOpacity,

  View,  ActivityIndicator,} from "react-native";

} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";  Alert,import { SafeAreaView } from "react-native-safe-area-context";

import { useCallback, useEffect, useMemo, useState } from "react";

  ScrollView,import Chevrondown1 from "../assets/chevron-down.svg";

import {

  Border,  StyleSheet,import Illustration from "../assets/Illustration.svg";

  Color,

  FontFamily,  Text,import {

  FontSize,

  Gap,  TouchableOpacity,  Border,

  LineHeight,

  Padding,  View,  Color,

  StyleVariable,

} from "../GlobalStyles";} from "react-native";  FontFamily,

import { logout as logoutService } from "../services/auth";

import { SafeAreaView } from "react-native-safe-area-context";  FontSize,

interface DecodedToken {

  name?: string;import { useCallback, useEffect, useMemo, useState } from "react";  Gap,

}

  Height,

type ProfileOption = {

  id: string;import {  LineHeight,

  title: string;

  description: string;  Border,  Padding,

  icon: keyof typeof Ionicons.glyphMap;

};  Color,  StyleVariable,



const profileOptions: ProfileOption[] = [  FontFamily,  Width,

  {

    id: "personal-data",  FontSize,} from "../GlobalStyles";

    title: "Dados pessoais",

    description: "Atualize seu nome, telefone e endereço.",  Gap,

    icon: "id-card-outline",

  },  LineHeight,const Perfil = () => {

  {

    id: "preferences",  Padding,  return (

    title: "Preferências",

    description: "Gerencie temas, comunicações e acessos.",  StyleVariable,    <SafeAreaView style={styles.perfil10}>

    icon: "options-outline",

  },} from "../GlobalStyles";      <View style={styles.view}>

  {

    id: "plans",import { logout as logoutService } from "../services/auth";          <View style={[styles.topHeader20, styles.opesSpaceBlock]}>

    title: "Planos",

    description: "Revise benefícios e histórico do seu plano.",            <View style={[styles.titleWrapper, styles.dataFlexBox]}>

    icon: "card-outline",

  },interface DecodedToken {              <View style={[styles.title, styles.titleSpaceBlock]}>

  {

    id: "policies",  name?: string;                <Text style={[styles.olJoo, styles.olJooTypo]}>

    title: "Termos e políticas",

    description: "Consulte nossos termos de uso e privacidade.",}                  Olá, João 👋

    icon: "document-text-outline",

  },                </Text>

];

type ProfileOption = {              </View>

const PerfilScreen = () => {

  const router = useRouter();  id: string;            </View>

  const [userName, setUserName] = useState("");

  const [isLoggingOut, setIsLoggingOut] = useState(false);  title: string;            <Illustration



  useEffect(() => {  description: string;              style={styles.illustrationIcon}

    let isMounted = true;

  icon: keyof typeof Ionicons.glyphMap;              width={Width.width_80}

    const fetchUserName = async () => {

      try {};              height={96}

        const token = await SecureStore.getItemAsync("accessToken");

        if (!token || !isMounted) {            />

          return;

        }const profileOptions: ProfileOption[] = [            <View style={styles.mdsPublicTwAvatarParent}>



        const decoded = jwtDecode<DecodedToken>(token);  {              <ImageBackground

        if (decoded?.name && isMounted) {

          setUserName(decoded.name);    id: "personal-data",                style={[styles.mdsPublicTwAvatarIcon, styles.badgesPosition]}

        }

      } catch (error) {    title: "Dados pessoais",                resizeMode="cover"

        console.warn("Falha ao obter nome do usuário", error);

      }    description: "Atualize seu nome, telefone e endereço.",                source={require("../assets/avatar.png")}

    };

    icon: "id-card-outline",              >

    fetchUserName();

  },                <Text style={[styles.initials, styles.olJooTypo]} />

    return () => {

      isMounted = false;  {                <View style={[styles.badges, styles.badgesPosition]}>

    };

  }, []);    id: "preferences",                  <View style={[styles.badgeTr, styles.badgeLayout]} />



  const displayName = useMemo(() => userName || "Convidado", [userName]);    title: "Preferências",                  <View style={[styles.badgeTr, styles.badgeLayout]} />



  const handleOptionPress = useCallback((option: ProfileOption) => {    description: "Gerencie temas, comunicações e acessos.",                  <View style={[styles.badgeBl, styles.badgeLayout]} />

    Alert.alert(option.title, "Em breve você poderá gerenciar essa seção por aqui.");

  }, []);    icon: "options-outline",                  <View style={[styles.badgeBl, styles.badgeLayout]} />



  const handleLogout = useCallback(async () => {  },                </View>

    if (isLoggingOut) {

      return;  {              </ImageBackground>

    }

    id: "plans",              <View style={styles.generic}>

    setIsLoggingOut(true);

    title: "Planos",                <Text>Tinha alguma coisa aqui</Text>

    try {

      const refreshToken = await SecureStore.getItemAsync("refreshToken");    description: "Revise benefícios e histórico do seu plano.",              </View>

      if (refreshToken) {

        await logoutService(refreshToken);    icon: "card-outline",            </View>

      }

    } catch (error) {  },          </View>

      console.error("Logout failed", error);

    } finally {  {        </View>

      await SecureStore.deleteItemAsync("accessToken");

      await SecureStore.deleteItemAsync("refreshToken");    id: "policies",        <ScrollView

      setIsLoggingOut(false);

      router.replace("/login");    title: "Termos e políticas",          style={styles.content}

    }

  }, [isLoggingOut, router]);    description: "Consulte nossos termos de uso e privacidade.",          contentContainerStyle={styles.contentContainerContent}



  return (    icon: "document-text-outline",        >

    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>

      <ScrollView contentContainerStyle={styles.scrollContent}>  },          <View style={styles.dadosDaConta}>

        <View style={styles.content}>

          <View style={styles.headerCard}>];            <View style={[styles.opes, styles.opesSpaceBlock]}>

            <View style={styles.headerTexts}>

              <Text style={styles.headerGreeting}>Olá, {displayName} 👋</Text>              <View style={[styles.dataParent, styles.dataFlexBox]}>

              <Text style={styles.headerSubtitle}>

                Tenha uma experiência personalizada e mantenha seus dados sempre atualizados.const PerfilScreen = () => {                <View style={[styles.data, styles.dataFlexBox]}>

              </Text>

            </View>  const router = useRouter();                  <View style={styles.currencyType}>

            <View style={styles.headerIcon}>

              <Ionicons name="person-circle-outline" size={48} color={Color.piccolo} />  const [userName, setUserName] = useState("");                    <Text style={styles.perfil10Data}>Dados pessoais</Text>

            </View>

          </View>  const [isLoggingOut, setIsLoggingOut] = useState(false);                  </View>



          <View style={styles.optionList}>                </View>

            {profileOptions.map((option) => (

              <TouchableOpacity  useEffect(() => {                <View style={styles.controlsWrapper}>

                key={option.id}

                style={styles.optionCard}    let isMounted = true;                  <View style={[styles.controls, styles.iconLayout]}>

                activeOpacity={0.85}

                onPress={() => handleOptionPress(option)}                    <Chevrondown1

              >

                <View style={styles.optionIconWrapper}>    const fetchUserName = async () => {                      style={[styles.chevronDownIcon, styles.iconLayout1]}

                  <Ionicons name={option.icon} size={20} color={Color.piccolo} />

                </View>      try {                    />

                <View style={styles.optionTexts}>

                  <Text style={styles.optionTitle}>{option.title}</Text>        const token = await SecureStore.getItemAsync("accessToken");                  </View>

                  <Text style={styles.optionDescription}>{option.description}</Text>

                </View>        if (!token || !isMounted) {                </View>

                <Ionicons name="chevron-forward" size={20} color={Color.mainTrunks} />

              </TouchableOpacity>          return;              </View>

            ))}

          </View>        }            </View>



          <View style={styles.highlightCard}>          </View>

            <View style={styles.highlightBadge}>

              <Text style={styles.highlightBadgeText}>Responsabilidade social</Text>        const decoded = jwtDecode<DecodedToken>(token);          <View style={styles.borderTop} />

            </View>

            <Text style={styles.highlightTitle}>Passos Mágicos</Text>        if (decoded?.name && isMounted) {          <View style={styles.dadosDaConta}>

            <Text style={styles.highlightDescription}>

              Participe de uma das nossas ações sociais, compartilhando experiências com nossos alunos e apoiando novas histórias.          setUserName(decoded.name);            <View style={[styles.opes, styles.opesSpaceBlock]}>

            </Text>

            <TouchableOpacity style={styles.highlightLink} activeOpacity={0.8}>        }              <View style={[styles.dataParent, styles.dataFlexBox]}>

              <Text style={styles.highlightLinkText}>Quero participar</Text>

              <Ionicons name="arrow-forward" size={16} color={Color.piccolo} />      } catch (error) {                <View style={[styles.data, styles.dataFlexBox]}>

            </TouchableOpacity>

          </View>        console.warn("Falha ao obter nome do usuário", error);                  <View style={styles.currencyType}>



          <TouchableOpacity      }                    <Text style={styles.perfil10Data}>Preferências</Text>

            style={styles.logoutButton}

            activeOpacity={0.85}    };                  </View>

            onPress={handleLogout}

            disabled={isLoggingOut}                </View>

          >

            <Ionicons name="log-out-outline" size={20} color={Color.mainGoten} />    fetchUserName();                <View style={styles.controlsWrapper}>

            <Text style={styles.logoutText}>Sair do app</Text>

            {isLoggingOut && <ActivityIndicator size="small" color={Color.mainGoten} style={styles.logoutSpinner} />}                  <View style={[styles.controls, styles.iconLayout]}>

          </TouchableOpacity>

    return () => {                    <Chevrondown1

          <View style={styles.brandFooter}>

            <Image      isMounted = false;                      style={[styles.chevronDownIcon, styles.iconLayout1]}

              source={require("../assets/images/icon.png")}

              style={styles.brandLogo}    };                    />

              contentFit="contain"

            />  }, []);                  </View>

            <Text style={styles.brandTagline}>Far and beyond</Text>

          </View>                </View>

        </View>

      </ScrollView>  const displayName = useMemo(() => userName || "Convidado", [userName]);              </View>

    </SafeAreaView>

  );            </View>

};

  const handleOptionPress = useCallback((option: ProfileOption) => {          </View>

const styles = StyleSheet.create({

  safeArea: {    Alert.alert(option.title, "Em breve você poderá gerenciar essa seção por aqui.");          <View style={styles.borderTop} />

    flex: 1,

    backgroundColor: Color.mainGohan,  }, []);          <View style={styles.dadosDaConta}>

  },

  scrollContent: {            <View style={[styles.opes, styles.opesSpaceBlock]}>

    paddingBottom: Padding.padding_32,

  },  const handleLogout = useCallback(async () => {              <View style={[styles.dataParent, styles.dataFlexBox]}>

  content: {

    paddingTop: Padding.padding_32,    if (isLoggingOut) {                <View style={[styles.data, styles.dataFlexBox]}>

    paddingHorizontal: Padding.padding_24,

    gap: Gap.gap_24,      return;                  <View style={styles.currencyType}>

  },

  headerCard: {    }                    <Text style={styles.perfil10Data}>Planos</Text>

    borderRadius: Border.br_16,

    backgroundColor: Color.mainGohan,                  </View>

    borderWidth: 1,

    borderColor: "rgba(0, 5, 61, 0.08)",    setIsLoggingOut(true);                </View>

    paddingVertical: StyleVariable.py4,

    paddingHorizontal: StyleVariable.px6,                <View style={styles.controlsWrapper}>

    flexDirection: "row",

    alignItems: "center",    try {                  <View style={[styles.controls, styles.iconLayout]}>

    gap: Gap.gap_16,

    shadowColor: "rgba(0, 0, 0, 0.05)",      const refreshToken = await SecureStore.getItemAsync("refreshToken");                    <Chevrondown1

    shadowOpacity: 1,

    shadowOffset: { width: 0, height: 10 },      if (refreshToken) {                      style={[styles.chevronDownIcon, styles.iconLayout1]}

    shadowRadius: 16,

    elevation: 3,        await logoutService(refreshToken);                    />

  },

  headerTexts: {      }                  </View>

    flex: 1,

    gap: Gap.gap_8,    } catch (error) {                </View>

  },

  headerGreeting: {      console.error("Logout failed", error);              </View>

    fontSize: FontSize.fs_16,

    lineHeight: LineHeight.lh_24,    } finally {            </View>

    fontFamily: FontFamily.dMSansBold,

    color: Color.hit,      await SecureStore.deleteItemAsync("accessToken");          </View>

  },

  headerSubtitle: {      await SecureStore.deleteItemAsync("refreshToken");          <View style={styles.borderTop} />

    fontSize: FontSize.fs_12,

    lineHeight: LineHeight.lh_16,      setIsLoggingOut(false);          <View style={styles.dadosDaConta}>

    fontFamily: FontFamily.dMSansRegular,

    color: Color.mainTrunks,      router.replace("/login");            <View style={[styles.opes, styles.opesSpaceBlock]}>

  },

  headerIcon: {    }              <View style={[styles.dataParent, styles.dataFlexBox]}>

    width: 64,

    height: 64,  }, [isLoggingOut, router]);                <View style={[styles.data, styles.dataFlexBox]}>

    borderRadius: Border.br_58,

    backgroundColor: "rgba(0, 5, 61, 0.08)",                  <View style={styles.currencyType}>

    alignItems: "center",

    justifyContent: "center",  return (                    <Text style={styles.perfil10Data}>Termos e Politicas</Text>

  },

  optionList: {    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>                  </View>

    gap: Gap.gap_16,

  },      <ScrollView contentContainerStyle={styles.scrollContent}>                </View>

  optionCard: {

    flexDirection: "row",        <View style={styles.content}>                <View style={styles.controlsWrapper}>

    alignItems: "center",

    gap: Gap.gap_16,          <View style={styles.headerCard}>                  <View style={[styles.controls, styles.iconLayout]}>

    borderRadius: Border.br_16,

    backgroundColor: Color.mainGohan,            <View style={styles.headerTexts}>                    <Chevrondown1

    borderWidth: 1,

    borderColor: "rgba(0, 5, 61, 0.08)",              <Text style={styles.headerGreeting}>Olá, {displayName} 👋</Text>                      style={[styles.chevronDownIcon, styles.iconLayout1]}

    paddingHorizontal: StyleVariable.px4,

    paddingVertical: StyleVariable.py4,              <Text style={styles.headerSubtitle}>                    />

    shadowColor: "rgba(0, 0, 0, 0.04)",

    shadowOpacity: 1,                Tenha uma experiência personalizada e mantenha seus dados sempre atualizados.                  </View>

    shadowOffset: { width: 0, height: 8 },

    shadowRadius: 12,              </Text>                </View>

    elevation: 2,

  },            </View>              </View>

  optionIconWrapper: {

    width: 40,            <View style={styles.headerIcon}>            </View>

    height: 40,

    borderRadius: Border.br_58,              <Ionicons name="person-circle-outline" size={48} color={Color.piccolo} />          </View>

    backgroundColor: "rgba(0, 5, 61, 0.08)",

    alignItems: "center",            </View>          <View style={styles.contentChild} />

    justifyContent: "center",

  },          </View>          <ImageBackground

  optionTexts: {

    flex: 1,            style={styles.cardPassosMgicos}

    gap: Gap.gap_4,

  },          <View style={styles.optionList}>            resizeMode="cover"

  optionTitle: {

    fontSize: FontSize.fs_14,            {profileOptions.map((option) => (            source={require("../assets/bg1.png")}

    lineHeight: LineHeight.lh_24,

    fontFamily: FontFamily.dMSansBold,              <TouchableOpacity          >

    color: Color.hit,

  },                key={option.id}            <View style={styles.mdsPublicTwTagParent}>

  optionDescription: {

    fontSize: FontSize.fs_12,                style={styles.optionCard}              <View style={[styles.mdsPublicTwTag, styles.mdsSpaceBlock]}>

    lineHeight: LineHeight.lh_16,

    fontFamily: FontFamily.dMSansRegular,                activeOpacity={0.85}                <Text style={styles.labelText}>Responsabilidade Social</Text>

    color: Color.mainTrunks,

  },                onPress={() => handleOptionPress(option)}              </View>

  highlightCard: {

    borderRadius: Border.br_16,              >              <Text style={[styles.buttonText, styles.olJooTypo]}>

    backgroundColor: "rgba(0, 5, 61, 0.06)",

    paddingHorizontal: StyleVariable.px6,                <View style={styles.optionIconWrapper}>                Passos Mágicos

    paddingVertical: StyleVariable.py4,

    gap: Gap.gap_16,                  <Ionicons name={option.icon} size={20} color={Color.piccolo} />              </Text>

    borderWidth: 1,

    borderColor: "rgba(0, 5, 61, 0.08)",                </View>              <Text style={[styles.perfil10ButtonText, styles.menuItemTypo]}>

  },

  highlightBadge: {                <View style={styles.optionTexts}>                Participe de uma de nossas ações. Interagindo com nossos alunos,

    alignSelf: "flex-start",

    backgroundColor: Color.piccolo,                  <Text style={styles.optionTitle}>{option.title}</Text>                compartilhando experiências e conhecimento

    borderRadius: Border.br_16,

    paddingVertical: StyleVariable.py1,                  <Text style={styles.optionDescription}>{option.description}</Text>              </Text>

    paddingHorizontal: StyleVariable.px2,

  },                </View>            </View>

  highlightBadgeText: {

    fontSize: FontSize.fs_12,                <Ionicons name="chevron-forward" size={20} color={Color.mainTrunks} />          </ImageBackground>

    fontFamily: FontFamily.dMSansBold,

    color: Color.mainGoten,              </TouchableOpacity>          <View style={styles.mdsPublicTwTabsWrapper}>

    lineHeight: LineHeight.lh_16,

  },            ))}            <View style={[styles.mdsPublicTwTabs, styles.mdsSpaceBlock]}>

  highlightTitle: {

    fontSize: FontSize.fs_16,          </View>              <Text style={styles.tabText}>Sair do app</Text>

    lineHeight: LineHeight.lh_24,

    fontFamily: FontFamily.dMSansBold,            </View>

    color: Color.hit,

  },          <View style={styles.highlightCard}>          </View>

  highlightDescription: {

    fontSize: FontSize.fs_12,            <View style={styles.highlightBadge}>        </ScrollView>

    lineHeight: LineHeight.lh_16,

    fontFamily: FontFamily.dMSansRegular,              <Text style={styles.highlightBadgeText}>Responsabilidade social</Text>    </SafeAreaView>

    color: Color.mainTrunks,

  },            </View>  );

  highlightLink: {

    flexDirection: "row",            <Text style={styles.highlightTitle}>Passos Mágicos</Text>};

    alignItems: "center",

    gap: Gap.gap_8,            <Text style={styles.highlightDescription}>

  },

  highlightLinkText: {              Participe de uma das nossas ações sociais, compartilhando experiências com nossos alunos e apoiando novas histórias.const styles = StyleSheet.create({

    fontSize: FontSize.fs_12,

    fontFamily: FontFamily.dMSansBold,            </Text>  contentContainerContent: {

    color: Color.piccolo,

  },            <TouchableOpacity style={styles.highlightLink} activeOpacity={0.8}>    flexDirection: "column",

  logoutButton: {

    marginTop: Gap.gap_8,              <Text style={styles.highlightLinkText}>Quero participar</Text>    paddingHorizontal: 24,

    flexDirection: "row",

    alignItems: "center",              <Ionicons name="arrow-forward" size={16} color={Color.piccolo} />    paddingVertical: 0,

    justifyContent: "center",

    gap: Gap.gap_8,            </TouchableOpacity>    alignItems: "center",

    backgroundColor: Color.piccolo,

    borderRadius: Border.br_16,          </View>    justifyContent: "flex-start",

    paddingVertical: StyleVariable.py4,

    paddingHorizontal: StyleVariable.px4,  },

  },

  logoutText: {          <TouchableOpacity  perfil10: {

    fontSize: FontSize.fs_14,

    fontFamily: FontFamily.dMSansBold,            style={styles.logoutButton}    backgroundColor: Color.white,

    color: Color.mainGoten,

  },            activeOpacity={0.85}    flex: 1,

  logoutSpinner: {

    marginLeft: Gap.gap_8,            onPress={handleLogout}  },

  },

  brandFooter: {            disabled={isLoggingOut}  opesSpaceBlock: {

    alignItems: "center",

    gap: Gap.gap_8,          >    paddingHorizontal: Padding.padding_24,

    marginTop: Gap.gap_16,

  },            <Ionicons name="log-out-outline" size={20} color={Color.mainGoten} />    backgroundColor: Color.mainGohan,

  brandLogo: {

    width: 80,            <Text style={styles.logoutText}>Sair do app</Text>  },

    height: 80,

  },            {isLoggingOut && <ActivityIndicator size="small" color={Color.mainGoten} style={styles.logoutSpinner} />}  menu1FlexBox: {

  brandTagline: {

    fontSize: FontSize.fs_12,          </TouchableOpacity>    gap: Gap.gap_3,

    fontFamily: FontFamily.dMSansRegular,

    color: Color.mainTrunks,    alignItems: "center",

    letterSpacing: 1,

  },          <View style={styles.brandFooter}>  },

});

            <Image  barPosition: {

export default PerfilScreen;

              source={require("../assets/images/icon.png")}    width: Width.width_3_2,

              style={styles.brandLogo}    borderRadius: Border.br_1,

              contentFit="contain"    left: "50%",

            />    top: "50%",

            <Text style={styles.brandTagline}>Far and beyond</Text>    backgroundColor: Color.hit,

          </View>    position: "absolute",

        </View>  },

      </ScrollView>  dataFlexBox: {

    </SafeAreaView>    flexDirection: "row",

  );    alignItems: "center",

};  },

  titleSpaceBlock: {

const styles = StyleSheet.create({    paddingHorizontal: Padding.padding_0,

  safeArea: {    flexDirection: "row",

    flex: 1,  },

    backgroundColor: Color.mainGohan,  olJooTypo: {

  },    fontFamily: FontFamily.dMSansBold,

  scrollContent: {    fontWeight: "700",

    paddingBottom: Padding.padding_32,    lineHeight: LineHeight.lh_32,

  },  },

  content: {  badgesPosition: {

    paddingTop: Padding.padding_32,    top: 0,

    paddingHorizontal: Padding.padding_24,    position: "absolute",

    gap: Gap.gap_24,  },

  },  badgeLayout: {

  headerCard: {    height: Height.height_20,

    borderRadius: Border.br_16,    borderWidth: 4,

    backgroundColor: Color.mainGohan,    borderColor: Color.mainGoku,

    borderWidth: 1,    backgroundColor: Color.supportiveRoshi,

    borderColor: "rgba(0, 5, 61, 0.08)",    borderRadius: Border.br_100,

    paddingVertical: StyleVariable.py4,    borderStyle: "solid",

    paddingHorizontal: StyleVariable.px6,    display: "none",

    flexDirection: "row",    position: "absolute",

    alignItems: "center",    width: Width.width_20,

    gap: Gap.gap_16,  },

    shadowColor: "rgba(0, 0, 0, 0.05)",  iconLayout1: {

    shadowOpacity: 1,    maxHeight: "100%",

    shadowOffset: { width: 0, height: 10 },    maxWidth: "100%",

    shadowRadius: 16,    position: "absolute",

    elevation: 3,    overflow: "hidden",

  },  },

  headerTexts: {  iconLayout: {

    flex: 1,    width: Width.width_24,

    gap: Gap.gap_8,    height: Height.height_24,

  },  },

  headerGreeting: {  mdsSpaceBlock: {

    fontSize: FontSize.fs_16,    paddingVertical: StyleVariable.py1,

    lineHeight: LineHeight.lh_24,    paddingHorizontal: StyleVariable.px2,

    fontFamily: FontFamily.dMSansBold,    overflow: "hidden",

    color: Color.hit,  },

  },  menuItemTypo: {

  headerSubtitle: {    fontFamily: FontFamily.dMSansRegular,

    fontSize: FontSize.fs_12,    lineHeight: LineHeight.lh_16,

    lineHeight: LineHeight.lh_16,    fontSize: FontSize.fs_12,

    fontFamily: FontFamily.dMSansRegular,  },

    color: Color.mainTrunks,  itemLayout: {

  },    width: Width.width_72,

  headerIcon: {    height: Height.height_80,

    width: 64,    justifyContent: "center",

    height: 64,    alignItems: "center",

    borderRadius: Border.br_58,  },

    backgroundColor: "rgba(0, 5, 61, 0.08)",  nomeTypo: {

    alignItems: "center",    fontFamily: FontFamily.robotoRegular,

    justifyContent: "center",    lineHeight: LineHeight.lh_18,

  },    zIndex: 1,

  optionList: {    fontSize: FontSize.fs_14,

    gap: Gap.gap_16,    textAlign: "center",

  },  },

  optionCard: {  tipoPosition: {

    flexDirection: "row",    color: Color.tokenColorStatusError,

    alignItems: "center",    left: 38,

    gap: Gap.gap_16,    height: Height.height_8,

    borderRadius: Border.br_16,    width: Width.width_8,

    backgroundColor: Color.mainGohan,    top: 0,

    borderWidth: 1,    position: "absolute",

    borderColor: "rgba(0, 5, 61, 0.08)",  },

    paddingHorizontal: StyleVariable.px4,  marcadorLayout: {

    paddingVertical: StyleVariable.py4,    borderRadius: Border.br_24,

    shadowColor: "rgba(0, 0, 0, 0.04)",    height: Height.height_4,

    shadowOpacity: 1,    width: Width.width_16,

    shadowOffset: { width: 0, height: 8 },    top: 0,

    shadowRadius: 12,    position: "absolute",

    elevation: 2,  },

  },  view: {

  optionIconWrapper: {    height: 812,

    width: 40,    overflow: "hidden",

    height: 40,    backgroundColor: Color.mainGohan,

    borderRadius: Border.br_58,    width: "100%",

    backgroundColor: "rgba(0, 5, 61, 0.08)",    flex: 1,

    alignItems: "center",  },

    justifyContent: "center",  topHeader20: {

  },    paddingBottom: Padding.padding_16,

  optionTexts: {    width: Width.width_375,

    flex: 1,  },

    gap: Gap.gap_4,  statusBar: {

  },    paddingTop: Padding.padding_16,

  optionTitle: {    paddingBottom: Padding.padding_8,

    fontSize: FontSize.fs_14,    gap: Gap.gap_20,

    lineHeight: LineHeight.lh_24,    justifyContent: "space-between",

    fontFamily: FontFamily.dMSansBold,    alignItems: "center",

    color: Color.hit,    flexDirection: "row",

  },    width: Width.width_327,

  optionDescription: {  },

    fontSize: FontSize.fs_12,  timeIcon: {

    lineHeight: LineHeight.lh_16,    height: 12,

    fontFamily: FontFamily.dMSansRegular,    width: 27,

    color: Color.mainTrunks,    color: Color.hit,

  },  },

  highlightCard: {  status: {

    borderRadius: Border.br_16,    paddingVertical: Padding.padding_3,

    backgroundColor: "rgba(0, 5, 61, 0.06)",    paddingHorizontal: Padding.padding_0,

    paddingHorizontal: StyleVariable.px6,    flexDirection: "row",

    paddingVertical: StyleVariable.py4,  },

    gap: Gap.gap_16,  sim1SingleSim: {

    borderWidth: 1,    width: Width.width_20,

    borderColor: "rgba(0, 5, 61, 0.08)",    height: Height.height_14,

  },    overflow: "hidden",

  highlightBadge: {  },

    alignSelf: "flex-start",  bar4: {

    backgroundColor: Color.piccolo,    marginTop: -6,

    borderRadius: Border.br_16,    marginLeft: 6.4,

    paddingVertical: StyleVariable.py1,    height: Height.height_12,

    paddingHorizontal: StyleVariable.px2,  },

  },  bar3: {

  highlightBadgeText: {    marginTop: -3.6,

    fontSize: FontSize.fs_12,    marginLeft: 1.1,

    fontFamily: FontFamily.dMSansBold,    height: 10,

    color: Color.mainGoten,  },

    lineHeight: LineHeight.lh_16,  bar2: {

  },    marginTop: -1,

  highlightTitle: {    marginLeft: -4.2,

    fontSize: FontSize.fs_16,    height: 7,

    lineHeight: LineHeight.lh_24,  },

    fontFamily: FontFamily.dMSansBold,  bar1: {

    color: Color.hit,    marginTop: 1.4,

  },    marginLeft: -9.6,

  highlightDescription: {    height: 5,

    fontSize: FontSize.fs_12,  },

    lineHeight: LineHeight.lh_16,  networkWifiFull: {

    fontFamily: FontFamily.dMSansRegular,    height: Height.height_12,

    color: Color.mainTrunks,    width: Width.width_20,

  },  },

  highlightLink: {  batteryFullUncharged: {

    flexDirection: "row",    width: Width.width_28,

    alignItems: "center",    height: Height.height_14,

    gap: Gap.gap_8,  },

  },  titleWrapper: {

  highlightLinkText: {    justifyContent: "center",

    fontSize: FontSize.fs_12,    alignSelf: "stretch",

    fontFamily: FontFamily.dMSansBold,    alignItems: "center",

    color: Color.piccolo,  },

  },  title: {

  logoutButton: {    paddingVertical: Padding.padding_16,

    marginTop: Gap.gap_8,    justifyContent: "center",

    flexDirection: "row",    flex: 1,

    alignItems: "center",  },

    justifyContent: "center",  olJoo: {

    gap: Gap.gap_8,    textAlign: "left",

    backgroundColor: Color.piccolo,    fontSize: FontSize.fs_24,

    borderRadius: Border.br_16,    fontFamily: FontFamily.dMSansBold,

    paddingVertical: StyleVariable.py4,    fontWeight: "700",

    paddingHorizontal: StyleVariable.px4,    lineHeight: LineHeight.lh_32,

  },    color: Color.hit,

  logoutText: {    flex: 1,

    fontSize: FontSize.fs_14,  },

    fontFamily: FontFamily.dMSansBold,  illustrationIcon: {

    color: Color.mainGoten,    width: Width.width_80,

  },    height: 96,

  logoutSpinner: {    display: "none",

    marginLeft: Gap.gap_8,  },

  },  mdsPublicTwAvatarParent: {

  brandFooter: {    width: 64,

    alignItems: "center",    height: 70,

    gap: Gap.gap_8,  },

    marginTop: Gap.gap_16,  mdsPublicTwAvatarIcon: {

  },    left: 0,

  brandLogo: {    borderRadius: StyleVariable.surfaceBorderRadiusRadiusSRounded,

    width: 80,    width: StyleVariable.heightH16,

    height: 80,    height: StyleVariable.heightH16,

  },  },

  brandTagline: {  initials: {

    fontSize: FontSize.fs_12,    top: 8,

    fontFamily: FontFamily.dMSansRegular,    left: 8,

    color: Color.mainTrunks,    fontSize: 20,

    letterSpacing: 1,    display: "flex",

  },    width: 48,

});    height: 48,

    textAlign: "center",

export default PerfilScreen;    color: Color.mainBulma,

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

export default Perfil;
