import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getEnvironment, subscribeEnvironment } from "../services/environment";
import type { AppEnvironment } from "../services/environmentConfig";

/** Faixa fixa no topo quando o app está apontando para a HOMOLOGAÇÃO, para ninguém confundir com a produção. */
export default function EnvironmentBanner() {
  const insets = useSafeAreaInsets();
  const [env, setEnv] = useState<AppEnvironment | null>(null);

  useEffect(() => {
    let mounted = true;
    getEnvironment().then((value) => mounted && setEnv(value));
    const unsubscribe = subscribeEnvironment((value) => mounted && setEnv(value));
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (!env || env.name !== "staging") {
    return null;
  }

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 4 }]} pointerEvents="none">
      <Text style={styles.text}>HOMOLOGAÇÃO — dados de teste</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: "#E07B00", paddingBottom: 4, alignItems: "center" },
  text: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
});
