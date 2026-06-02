import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Color, FontFamily, FontSize } from "../GlobalStyles";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Boundary global: captura erros de render em qualquer tela e mostra um fallback
 * (em vez de o app fechar sozinho). Loga o stack para diagnóstico.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Mantém o stack acessível no logcat/Xcode/Metro para identificarmos a causa.
    console.error("[ErrorBoundary] Uncaught render error:", error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Ionicons name="alert-circle-outline" size={56} color={Color.supportiveChichi} />
          <Text style={styles.title}>Algo deu errado</Text>
          <Text style={styles.subtitle}>
            Encontramos um erro inesperado nesta tela. Você pode tentar novamente.
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
    backgroundColor: Color.mainGohan,
  },
  title: { fontSize: FontSize.fs_18, fontFamily: FontFamily.dMSansBold, color: Color.hit },
  subtitle: {
    fontSize: FontSize.fs_14,
    color: Color.mainTrunks,
    textAlign: "center",
    fontFamily: FontFamily.dMSansRegular,
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Color.piccolo,
  },
  buttonText: { color: Color.mainGoten, fontFamily: FontFamily.dMSansBold, fontSize: FontSize.fs_16 },
});
