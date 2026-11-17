import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Color, FontFamily, FontSize } from "../GlobalStyles";
import { getCalendarLinks } from "../services/appointments";
import type { CalendarLinksResponse } from "../types/api";

/**
 * "Salvar na sua agenda": Google Agenda e arquivo .ics (Apple Calendar, Outlook). Os links vêm do backend e não
 * exigem login Google nem dão acesso à conta do cliente.
 */
export default function AddToCalendar({ appointmentId }: { appointmentId: number }) {
  const [links, setLinks] = useState<CalendarLinksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getCalendarLinks(appointmentId)
      .then((data) => mounted && setLinks(data))
      .catch(() => mounted && setLinks(null))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [appointmentId]);

  const open = async (url: string) => {
    setError(null);
    try {
      await Linking.openURL(url);
    } catch {
      setError("Não foi possível abrir o link. Tente novamente.");
    }
  };

  if (loading) {
    return <ActivityIndicator size="small" color={Color.piccolo} />;
  }
  if (!links) {
    return null; // sem links (ex.: agendamento antigo ou rede): não polui a tela
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Salvar na sua agenda</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} activeOpacity={0.9} onPress={() => open(links.googleCalendarUrl)}>
          <Ionicons name="logo-google" size={16} color={Color.piccolo} />
          <Text style={styles.buttonText}>Google Agenda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} activeOpacity={0.9} onPress={() => open(links.icsUrl)}>
          <Ionicons name="calendar-outline" size={16} color={Color.piccolo} />
          <Text style={styles.buttonText}>Apple / Outlook</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 10, marginTop: 8 },
  title: { fontFamily: FontFamily.dMSansBold, fontSize: FontSize.fs_14, color: Color.mainBulma },
  row: { flexDirection: "row", gap: 10 },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Color.mainBeerus,
    backgroundColor: Color.mainGoten,
  },
  buttonText: { fontFamily: FontFamily.dMSansBold, fontSize: FontSize.fs_14, color: Color.piccolo },
  error: { color: "#D7263D", fontSize: FontSize.fs_14 },
});
